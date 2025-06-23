import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { CowData, getAllCows, getCowById, updateCow } from '../services/CowDataService';


// Mock data for a single cow - in a real app, this would come from a service
const mockCowDetail = {
  id: 'cow3',
  name: 'Buttercup',
  activityLevel: 5.1,
  stressLevel: 8.7,
  heartRate: 95,
  anomalyScore: 0.85,
  location: { x: 12, y: 78 },
  lastUpdated: new Date().toISOString(),
  gpsCoordinates: {
    latitude: 34.0522,
    longitude: -118.2437
  },
  healthStatus: 'Warning',
  behaviorHistory: [
    { date: '2023-10-01', activityLevel: 6.2, stressLevel: 3.1, heartRate: 72 },
    { date: '2023-10-02', activityLevel: 5.8, stressLevel: 4.2, heartRate: 75 },
    { date: '2023-10-03', activityLevel: 6.5, stressLevel: 3.8, heartRate: 70 },
    { date: '2023-10-04', activityLevel: 7.1, stressLevel: 5.2, heartRate: 78 },
    { date: '2023-10-05', activityLevel: 6.8, stressLevel: 6.5, heartRate: 82 },
    { date: '2023-10-06', activityLevel: 5.9, stressLevel: 7.8, heartRate: 88 },
    { date: '2023-10-07', activityLevel: 5.1, stressLevel: 8.7, heartRate: 95 }
  ],
  anomalyAlerts: [
    { 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      type: 'behavior',
      message: 'Unusual pacing pattern detected',
      severity: 'Warning',
      confidence: 0.72
    },
    { 
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: 'health',
      message: 'Elevated heart rate',
      severity: 'Warning',
      confidence: 0.68
    },
    { 
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      type: 'earthquake',
      message: 'Potential seismic activity precursor',
      severity: 'Critical',
      confidence: 0.91
    }
  ],
  herdComparison: {
    activityLevel: { herdAvg: 6.2, percentile: 35 },
    stressLevel: { herdAvg: 4.8, percentile: 92 },
    heartRate: { herdAvg: 75, percentile: 90 }
  }
};

// Chart component for historical data with day names
const HistoricalChart = ({ data, dataKey, color, title }) => {
  console.log(`${title} - Data:`, data);
  
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.noDataText}>אין נתונים היסטוריים</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map(item => item.dayName || item.date.split('-')[2]),
    datasets: [
      {
        data: data.map(item => item[dataKey]),
        color: () => color,
        strokeWidth: 3
      }
    ],
    legend: [title]
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: () => color,
    labelColor: () => '#333333',
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color
    },
    fromZero: true,
    segments: dataKey === 'heartRate' ? 6 : 5
  };

  return (
    <View style={styles.chartWrapper}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Text style={styles.debugText}>Data points: {data.length}</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
};

// Alert item component
const AlertItem = ({ alert }) => (
  <View style={[
    styles.alertItem,
    { borderLeftColor: alert.severity === 'Critical' ? '#ff6b6b' : '#ffa94d' }
  ]}>
    <View style={styles.alertHeader}>
      <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
      <Text style={styles.alertTime}>
        {new Date(alert.timestamp).toLocaleTimeString()}
      </Text>
    </View>
    <Text style={styles.alertMessage}>{alert.message}</Text>
    <View style={styles.alertFooter}>
      <Text style={styles.alertSeverity}>
        {alert.severity} ({(alert.confidence * 100).toFixed(0)}% confidence)
      </Text>
    </View>
  </View>
);

// Comparison bar component
const ComparisonBar = ({ label, value, average, percentile }) => (
  <View style={styles.comparisonContainer}>
    <View style={styles.comparisonHeader}>
      <Text style={styles.comparisonLabel}>{label}</Text>
      <Text style={styles.comparisonPercentile}>
        {percentile}th percentile
      </Text>
    </View>
    <View style={styles.comparisonBarContainer}>
      <View style={styles.comparisonBarBackground}>
        <View 
          style={[
            styles.comparisonBarFill,
            { width: `${percentile}%`, backgroundColor: percentile > 75 ? '#ff6b6b' : '#4dabf7' }
          ]} 
        />
        <View 
          style={[
            styles.comparisonAvgMarker,
            { left: `${(average / 10) * 100}%` }
          ]} 
        />
      </View>
      <View style={styles.comparisonValues}>
        <Text style={styles.comparisonValue}>You: {value.toFixed(1)}</Text>
        <Text style={styles.comparisonAvg}>Herd avg: {average.toFixed(1)}</Text>
      </View>
    </View>
  </View>
);

const CowDetailScreen = ({ route }) => {
  // Get cowId from route params or URL params
  const cowId = route?.params?.cowId || 
               (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('cowId') : null) || 
               'cow1'; // ברירת מחדל
  const [cowData, setCowData] = useState<CowData | null>(null);
  const [allCows, setAllCows] = useState<CowData[]>([]);
  const [selectedCowId, setSelectedCowId] = useState(cowId);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newDataPoint, setNewDataPoint] = useState({
    activityLevel: '',
    stressLevel: '',
    heartRate: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchCowDetails = () => {
    const cow = getCowById(selectedCowId);
    const cows = getAllCows();
    if (cow) {
      setCowData(cow);
      // יצירת נתונים היסטוריים אם לא קיימים
      if (!cow.historicalData || cow.historicalData.length === 0) {
        initializeHistoricalData(cow);
      } else {
        // עדכון הנתונים ההיסטוריים מהפרה
        setHistoricalData([...cow.historicalData]);
      }
    }
    setAllCows(cows);
    setLoading(false);
  };

  useEffect(() => {
    fetchCowDetails();
  }, [selectedCowId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCowDetails();
    }, [selectedCowId])
  );

  const initializeHistoricalData = (cow) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        dayName: days[date.getDay()],
        activityLevel: cow.activityLevel + (Math.random() - 0.5) * 2,
        stressLevel: cow.stressLevel + (Math.random() - 0.5) * 2,
        heartRate: cow.heartRate + Math.floor((Math.random() - 0.5) * 20)
      });
    }
    
    setHistoricalData(data);
    // שמירה בנתוני הפרה
    updateCow(cow.id, { ...cow, historicalData: data });
  };

  const handleAddDataPoint = () => {
    console.log('handleAddDataPoint called with:', newDataPoint);
    
    if (!newDataPoint.activityLevel || !newDataPoint.stressLevel || !newDataPoint.heartRate) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    try {
      const dataPoint = {
        date: newDataPoint.date,
        dayName: new Date(newDataPoint.date).toLocaleDateString('he-IL', { weekday: 'long' }),
        activityLevel: parseFloat(newDataPoint.activityLevel),
        stressLevel: parseFloat(newDataPoint.stressLevel),
        heartRate: parseInt(newDataPoint.heartRate)
      };
      
      console.log('Created dataPoint:', dataPoint);
      console.log('Current historicalData:', historicalData);

      // הסרת נתון קיים באותו תאריך אם קיים
      const filteredData = historicalData.filter(item => item.date !== newDataPoint.date);
      const updatedData = [...filteredData, dataPoint].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      console.log('Updated data:', updatedData);
      
      // סגירת המודל מיד
      setShowAddDataModal(false);
      
      // עדכון נתוני הפרה בשירות
      if (cowData) {
        updateCow(selectedCowId, { ...cowData, historicalData: updatedData });
      }
      
      // עדכון הנתונים המקומיים וכפיית ריענון
      const newRefreshKey = Date.now();
      setRefreshKey(newRefreshKey);
      setHistoricalData([]);
      setTimeout(() => setHistoricalData(updatedData), 100);
      
      // ניקוי השדות
      setNewDataPoint({
        activityLevel: '',
        stressLevel: '',
        heartRate: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      Alert.alert('הצלחה', `נתון חדש נוסף!\nתאריך: ${newDataPoint.date}\nפעילות: ${newDataPoint.activityLevel}`);
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בשמירת הנתון');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>טוען נתוני פרה...</Text>
      </View>
    );
  }

  if (!cowData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>פרה לא נמצאה</Text>
      </View>
    );
  }

  const getHealthStatus = () => {
    if (cowData.anomalyScore > 0.8) return { text: 'Critical', color: '#ff6b6b' };
    if (cowData.anomalyScore > 0.7) return { text: 'Warning', color: '#ffa94d' };
    if (cowData.anomalyScore > 0.5) return { text: 'Caution', color: '#ffd43b' };
    return { text: 'Normal', color: '#51cf66' };
  };

  const healthStatus = getHealthStatus();

  return (
    <>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.cowName}>{cowData.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: healthStatus.color }
        ]}>
          <Text style={styles.statusText}>{healthStatus.text}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]} 
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>Alerts</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && (
        <View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Activity Level</Text>
              <Text style={[
                styles.statValue,
                { color: cowData.activityLevel > 8 || cowData.activityLevel < 2 ? '#ff6b6b' : 'black' }
              ]}>
                {cowData.activityLevel.toFixed(1)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Stress Level</Text>
              <Text style={[
                styles.statValue, 
                { color: cowData.stressLevel > 7 ? '#ff6b6b' : 'black' }
              ]}>
                {cowData.stressLevel.toFixed(1)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Heart Rate</Text>
              <Text style={[
                styles.statValue, 
                { color: cowData.heartRate > 90 || cowData.heartRate < 50 ? '#ff6b6b' : 'black' }
              ]}>
                {cowData.heartRate}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Anomaly Score</Text>
              <Text style={[
                styles.statValue, 
                { color: cowData.anomalyScore > 0.7 ? '#ff6b6b' : 'black' }
              ]}>
                {cowData.anomalyScore.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Location</Text>
              <Text style={styles.statValue}>{cowData.location}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Sensor ID</Text>
              <Text style={styles.statValue}>{cowData.sensorId}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Last Updated</Text>
              <Text style={styles.statValue}>
                {new Date(cowData.lastUpdated).toLocaleTimeString()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {cowData.recentEvents && cowData.recentEvents.length > 0 ? (
            cowData.recentEvents.slice(0, 3).map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Text style={styles.eventType}>{event.type.toUpperCase()}</Text>
                <Text style={styles.eventValue}>{event.value}</Text>
                <Text style={styles.eventTime}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noEventsText}>אין אירועים אחרונים</Text>
          )}
          
          <Text style={styles.sectionTitle}>All Cows</Text>
          {allCows.map(cow => (
            <TouchableOpacity 
              key={cow.id} 
              style={[
                styles.cowListItem,
                cow.id === selectedCowId && styles.selectedCow
              ]}
              onPress={() => {
                const newCow = getCowById(cow.id);
                if (newCow) {
                  setCowData(newCow);
                  setSelectedCowId(cow.id);
                }
              }}
            >
              <Text style={styles.cowListName}>{cow.name}</Text>
              <Text style={styles.cowListStats}>
                Activity: {cow.activityLevel.toFixed(1)} • 
                Stress: {cow.stressLevel.toFixed(1)} • 
                HR: {cow.heartRate}
              </Text>
              <Text style={[
                styles.cowListScore,
                { color: cow.anomalyScore > 0.7 ? '#ff6b6b' : '#666' }
              ]}>
                Score: {cow.anomalyScore.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}


        </View>
      )}

      {activeTab === 'history' && (
        <View>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>נתונים היסטוריים</Text>
            <TouchableOpacity 
              style={styles.addDataButton} 
              onPress={() => {
                Alert.alert('בדיקה', 'כפתור הוסף נתון נלחץ!');
                setShowAddDataModal(true);
              }}
            >
              <Text style={styles.addDataButtonText}>+ הוסף נתון</Text>
            </TouchableOpacity>
          </View>
          
          <HistoricalChart 
            key={`activity-${refreshKey}`}
            data={historicalData} 
            dataKey="activityLevel" 
            color="#4dabf7" 
            title="רמת פעילות"
          />
          
          <HistoricalChart 
            key={`stress-${refreshKey}`}
            data={historicalData} 
            dataKey="stressLevel" 
            color="#ffa94d" 
            title="רמת לחץ"
          />
          
          <HistoricalChart 
            key={`heart-${refreshKey}`}
            data={historicalData} 
            dataKey="heartRate" 
            color="#ff6b6b" 
            title="דופק (BPM)"
          />
        </View>
      )}

      {activeTab === 'alerts' && (
        <View>
          <Text style={styles.sectionTitle}>Alert Information</Text>
          <View style={styles.alertInfoCard}>
            <Text style={styles.cardTitle}>מצב נוכחי</Text>
            <Text style={styles.alertStatus}>
              ציון אנומליה: {cowData.anomalyScore.toFixed(2)}
            </Text>
            <Text style={styles.alertStatus}>
              סטטוס: {healthStatus.text}
            </Text>
            
            {cowData.anomalyScore > 0.7 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ הפרה מראה התנהגות חריגה ודורשת תשומת לב
                </Text>
                {cowData.stressLevel > 7 && (
                  <Text style={styles.warningDetail}>• רמת לחץ גבוהה</Text>
                )}
                {(cowData.activityLevel > 8 || cowData.activityLevel < 2) && (
                  <Text style={styles.warningDetail}>• רמת פעילות חריגה</Text>
                )}
                {(cowData.heartRate > 90 || cowData.heartRate < 50) && (
                  <Text style={styles.warningDetail}>• דופק חריג</Text>
                )}

              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
    
    <Modal
      visible={showAddDataModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddDataModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>הוסף נתון חדש</Text>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>תאריך</Text>
            <TextInput
              style={styles.modalInput}
              value={newDataPoint.date}
              onChangeText={(text) => setNewDataPoint({...newDataPoint, date: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>רמת פעילות (0-10)</Text>
            <TextInput
              style={styles.modalInput}
              value={newDataPoint.activityLevel}
              onChangeText={(text) => setNewDataPoint({...newDataPoint, activityLevel: text})}
              keyboardType="numeric"
              placeholder="5.0"
            />
          </View>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>רמת לחץ (0-10)</Text>
            <TextInput
              style={styles.modalInput}
              value={newDataPoint.stressLevel}
              onChangeText={(text) => setNewDataPoint({...newDataPoint, stressLevel: text})}
              keyboardType="numeric"
              placeholder="3.0"
            />
          </View>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>דופק (BPM)</Text>
            <TextInput
              style={styles.modalInput}
              value={newDataPoint.heartRate}
              onChangeText={(text) => setNewDataPoint({...newDataPoint, heartRate: text})}
              keyboardType="numeric"
              placeholder="70"
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={() => {
                setShowAddDataModal(false);
                Alert.alert('בדיקה', 'כפתור ביטול עובד!');
              }}
            >
              <Text style={styles.modalCancelText}>ביטול</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalSaveButton, { backgroundColor: '#ff0000' }]} 
              onPress={() => {
                setShowAddDataModal(false);
                Alert.alert('בדיקה', 'כפתור שמירה עובד!', [
                  { text: 'OK', onPress: () => handleAddDataPoint() }
                ]);
              }}
            >
              <Text style={styles.modalSaveText}>שמור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cowName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4dabf7',
  },
  tabText: {
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  alertItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertType: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  viewAllText: {
    color: '#495057',
    fontWeight: '500',
  },
  comparisonContainer: {
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
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  comparisonLabel: {
    fontWeight: '500',
  },
  comparisonPercentile: {
    fontSize: 12,
    color: '#666',
  },
  comparisonBarContainer: {
    marginBottom: 8,
  },
  comparisonBarBackground: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  comparisonBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  comparisonAvgMarker: {
    position: 'absolute',
    height: '100%',
    width: 2,
    backgroundColor: 'black',
  },
  comparisonValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  comparisonValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  comparisonAvg: {
    fontSize: 12,
    color: '#666',
  },
  eventItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  eventType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4dabf7',
    marginBottom: 4,
  },
  eventValue: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  infoText: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  currentDataCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alertInfoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  alertStatus: {
    fontSize: 16,
    marginBottom: 8,
  },
  warningBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  warningText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#d63384',
  },
  warningDetail: {
    fontSize: 12,
    color: '#d63384',
    marginBottom: 4,
  },
  cowListItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedCow: {
    borderWidth: 2,
    borderColor: '#4dabf7',
  },
  cowListName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cowListStats: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cowListScore: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addDataButton: {
    backgroundColor: '#4dabf7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addDataButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chartWrapper: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  modalCancelText: {
    textAlign: 'center',
    color: '#666',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#4dabf7',
  },
  modalSaveText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default CowDetailScreen;