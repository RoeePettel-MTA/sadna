import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

// Mock data for alerts
const mockAlerts = [
  {
    id: 'alert1',
    cowId: 'cow3',
    cowName: 'Buttercup',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: 'behavior',
    message: 'Unusual activity pattern detected',
    severity: 'Warning',
    confidence: 0.85,
    acknowledged: false
  },
  {
    id: 'alert2',
    cowId: 'cow4',
    cowName: 'Clover',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    type: 'health',
    message: 'Elevated heart rate sustained for 10+ minutes',
    severity: 'Warning',
    confidence: 0.72,
    acknowledged: false
  },
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
  },
  {
    id: 'alert4',
    cowId: 'cow1',
    cowName: 'Bessie',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'health',
    message: 'Decreased water intake',
    severity: 'Normal',
    confidence: 0.65,
    acknowledged: true
  },
  {
    id: 'alert5',
    cowId: 'cow5',
    cowName: 'Milky',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'behavior',
    message: 'Unusual resting pattern',
    severity: 'Warning',
    confidence: 0.68,
    acknowledged: false
  }
];

// Alert item component
const AlertItem = ({ alert, onAcknowledge, onViewCow }) => {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'earthquake':
        return 'warning';
      case 'health':
        return 'medkit';
      case 'behavior':
        return 'analytics';
      default:
        return 'alert-circle';
    }
  };
  
  const getAlertColor = () => {
    switch (alert.severity) {
      case 'Critical':
        return '#ff6b6b';
      case 'Warning':
        return '#ffa94d';
      default:
        return '#4dabf7';
    }
  };
  
  return (
    <View style={[
      styles.alertItem,
      { borderLeftColor: getAlertColor() }
    ]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTypeContainer}>
          <Ionicons name={getAlertIcon()} size={20} color={getAlertColor()} style={styles.alertIcon} />
          <Text style={[styles.alertType, { color: getAlertColor() }]}>
            {alert.type.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.alertTime}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      
      <Text style={styles.alertMessage}>{alert.message}</Text>
      
      <View style={styles.alertMeta}>
        <Text style={styles.alertCow}>
          <Text style={styles.boldText}>Cow:</Text> {alert.cowName}
        </Text>
        <Text style={styles.alertConfidence}>
          <Text style={styles.boldText}>Confidence:</Text> {(alert.confidence * 100).toFixed(0)}%
        </Text>
      </View>
      
      <View style={styles.alertActions}>
        <TouchableOpacity 
          style={styles.alertAction} 
          onPress={() => onViewCow(alert.cowId)}
        >
          <Ionicons name="eye" size={18} color="#4dabf7" />
          <Text style={styles.alertActionText}>View Cow</Text>
        </TouchableOpacity>
        
        {!alert.acknowledged && (
          <TouchableOpacity 
            style={styles.alertAction} 
            onPress={() => onAcknowledge(alert.id)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#51cf66" />
            <Text style={styles.alertActionText}>Acknowledge</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const AlertsScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  useEffect(() => {
    // In a real app, fetch alerts from API
    // const fetchAlerts = async () => {
    //   const response = await fetch('your-api/alerts');
    //   const data = await response.json();
    //   setAlerts(data);
    // };
    // fetchAlerts();
    
    // Set up real-time updates
    const intervalId = setInterval(() => {
      // In a real app, fetch new alerts
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleAcknowledge = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };
  
  const handleViewCow = (cowId) => {
    // Navigate to cow detail screen
    navigation.navigate('CowDetail', { cowId });
  };
  
  // Filter alerts based on user preferences
  const filteredAlerts = alerts.filter(alert => {
    if (!showAcknowledged && alert.acknowledged) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    return true;
  });
  
  // Sort alerts by timestamp (newest first) and severity
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // First sort by severity (Critical first)
    if (a.severity === 'Critical' && b.severity !== 'Critical') return -1;
    if (a.severity !== 'Critical' && b.severity === 'Critical') return 1;
    
    // Then sort by timestamp
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  // Count alerts by severity
  const criticalCount = alerts.filter(a => a.severity === 'Critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === 'Warning' && !a.acknowledged).length;
  const normalCount = alerts.filter(a => a.severity === 'Normal' && !a.acknowledged).length;
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Alert System</Text>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderColor: '#ff6b6b' }]}>
          <Text style={[styles.statValue, { color: '#ff6b6b' }]}>{criticalCount}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#ffa94d' }]}>
          <Text style={[styles.statValue, { color: '#ffa94d' }]}>{warningCount}</Text>
          <Text style={styles.statLabel}>Warning</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#4dabf7' }]}>
          <Text style={[styles.statValue, { color: '#4dabf7' }]}>{normalCount}</Text>
          <Text style={styles.statLabel}>Normal</Text>
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Show Acknowledged:</Text>
          <Switch
            value={showAcknowledged}
            onValueChange={setShowAcknowledged}
            trackColor={{ false: '#767577', true: '#4dabf7' }}
            thumbColor="#f4f3f4"
          />
        </View>
        
        <Text style={styles.filterGroupLabel}>Severity:</Text>
        <View style={styles.filterButtonGroup}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterSeverity === 'all' && styles.activeFilterButton
            ]}
            onPress={() => setFilterSeverity('all')}
          >
            <Text style={[
              styles.filterButtonText,
              filterSeverity === 'all' && styles.activeFilterButtonText
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterSeverity === 'Critical' && styles.activeFilterButton,
              { borderColor: '#ff6b6b' }
            ]}
            onPress={() => setFilterSeverity('Critical')}
          >
            <Text style={[
              styles.filterButtonText,
              filterSeverity === 'Critical' && styles.activeFilterButtonText,
              { color: filterSeverity === 'Critical' ? 'white' : '#ff6b6b' }
            ]}>Critical</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterSeverity === 'Warning' && styles.activeFilterButton,
              { borderColor: '#ffa94d' }
            ]}
            onPress={() => setFilterSeverity('Warning')}
          >
            <Text style={[
              styles.filterButtonText,
              filterSeverity === 'Warning' && styles.activeFilterButtonText,
              { color: filterSeverity === 'Warning' ? 'white' : '#ffa94d' }
            ]}>Warning</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.filterGroupLabel}>Type:</Text>
        <View style={styles.filterButtonGroup}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterType === 'all' && styles.activeFilterButton
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[
              styles.filterButtonText,
              filterType === 'all' && styles.activeFilterButtonText
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterType === 'earthquake' && styles.activeFilterButton
            ]}
            onPress={() => setFilterType('earthquake')}
          >
            <Text style={[
              styles.filterButtonText,
              filterType === 'earthquake' && styles.activeFilterButtonText
            ]}>Earthquake</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterType === 'health' && styles.activeFilterButton
            ]}
            onPress={() => setFilterType('health')}
          >
            <Text style={[
              styles.filterButtonText,
              filterType === 'health' && styles.activeFilterButtonText
            ]}>Health</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterType === 'behavior' && styles.activeFilterButton
            ]}
            onPress={() => setFilterType('behavior')}
          >
            <Text style={[
              styles.filterButtonText,
              filterType === 'behavior' && styles.activeFilterButtonText
            ]}>Behavior</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>
        {sortedAlerts.length} {sortedAlerts.length === 1 ? 'Alert' : 'Alerts'}
      </Text>
      
      {sortedAlerts.map(alert => (
        <AlertItem 
          key={alert.id} 
          alert={alert} 
          onAcknowledge={handleAcknowledge}
          onViewCow={handleViewCow}
        />
      ))}
      
      {sortedAlerts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color="#51cf66" />
          <Text style={styles.emptyStateText}>No alerts match your filters</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
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
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
  },
  filterGroupLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4dabf7',
    borderColor: '#4dabf7',
  },
  filterButtonText: {
    color: '#495057',
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: 6,
  },
  alertType: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 12,
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertCow: {
    fontSize: 14,
    color: '#495057',
  },
  alertConfidence: {
    fontSize: 14,
    color: '#495057',
  },
  boldText: {
    fontWeight: 'bold',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  alertAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  alertActionText: {
    marginLeft: 4,
    color: '#495057',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default AlertsScreen;