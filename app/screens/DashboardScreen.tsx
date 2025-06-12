import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { monitorAndAlert } from '../services/AnomalyDetectionService';
import { registerForPushNotificationsAsync } from '../services/NotificationService';

// Mock data - in a real app, this would be imported from a data service
const mockCowData = [
  {
    id: 'cow1',
    name: 'Bessie',
    activityLevel: 7.2,
    stressLevel: 3.5,
    heartRate: 65,
    anomalyScore: 0.2,
    location: { x: 45, y: 32 },
    lastUpdated: new Date().toISOString(),
    recentEvents: [
      { type: 'movement', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), value: 'walking' },
      { type: 'feeding', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), value: 'grazing' }
    ]
  },
  {
    id: 'cow3',
    name: 'Buttercup',
    activityLevel: 5.1,
    stressLevel: 8.7,
    heartRate: 95,
    anomalyScore: 0.85,
    location: { x: 12, y: 78 },
    lastUpdated: new Date().toISOString(),
    recentEvents: [
      { type: 'movement', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), value: 'agitated' },
      { type: 'alert', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), value: 'unusual behavior' }
    ]
  },
  {
    id: 'cow4',
    name: 'Clover',
    activityLevel: 6.3,
    stressLevel: 7.9,
    heartRate: 88,
    anomalyScore: 0.72,
    location: { x: 67, y: 22 },
    lastUpdated: new Date().toISOString(),
    recentEvents: [
      { type: 'movement', timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(), value: 'pacing' },
      { type: 'alert', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), value: 'elevated heart rate' }
    ]
  }
];

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
const LineChart = ({ data }) => (
  <View style={styles.chartContainer}>
    <View style={styles.chartContent}>
      {data.map((item, index) => (
        <View 
          key={item.id} 
          style={[
            styles.chartBar, 
            { 
              height: item.value * 10, 
              backgroundColor: item.value > 7 ? '#ff6b6b' : '#4dabf7',
              marginLeft: index > 0 ? 10 : 0
            }
          ]} 
        />
      ))}
    </View>
    <View style={styles.chartLabels}>
      {data.map(item => (
        <Text key={item.id} style={styles.chartLabel}>{item.name}</Text>
      ))}
    </View>
  </View>
);

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
        <Text style={styles.statValue}>{cow.activityLevel.toFixed(1)}</Text>
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
        <Text style={styles.statValue}>{cow.heartRate}</Text>
      </View>
    </View>
    
    <Text style={styles.lastEvent}>
      Last: {cow.recentEvents[0]?.value || 'No events'} 
      ({new Date(cow.recentEvents[0]?.timestamp || Date.now()).toLocaleTimeString()})
    </Text>
  </TouchableOpacity>
);

const DashboardScreen: React.FC = () => {
  const [cowData, setCowData] = useState(mockCowData);
  const [alerts, setAlerts] = useState(mockAlerts);
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
    // In a real app, this would fetch data from your API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // בדיקת אנומליות ושליחת התראות
        await monitorAndAlert(mockCowData);
        
        // In production, replace with actual API calls
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();
        // setCowData(data.cows);
        // setAlerts(data.alerts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time updates
    const intervalId = setInterval(fetchData, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
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
    router.push({
      pathname: '/screens/CowDetailScreen',
      params: { cowId: cow.id }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cow Behavior Monitoring</Text>
      
      {alerts.some(alert => alert.severity === 'Critical') && (
        <AlertBanner 
          message="⚠️ התראת חירום: חשש לרעידת אדמה!" 
          severity="Critical" 
          onPress={handleAlertPress}
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
          <HeatMap data={cowData} />
          
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <ActivityTimeline events={allEvents.slice(0, 5)} />
          
          <Text style={styles.sectionTitle}>Cows Requiring Attention</Text>
          {cowData
            .filter(cow => cow.stressLevel > 7 || cow.anomalyScore > 0.7)
            .map(cow => (
              <CowSummaryCard 
                key={cow.id}
                cow={cow}
                onPress={() => handleCowPress(cow)}
              />
            ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
  chartBar: {
    width: 30,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
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