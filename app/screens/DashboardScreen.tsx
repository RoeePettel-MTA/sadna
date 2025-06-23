import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { monitorAndAlert } from '../services/AnomalyDetectionService';
import { registerForPushNotificationsAsync, getEarthquakeAlert, clearEarthquakeAlert } from '../services/NotificationService';
import { getAllCows, CowData } from '../services/CowDataService';


// Import Ionicons only for mobile platforms
let Ionicons;
if (Platform.OS !== 'web') {
  Ionicons = require('@expo/vector-icons').Ionicons;
}



const mockAlerts = [
  {
    id: 'alert3',
    cowId: 'cow3',
    cowName: 'Buttercup',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    type: 'earthquake',
    message: 'Potential seismic activity precursor detected',
    severity: 'Critical',
    confidence: 0.91,
    acknowledged: false
  }
];

// Simple chart component for activity levels
const LineChart = ({ data }) => {
  const maxHeight = 120; // גובה מקסימלי של הגרף
  const maxValue = Math.max(...data.map(item => item.value), 10); // ערך מקסימלי או 10
  
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartContent}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * maxHeight;
          return (
            <View key={item.id} style={styles.chartBarContainer}>
              <Text style={styles.chartValue}>{item.value.toFixed(1)}</Text>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    height: barHeight,
                    backgroundColor: item.value > 7 ? '#ff6b6b' : '#4dabf7',
                    marginLeft: index > 0 ? 10 : 0
                  }
                ]} 
              />
            </View>
          );
        })}
      </View>
      <View style={styles.chartLabels}>
        {data.map(item => (
          <Text key={item.id} style={styles.chartLabel}>{item.name}</Text>
        ))}
      </View>
    </View>
  );
};

// Simple heatmap component for movement patterns
const HeatMap = ({ data }) => (
  <View style={styles.heatmapContainer}>
    <View style={styles.heatmapGrid}>
      {data.map(item => (
        <TouchableOpacity 
          key={item.id}
          style={[
            styles.heatmapPoint,
            {
              left: `${(item.location.x / 100) * 90}%`,
              top: `${(item.location.y / 100) * 90}%`,
              backgroundColor: item.stressLevel > 7 ? '#ff6b6b' : 
                              item.stressLevel > 5 ? '#ffa94d' : '#4dabf7',
              width: item.activityLevel * 4,
              height: item.activityLevel * 4,
            }
          ]}
        >
          <Text style={styles.heatmapLabel}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// Activity timeline component
const ActivityTimeline = ({ events }) => (
  <View style={styles.timelineContainer}>
    {events.map((event, index) => (
      <View key={index} style={styles.timelineEvent}>
        <View style={[
          styles.timelineDot, 
          { backgroundColor: event.type === 'alert' ? '#ff6b6b' : '#4dabf7' }
        ]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>{event.cowName}: {event.value}</Text>
          <Text style={styles.timelineTime}>
            {new Date(event.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    ))}
  </View>
);

// Alert banner component
const AlertBanner = ({ message, severity, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.alertBanner,
      { backgroundColor: severity === 'Critical' ? '#ff6b6b' : '#ffa94d' }
    ]}
    onPress={onPress}
  >
    <Text style={styles.alertText}>{message}</Text>
  </TouchableOpacity>
);

// Cow summary card component
const CowSummaryCard = ({ cow, onPress }) => (
  <TouchableOpacity style={styles.cowCard} onPress={onPress}>
    <View style={styles.cowCardHeader}>
      <Text style={styles.cowName}>{cow.name}</Text>
      <View style={[
        styles.statusIndicator, 
        { backgroundColor: cow.anomalyScore > 0.7 ? '#ff6b6b' : '#4dabf7' }
      ]} />
    </View>
    
    <View style={styles.cowCardStats}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Activity</Text>
        <Text style={[
          styles.statValue,
          { color: cow.activityLevel > 8 || cow.activityLevel < 2 ? '#ff6b6b' : 'black' }
        ]}>
          {cow.activityLevel.toFixed(1)}
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Stress</Text>
        <Text style={[
          styles.statValue, 
          { color: cow.stressLevel > 7 ? '#ff6b6b' : 'black' }
        ]}>
          {cow.stressLevel.toFixed(1)}
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Heart Rate</Text>
        <Text style={[
          styles.statValue,
          { color: cow.heartRate > 90 || cow.heartRate < 50 ? '#ff6b6b' : 'black' }
        ]}>
          {cow.heartRate}
        </Text>
      </View>

    </View>
    
    <Text style={styles.lastEvent}>
      Last: {cow.recentEvents[0]?.value || 'No events'} 
      ({new Date(cow.recentEvents[0]?.timestamp || Date.now()).toLocaleTimeString()})
    </Text>
  </TouchableOpacity>
);

const DashboardScreen: React.FC = () => {
  const [cowData, setCowData] = useState<CowData[]>([]);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [earthquakeAlert, setEarthquakeAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    // רישום להתראות רק במובייל
    const setupNotifications = async () => {
      try {
        if (Platform.OS !== 'web') {
          const token = await registerForPushNotificationsAsync();
          setPushToken(token);
        }
      } catch (error) {
        console.log('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cows = getAllCows();
        setCowData(cows);
        await monitorAndAlert(cows);
        
        // בדיקת התראות רעידת אדמה
        const alert = getEarthquakeAlert();
        setEarthquakeAlert(alert);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // טעינה ראשונית
    fetchData();
    
    // עדכון כל 10 שניות לזיהוי מהיר של פרות חדשות
    const interval = setInterval(() => {
      const updatedCows = getAllCows();
      setCowData(updatedCows);
      // בדיקת התראות רעידת אדמה מחדש
      const alert = getEarthquakeAlert();
      setEarthquakeAlert(alert);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Get all events from all cows for the timeline
  const allEvents = cowData.flatMap(cow => 
    cow.recentEvents.map(event => ({
      cowName: cow.name,
      ...event
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleAlertPress = () => {
    Alert.alert(
      'התראת חירום: חשש לרעידת אדמה',
      'זוהתה התנהגות חריגה בקרב הפרות המעידה על חשש לרעידת אדמה. האם ברצונך לצפות בפרטים נוספים?',
      [
        { text: 'לא', style: 'cancel' },
        { text: 'כן', onPress: () => router.push('/screens/AnomalyDetectionScreen') }
      ]
    );
  };

  const handleCowPress = (cow) => {
    router.push(`/(drawer)/CowDetail?cowId=${cow.id}`);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Cow Behavior Monitoring</Text>
      
      {earthquakeAlert?.active && (
        <AlertBanner 
          message={earthquakeAlert?.active ? earthquakeAlert.title : "⚠️ התראת חירום: חשש לרעידת אדמה!"} 
          severity="Critical" 
          onPress={() => {
            if (earthquakeAlert?.active) {
              Alert.alert(
                earthquakeAlert.title,
                earthquakeAlert.body,
                [
                  { text: 'סגור התראה', onPress: () => {
                    clearEarthquakeAlert();
                    setEarthquakeAlert(null);
                  }},
                  { text: 'צפה פרטים', onPress: () => router.push('/screens/AnomalyDetectionScreen') }
                ]
              );
            } else {
              handleAlertPress();
            }
          }}
        />
      )}
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{cowData.length}</Text>
              <Text style={styles.statLabel}>Monitored Cows</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{alerts.length}</Text>
              <Text style={styles.statLabel}>Active Alerts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {alerts.filter(a => a.severity === 'Critical').length}
              </Text>
              <Text style={styles.statLabel}>Critical</Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Activity Levels</Text>
          <LineChart 
            data={cowData.map(cow => ({ id: cow.id, name: cow.name, value: cow.activityLevel }))}
          />
          
          <Text style={styles.sectionTitle}>Movement Patterns</Text>
          <HeatMap data={cowData.map(cow => ({
            ...cow,
            location: cow.gpsLocation
          }))} />
          
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <ActivityTimeline events={allEvents.slice(0, 5)} />
          
          <Text style={styles.sectionTitle}>All Cows</Text>
          {cowData.map(cow => (
            <CowSummaryCard 
              key={cow.id}
              cow={cow}
              onPress={() => handleCowPress(cow)}
            />
          ))}
          

        </>
      )}
      </ScrollView>
      

    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loader: {
    marginTop: 50,
  },
  alertBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    justifyContent: 'space-around',
  },
  chartBarContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 140,
  },
  chartBar: {
    width: 30,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    width: 50,
    textAlign: 'center',
  },
  heatmapContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  heatmapGrid: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  heatmapPoint: {
    position: 'absolute',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontWeight: 'bold',
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
  },
  cowCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cowCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cowName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cowCardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  lastEvent: {
    fontSize: 12,
    color: '#666',
  },

});

export default DashboardScreen;