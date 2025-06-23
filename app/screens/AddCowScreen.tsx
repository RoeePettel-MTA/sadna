import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { addCow, createDefaultCowData, getAllCows } from '../services/CowDataService';
import { monitorAndAlert } from '../services/AnomalyDetectionService';

// Import Ionicons only for mobile platforms
let Ionicons;
if (Platform.OS !== 'web') {
  Ionicons = require('@expo/vector-icons').Ionicons;
}

const AddCowScreen = () => {
  const [name, setName] = useState('');
  const [sensorId, setSensorId] = useState('');
  const [location, setLocation] = useState('');
  const [activityLevel, setActivityLevel] = useState('5.0');
  const [stressLevel, setStressLevel] = useState('3.0');
  const [heartRate, setHeartRate] = useState('70');

  const [useDefaults, setUseDefaults] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateRandomSensorId = () => {
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    setSensorId(`SEN${randomNum.toString().padStart(3, '0')}`);
  };

  const handleSave = async () => {
    if (!name.trim() || !sensorId.trim() || !location.trim()) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים (שם, מזהה חיישן, מיקום)');
      return;
    }

    setLoading(true);
    try {
      let cowData;
      
      if (useDefaults) {
        // שימוש בערכי ברירת מחדל
        cowData = createDefaultCowData(name, sensorId, location);
      } else {
        // שימוש בערכים שהוזנו ידנית
        cowData = createDefaultCowData(name, sensorId, location, {
          activityLevel: parseFloat(activityLevel) || 5.0,
          stressLevel: parseFloat(stressLevel) || 3.0,
          heartRate: parseInt(heartRate) || 70
        });
      }

      const newCow = addCow(cowData);
      
      // בדיקת חשש לרעידת אדמה
      const allCows = getAllCows();
      await monitorAndAlert(allCows);
      
      const statusText = newCow.anomalyScore > 0.7 ? 'דורש תשומת לב ⚠️' : 'תקין ✅';
      const riskLevel = newCow.anomalyScore > 0.8 ? 'גבוה מאוד' : 
                       newCow.anomalyScore > 0.7 ? 'גבוה' : 
                       newCow.anomalyScore > 0.5 ? 'בינוני' : 'נמוך';
      
      // בדיקה מיוחדת לפרה עם ציון אנומליה גבוה
      if (newCow.anomalyScore > 0.9) {
        Alert.alert(
          '⚠️ התראת חירום: חשש לרעידת אדמה!',
          `הפרה החדשה "${newCow.name}" מראה ציון אנומליה קריטי של ${newCow.anomalyScore.toFixed(2)}!\n\n` +
          `📊 נתוני חיישנים:\n` +
          `• פעילות: ${newCow.activityLevel.toFixed(1)}\n` +
          `• לחץ: ${newCow.stressLevel.toFixed(1)}\n` +
          `• דופק: ${newCow.heartRate} BPM\n\n` +
          `🚨 חשש לרעידת אדמה - אנא בדקו את המצב מיידית!`,
          [
            { text: 'הבנתי', onPress: () => router.back() },
            { text: 'צפה פרטים', onPress: () => router.push('/screens/AnomalyDetectionScreen') },
            { text: 'חזור לניהול', onPress: () => router.back() }
          ]
        );
      } else {
        Alert.alert(
          'פרה חדשה נוספה! 🐄', 
          `שם: ${newCow.name}\n` +
          `חיישן: ${newCow.sensorId}\n` +
          `מיקום: ${newCow.location}\n\n` +
          `📊 נתוני חיישנים:\n` +
          `• פעילות: ${newCow.activityLevel.toFixed(1)}\n` +
          `• לחץ: ${newCow.stressLevel.toFixed(1)}\n` +
          `• דופק: ${newCow.heartRate} BPM\n` +
          `🔍 ציון אנומליה: ${newCow.anomalyScore.toFixed(2)}\n` +
          `רמת סיכון: ${riskLevel}\n` +
          `סטטוס: ${statusText}`,
          [
            { text: 'הוסף עוד פרה', onPress: resetForm },
            { text: 'חזור לניהול', onPress: () => router.back() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהוספת הפרה');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSensorId('');
    setLocation('');
    setActivityLevel('5.0');
    setStressLevel('3.0');
    setHeartRate('70');

    setUseDefaults(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          {Platform.OS !== 'web' && Ionicons ? (
            <Ionicons name="arrow-back" size={24} color="#4dabf7" />
          ) : (
            <Text style={styles.backButtonText}>←</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.title}>הוספת פרה חדשה</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.formField}>
          <Text style={styles.formLabel}>שם הפרה *</Text>
          <TextInput
            style={styles.formInput}
            value={name}
            onChangeText={setName}
            placeholder="הכנס שם לפרה"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>מזהה חיישן *</Text>
          <View style={styles.inputWithButton}>
            <TextInput
              style={[styles.formInput, { flex: 1 }]}
              value={sensorId}
              onChangeText={setSensorId}
              placeholder="SEN001"
            />
            <TouchableOpacity style={styles.generateButton} onPress={generateRandomSensorId}>
              {Platform.OS !== 'web' && Ionicons ? (
                <Ionicons name="refresh" size={20} color="#4dabf7" />
              ) : (
                <Text style={styles.generateButtonText}>🔄</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>מיקום *</Text>
          <TextInput
            style={styles.formInput}
            value={location}
            onChangeText={setLocation}
            placeholder="לדוגמה: North Pen, East Field"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>השתמש בערכי ברירת מחדל לחיישנים</Text>
          <Switch
            value={useDefaults}
            onValueChange={setUseDefaults}
            trackColor={{ false: '#767577', true: '#4dabf7' }}
            thumbColor="#f4f3f4"
          />
        </View>

        {!useDefaults && (
          <>
            <Text style={styles.sectionTitle}>נתוני חיישנים</Text>
            
            <View style={styles.formField}>
              <Text style={styles.formLabel}>רמת פעילות (0-10)</Text>
              <TextInput
                style={styles.formInput}
                value={activityLevel}
                onChangeText={setActivityLevel}
                placeholder="5.0"
                keyboardType="numeric"
              />
              <Text style={styles.fieldHint}>ערך נורמלי: 4-6</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>רמת לחץ (0-10)</Text>
              <TextInput
                style={styles.formInput}
                value={stressLevel}
                onChangeText={setStressLevel}
                placeholder="3.0"
                keyboardType="numeric"
              />
              <Text style={styles.fieldHint}>ערך נורמלי: 2-5</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>דופק (BPM)</Text>
              <TextInput
                style={styles.formInput}
                value={heartRate}
                onChangeText={setHeartRate}
                placeholder="70"
                keyboardType="numeric"
              />
              <Text style={styles.fieldHint}>ערך נורמלי: 60-80</Text>
            </View>


          </>
        )}

        <View style={styles.infoBox}>
          {Platform.OS !== 'web' && Ionicons ? (
            <Ionicons name="information-circle" size={20} color="#4dabf7" />
          ) : (
            <Text style={styles.infoIcon}>ℹ️</Text>
          )}
          <Text style={styles.infoText}>
            {useDefaults 
              ? 'ערכי ברירת המחדל יוגדרו אוטומטית בטווח נורמלי'
              : 'ציון האנומליה יחושב אוטומטית על בסיס הנתונים שהוזנו'
            }
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>ביטול</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'שומר...' : 'הוסף פרה'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4dabf7',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
    color: '#333',
  },
  fieldHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: 'white',
    marginRight: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#4dabf7',
    marginLeft: 8,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
  },
  backButtonText: {
    fontSize: 24,
    color: '#4dabf7',
    fontWeight: 'bold',
  },
  generateButtonText: {
    fontSize: 16,
    color: '#4dabf7',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
});

export default AddCowScreen;