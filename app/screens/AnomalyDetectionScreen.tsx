import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

// Mock data for anomaly detection
const mockAnomalies = [
  {
    id: 'anomaly1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: 'earthquake',
    confidence: 0.91,
    severity: 'Critical',
    affectedCows: ['cow3', 'cow4'],
    cowNames: ['Buttercup', 'Clover'],
    description: 'Multiple cows showing coordinated stress patterns consistent with pre-seismic activity',
    mlModel: 'Random Forest',
    features: ['activity_variance', 'stress_level', 'movement_pattern', 'heart_rate'],
    status: 'active'
  },
  {
    id: 'anomaly2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    type: 'behavior',
    confidence: 0.78,
    severity: 'Warning',
    affectedCows: ['cow3'],
    cowNames: ['Buttercup'],
    description: 'Unusual pacing and elevated stress levels',
    mlModel: 'LSTM',
    features: ['activity_level', 'stress_level', 'movement_pattern'],
    status: 'active'
  },
  {
    id: 'anomaly3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    type: 'earthquake',
    confidence: 0.85,
    severity: 'Warning',
    affectedCows: ['cow1', 'cow3', 'cow5'],
    cowNames: ['Bessie', 'Buttercup', 'Milky'],
    description: 'Coordinated stress response in multiple cows',
    mlModel: 'CNN',
    features: ['activity_variance', 'stress_level', 'heart_rate'],
    status: 'resolved'
  }
];

// Feature importance visualization component
const FeatureImportance = ({ features }) => {
  // In a real app, these would be actual importance values from the ML model
  const importanceValues = {
    'activity_variance': 0.35,
    'stress_level': 0.28,
    'movement_pattern': 0.22,
    'heart_rate': 0.15
  };
  
  return (
    <View style={styles.featureContainer}>
      {features.map(feature => (
        <View key={feature} style={styles.featureItem}>
          <Text style={styles.featureLabel}>{feature.replace('_', ' ')}</Text>
          <View style={styles.featureBarContainer}>
            <View 
              style={[
                styles.featureBar, 
                { width: `${importanceValues[feature] * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.featureValue}>
            {(importanceValues[feature] * 100).toFixed(0)}%
          </Text>
        </View>
      ))}
    </View>
  );
};

// Anomaly card component
const AnomalyCard = ({ anomaly, onPress }) => (
  <TouchableOpacity style={styles.anomalyCard} onPress={onPress}>
    <View style={styles.anomalyHeader}>
      <View style={styles.anomalyTypeContainer}>
        <View style={[
          styles.anomalyTypeDot,
          { backgroundColor: anomaly.type === 'earthquake' ? '#ff6b6b' : '#ffa94d' }
        ]} />
        <Text style={styles.anomalyType}>{anomaly.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.anomalyTime}>
        {new Date(anomaly.timestamp).toLocaleTimeString()}
      </Text>
    </View>
    
    <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
    
    <View style={styles.anomalyStats}>
      <View style={styles.anomalyStat}>
        <Text style={styles.anomalyStatLabel}>Confidence</Text>
        <Text style={[
          styles.anomalyStatValue,
          { color: anomaly.confidence > 0.8 ? '#ff6b6b' : '#ffa94d' }
        ]}>
          {(anomaly.confidence * 100).toFixed(0)}%
        </Text>
      </View>
      <View style={styles.anomalyStat}>
        <Text style={styles.anomalyStatLabel}>Severity</Text>
        <Text style={[
          styles.anomalyStatValue,
          { color: anomaly.severity === 'Critical' ? '#ff6b6b' : '#ffa94d' }
        ]}>
          {anomaly.severity}
        </Text>
      </View>
      <View style={styles.anomalyStat}>
        <Text style={styles.anomalyStatLabel}>Cows</Text>
        <Text style={styles.anomalyStatValue}>{anomaly.affectedCows.length}</Text>
      </View>
    </View>
    
    <View style={styles.anomalyFooter}>
      <Text style={styles.anomalyModel}>Model: {anomaly.mlModel}</Text>
      <View style={[
        styles.anomalyStatus,
        { backgroundColor: anomaly.status === 'active' ? '#ff6b6b' : '#51cf66' }
      ]}>
        <Text style={styles.anomalyStatusText}>{anomaly.status}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Anomaly detail component
const AnomalyDetail = ({ anomaly, onClose }) => (
  <View style={styles.detailContainer}>
    <View style={styles.detailHeader}>
      <Text style={styles.detailTitle}>
        {anomaly.type.toUpperCase()} ANOMALY
      </Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.closeButton}>×</Text>
      </TouchableOpacity>
    </View>
    
    <Text style={styles.detailDescription}>{anomaly.description}</Text>
    
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>Affected Cows</Text>
      <View style={styles.cowList}>
        {anomaly.cowNames.map((name, index) => (
          <View key={index} style={styles.cowItem}>
            <Text style={styles.cowName}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
    
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>Detection Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Detected at:</Text>
        <Text style={styles.detailValue}>
          {new Date(anomaly.timestamp).toLocaleString()}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Confidence:</Text>
        <Text style={[
          styles.detailValue,
          { color: anomaly.confidence > 0.8 ? '#ff6b6b' : '#ffa94d' }
        ]}>
          {(anomaly.confidence * 100).toFixed(0)}%
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Severity:</Text>
        <Text style={[
          styles.detailValue,
          { color: anomaly.severity === 'Critical' ? '#ff6b6b' : '#ffa94d' }
        ]}>
          {anomaly.severity}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>ML Model:</Text>
        <Text style={styles.detailValue}>{anomaly.mlModel}</Text>
      </View>
    </View>
    
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>Feature Importance</Text>
      <FeatureImportance features={anomaly.features} />
    </View>
    
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.acknowledgeButton]}
        onPress={() => {/* Handle acknowledge */}}
      >
        <Text style={styles.actionButtonText}>Acknowledge</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, styles.investigateButton]}
        onPress={() => {/* Handle investigate */}}
      >
        <Text style={styles.actionButtonText}>Investigate</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const AnomalyDetectionScreen = () => {
  const [anomalies, setAnomalies] = useState(mockAnomalies);
  const [loading, setLoading] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showResolved, setShowResolved] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // In a real app, fetch anomalies from API
    const fetchAnomalies = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In production, replace with actual API calls
        // const response = await fetch('your-api-endpoint/anomalies');
        // const data = await response.json();
        // setAnomalies(data);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
    
    // Set up real-time updates
    const intervalId = setInterval(fetchAnomalies, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Filter anomalies based on user preferences
  const filteredAnomalies = anomalies.filter(anomaly => {
    if (!showResolved && anomaly.status === 'resolved') return false;
    if (filterType !== 'all' && anomaly.type !== filterType) return false;
    return true;
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Earthquake Anomaly Detection</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : selectedAnomaly ? (
        <AnomalyDetail 
          anomaly={selectedAnomaly} 
          onClose={() => setSelectedAnomaly(null)} 
        />
      ) : (
        <>
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Show Resolved:</Text>
              <Switch
                value={showResolved}
                onValueChange={setShowResolved}
                trackColor={{ false: '#767577', true: '#4dabf7' }}
                thumbColor="#f4f3f4"
              />
            </View>
            
            <View style={styles.typeFilterContainer}>
              <TouchableOpacity 
                style={[
                  styles.typeFilter, 
                  filterType === 'all' && styles.activeTypeFilter
                ]}
                onPress={() => setFilterType('all')}
              >
                <Text style={[
                  styles.typeFilterText,
                  filterType === 'all' && styles.activeTypeFilterText
                ]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.typeFilter, 
                  filterType === 'earthquake' && styles.activeTypeFilter
                ]}
                onPress={() => setFilterType('earthquake')}
              >
                <Text style={[
                  styles.typeFilterText,
                  filterType === 'earthquake' && styles.activeTypeFilterText
                ]}>Earthquake</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.typeFilter, 
                  filterType === 'behavior' && styles.activeTypeFilter
                ]}
                onPress={() => setFilterType('behavior')}
              >
                <Text style={[
                  styles.typeFilterText,
                  filterType === 'behavior' && styles.activeTypeFilterText
                ]}>Behavior</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>
            {filteredAnomalies.length} Anomalies Detected
          </Text>
          
          {filteredAnomalies.map(anomaly => (
            <AnomalyCard 
              key={anomaly.id} 
              anomaly={anomaly} 
              onPress={() => setSelectedAnomaly(anomaly)} 
            />
          ))}
          
          {filteredAnomalies.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No anomalies found</Text>
            </View>
          )}
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
    marginTop: 16,
    marginBottom: 12,
  },
  loader: {
    marginTop: 50,
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
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeFilter: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginHorizontal: 2,
    borderRadius: 4,
  },
  activeTypeFilter: {
    backgroundColor: '#4dabf7',
    borderColor: '#4dabf7',
  },
  typeFilterText: {
    color: '#495057',
  },
  activeTypeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  anomalyCard: {
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
  anomalyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  anomalyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anomalyTypeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  anomalyType: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  anomalyTime: {
    fontSize: 12,
    color: '#666',
  },
  anomalyDescription: {
    fontSize: 16,
    marginBottom: 12,
  },
  anomalyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  anomalyStat: {
    alignItems: 'center',
  },
  anomalyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  anomalyStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  anomalyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anomalyModel: {
    fontSize: 12,
    color: '#666',
  },
  anomalyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  anomalyStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailContainer: {
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
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  detailDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cowList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cowItem: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  cowName: {
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  featureContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    width: '30%',
    fontSize: 14,
  },
  featureBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  featureBar: {
    height: '100%',
    backgroundColor: '#4dabf7',
    borderRadius: 6,
  },
  featureValue: {
    width: '10%',
    fontSize: 14,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  acknowledgeButton: {
    backgroundColor: '#4dabf7',
  },
  investigateButton: {
    backgroundColor: '#ffa94d',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AnomalyDetectionScreen;