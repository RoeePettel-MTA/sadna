import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

// הגדרת התנהגות ההתראות כשהאפליקציה פעילה (רק במובייל)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// פונקציה לרישום התקן לקבלת התראות
export async function registerForPushNotificationsAsync() {
  // אם זה web, נחזיר null ונשתמש בהתראות מקומיות
  if (Platform.OS === 'web') {
    return null;
  }

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('earthquake-alerts', {
      name: 'התראות רעידת אדמה',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
    } catch (error) {
      console.log('Error getting push token:', error);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token?.data;
}

// פונקציה לשליחת התראה מקומית
export async function sendLocalNotification(title: string, body: string, data = {}) {
  if (Platform.OS === 'web') {
    // בסביבת web נשתמש ב-Alert במקום התראות
    Alert.alert(title, body);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // שליחה מיידית
    });
  } catch (error) {
    console.log('Error sending notification:', error);
    // במקרה של שגיאה, נשתמש ב-Alert
    Alert.alert(title, body);
  }
}

// פונקציה לשליחת התראת חירום על רעידת אדמה
export async function sendEarthquakeAlert(confidence: number, details: string) {
  const title = `⚠️ התראת חירום: חשש לרעידת אדמה!`;
  const body = `זוהתה התנהגות חריגה בפרות המעידה על חשש לרעידת אדמה (רמת ביטחון: ${Math.round(confidence * 100)}%). ${details}`;
  
  await sendLocalNotification(title, body, { 
    type: 'earthquake_alert',
    confidence,
    timestamp: new Date().toISOString()
  });
}

// פונקציה לשליחת התראה על התנהגות חריגה
export async function sendAnomalyAlert(cowName: string, anomalyType: string, severity: string) {
  const title = `התראה: התנהגות חריגה זוהתה`;
  const body = `הפרה "${cowName}" מראה ${anomalyType} ברמת חומרה ${severity}`;
  
  await sendLocalNotification(title, body, {
    type: 'anomaly_alert',
    cowName,
    anomalyType,
    severity,
    timestamp: new Date().toISOString()
  });
}