import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

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

// Simple chart component for historical data
const SimpleLineChart = ({ data, dataKey, color }) => {
  const chartData = {
    labels: data.map((_, index) => `Day ${index + 1}`),
    datasets: [
      {
        data: data.map(item => item[dataKey]),
        color: () => color,
        strokeWidth: 2
      }
    ],
    legend: [`${dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}`]
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
      r: '6',
      strokeWidth: '2',
      stroke: color
    }
  };

  return (
    <LineChart
      data={chartData}
      width={Dimensions.get('window').width - 32}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16
      }}
    />
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
  // In a real app, you would get the cowId from route.params
  // const { cowId } = route.params;
  const [cowData, setCowData] = useState(mockCowDetail);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // In a real app, fetch cow details from API
    // const fetchCowDetails = async () => {
    //   const response = await fetch(`your-api/cows/${cowId}`);
    //   const data = await response.json();
    //   setCowData(data);
    // };
    // fetchCowDetails();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.cowName}>{cowData.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: cowData.healthStatus === 'Warning' ? '#ffa94d' : 
                           cowData.healthStatus === 'Critical' ? '#ff6b6b' : '#51cf66' }
        ]}>
          <Text style={styles.statusText}>{cowData.healthStatus}</Text>
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
              <Text style={styles.statValue}>{cowData.activityLevel.toFixed(1)}</Text>
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
                { color: cowData.heartRate > 85 ? '#ff6b6b' : 'black' }
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
          </View>

          <Text style={styles.sectionTitle}>Comparison to Herd</Text>
          <ComparisonBar 
            label="Activity Level" 
            value={cowData.activityLevel} 
            average={cowData.herdComparison.activityLevel.herdAvg}
            percentile={cowData.herdComparison.activityLevel.percentile}
          />
          <ComparisonBar 
            label="Stress Level" 
            value={cowData.stressLevel} 
            average={cowData.herdComparison.stressLevel.herdAvg}
            percentile={cowData.herdComparison.stressLevel.percentile}
          />
          <ComparisonBar 
            label="Heart Rate" 
            value={cowData.heartRate} 
            average={cowData.herdComparison.heartRate.herdAvg}
            percentile={cowData.herdComparison.heartRate.percentile}
          />

          <Text style={styles.sectionTitle}>Latest Alerts</Text>
          {cowData.anomalyAlerts.slice(0, 2).map((alert, index) => (
            <AlertItem key={index} alert={alert} />
          ))}
          {cowData.anomalyAlerts.length > 2 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setActiveTab('alerts')}
            >
              <Text style={styles.viewAllText}>View All Alerts</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {activeTab === 'history' && (
        <View>
          <Text style={styles.sectionTitle}>Activity Level Trend</Text>
          <SimpleLineChart 
            data={cowData.behaviorHistory} 
            dataKey="activityLevel" 
            color="#4dabf7" 
          />

          <Text style={styles.sectionTitle}>Stress Level Trend</Text>
          <SimpleLineChart 
            data={cowData.behaviorHistory} 
            dataKey="stressLevel" 
            color="#ffa94d" 
          />

          <Text style={styles.sectionTitle}>Heart Rate Trend</Text>
          <SimpleLineChart 
            data={cowData.behaviorHistory} 
            dataKey="heartRate" 
            color="#ff6b6b" 
          />
        </View>
      )}

      {activeTab === 'alerts' && (
        <View>
          <Text style={styles.sectionTitle}>All Alerts</Text>
          {cowData.anomalyAlerts.map((alert, index) => (
            <AlertItem key={index} alert={alert} />
          ))}
        </View>
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
});

export default CowDetailScreen;