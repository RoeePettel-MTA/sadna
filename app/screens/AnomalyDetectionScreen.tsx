import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { detectEarthquakePrecursor } from '../services/AnomalyDetectionService';

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
  },
  {
    id: 'cow3',
    name: 'Buttercup',
    activityLevel: 8.9,
    stressLevel: 8.7,
    heartRate: 95,
    anomalyScore: 0.85,
    location: { x: 12, y: 78 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'cow4',
    name: 'Clover',
    activityLevel: 9.1,
    stressLevel: 7.9,
    heartRate: 88,
    anomalyScore: 0.72,
    location: { x: 67, y: 22 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'cow5',
    name: 'Daisy',
    activityLevel: 8.5,
    stressLevel: 8.2,
    heartRate: 92,
    anomalyScore: 0.78,
    location: { x: 34, y: 45 },
    lastUpdated: new Date().toISOString(),
  }
];

const AnomalyDetectionScreen = () => {
  const [loading, setLoading] = useState(true);
  const [earthquakeRisk, setEarthquakeRisk] = useState(null);
  const [anomalyCows, setAnomalyCows] = useState([]);

  useEffect(() => {
    const analyzeData = async () => {
      setLoading(true);
      try {
        // בדיקת חשש לרעידת אדמה
        const risk = await detectEarthquakePrecursor(mockCowData);
        setEarthquakeRisk(risk);
        
        // מיון הפרות לפי רמת האנומליה
        const sortedCows = [...mockCowData].sort((a, b) => b.anomalyScore - a.anomalyScore);
        setAnomalyCows(sortedCows);
      } catch (error) {
        console.error('Error analyzing data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeData();
  }, []);

  const getRiskLevel = (confidence) => {
    if (confidence > 0.9) return 'קריטי';
    if (confidence > 0.8) return 'גבוה מאוד';
    if (confidence > 0.7) return 'גבוה';
    if (confidence > 0.5) return 'בינוני';
    return 'נמוך';
  };

  const getRiskColor = (confidence) => {
    if (confidence > 0.9) return '#ff6b6b';
    if (confidence > 0.8) return '#ffa94d';
    if (confidence > 0.7) return '#ffd43b';
    if (confidence > 0.5) return '#74c0fc';
    return '#51cf66';
  };

  const getAnomalyStatus = (cow) => {
    if (cow.anomalyScore > 0.8) return { text: 'חריגה קריטית', color: '#ff6b6b' };
    if (cow.anomalyScore > 0.7) return { text: 'חריגה גבוהה', color: '#ffa94d' };
    if (cow.anomalyScore > 0.5) return { text: 'חריגה בינונית', color: '#ffd43b' };
    return { text: 'תקין', color: '#51cf66' };
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>זיהוי אנומליות ורעידות אדמה</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>סיכום סיכונים</Text>
            
            <View style={[
              styles.riskCard,
              { backgroundColor: earthquakeRisk?.detected ? '#fff5f5' : '#f1f3f5' }
            ]}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskTitle}>סיכון לרעידת אדמה</Text>
                {earthquakeRisk?.detected && (
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(earthquakeRisk.confidence) }
                  ]}>
                    <Text style={styles.riskBadgeText}>
                      {getRiskLevel(earthquakeRisk.confidence)}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.riskDescription}>
                {earthquakeRisk?.detected 
                  ? `זוהה חשש לרעידת אדמה ברמת ביטחון של ${Math.round(earthquakeRisk.confidence * 100)}%. ${earthquakeRisk.details}`
                  : 'לא זוהה סיכון לרעידת אדמה בנתונים הנוכחיים.'}
              </Text>
              
              {earthquakeRisk?.detected && (
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill,
                      { 
                        width: `${earthquakeRisk.confidence * 100}%`,
                        backgroundColor: getRiskColor(earthquakeRisk.confidence)
                      }
                    ]} 
                  />
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>פרות עם התנהגות חריגה</Text>
            
            {anomalyCows.map(cow => {
              const status = getAnomalyStatus(cow);
              return (
                <View key={cow.id} style={styles.cowCard}>
                  <View style={styles.cowHeader}>
                    <Text style={styles.cowName}>{cow.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                      <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.cowStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>פעילות</Text>
                      <Text style={[
                        styles.statValue,
                        { color: cow.activityLevel > 8 ? '#ff6b6b' : 'black' }
                      ]}>
                        {cow.activityLevel.toFixed(1)}
                      </Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>לחץ</Text>
                      <Text style={[
                        styles.statValue,
                        { color: cow.stressLevel > 7 ? '#ff6b6b' : 'black' }
                      ]}>
                        {cow.stressLevel.toFixed(1)}
                      </Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>דופק</Text>
                      <Text style={[
                        styles.statValue,
                        { color: cow.heartRate > 90 ? '#ff6b6b' : 'black' }
                      ]}>
                        {cow.heartRate}
                      </Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>ציון חריגה</Text>
                      <Text style={[
                        styles.statValue,
                        { color: cow.anomalyScore > 0.7 ? '#ff6b6b' : 'black' }
                      ]}>
                        {cow.anomalyScore.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.lastUpdated}>
                    עדכון אחרון: {new Date(cow.lastUpdated).toLocaleTimeString()}
                  </Text>
                </View>
              );
            })}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>מידע על רעידות אדמה</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>כיצד פרות יכולות לחזות רעידות אדמה?</Text>
              <Text style={styles.infoText}>
                מחקרים מראים שבעלי חיים, כולל פרות, יכולים לחוש בשינויים סביבתיים מיקרוסקופיים שקודמים לרעידות אדמה. 
                אלה כוללים שינויים בשדה המגנטי, גזים שנפלטים מהאדמה, ורעידות קטנות שבני אדם אינם מסוגלים להרגיש.
              </Text>
              <Text style={styles.infoText}>
                המערכת שלנו מנטרת דפוסי התנהגות חריגים בקרב קבוצות פרות, כמו עלייה פתאומית ברמות הלחץ, 
                שינויים בדפוסי תנועה, או התקבצות באזורים מסוימים - כל אלה עשויים להצביע על תחושת סכנה מתקרבת.
              </Text>
            </View>
          </View>
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
    textAlign: 'center',
  },
  loader: {
    marginTop: 50,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  riskCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  riskBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  riskDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
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
  cowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cowName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cowStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default AnomalyDetectionScreen;