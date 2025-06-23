import { sendEarthquakeAlert, sendAnomalyAlert } from './NotificationService';
import { Platform } from 'react-native';

// סף לזיהוי אנומליה
const ANOMALY_THRESHOLD = 0.7;
const EARTHQUAKE_THRESHOLD = 0.9;

// פונקציה לבדיקת אנומליות בנתוני פרה
export const detectAnomaly = (cowData) => {
  let maxScore = 0;
  let detectedType = null;
  let severity = null;
  
  // בדיקת רמת פעילות חריגה
  if (cowData.activityLevel > 8 || cowData.activityLevel < 2) {
    const activityScore = Math.abs(cowData.activityLevel - 5) / 5;
    if (activityScore > maxScore) {
      maxScore = activityScore;
      detectedType = 'activity';
      severity = cowData.activityLevel > 8 ? 'high' : 'low';
    }
  }

  // בדיקת רמת לחץ חריגה
  if (cowData.stressLevel > 7) {
    const stressScore = cowData.stressLevel / 10;
    if (stressScore > maxScore) {
      maxScore = stressScore;
      detectedType = 'stress';
      severity = 'high';
    }
  }

  // בדיקת דופק חריג
  if (cowData.heartRate > 90 || cowData.heartRate < 50) {
    const heartScore = Math.abs(cowData.heartRate - 70) / 30;
    if (heartScore > maxScore) {
      maxScore = heartScore;
      detectedType = 'heart_rate';
      severity = cowData.heartRate > 90 ? 'high' : 'low';
    }
  }

  if (maxScore > 0) {
    return {
      detected: true,
      type: detectedType,
      severity: severity,
      score: Math.min(maxScore, 1.0) // הגבלה ל-1.0 מקסימום
    };
  }

  return { detected: false, score: 0 };
};

// פונקציה לבדיקת אנומליות בקבוצת פרות
export const detectGroupAnomaly = (cowsData) => {
  if (!cowsData || cowsData.length === 0) return { detected: false };

  // ספירת הפרות עם אנומליות
  const anomalies = cowsData.map(cow => detectAnomaly(cow))
    .filter(result => result.detected);
  
  const anomalyPercentage = anomalies.length / cowsData.length;
  
  // אם יותר מ-50% מהפרות מראות אנומליות, זה עשוי להצביע על אירוע משותף
  if (anomalyPercentage > 0.5) {
    // חישוב ממוצע ציוני האנומליה
    const avgScore = anomalies.reduce((sum, anomaly) => sum + anomaly.score, 0) / anomalies.length;
    
    return {
      detected: true,
      type: 'group',
      severity: avgScore > 0.8 ? 'critical' : 'high',
      score: avgScore,
      affectedCount: anomalies.length,
      totalCount: cowsData.length
    };
  }

  return { detected: false };
};

// פונקציה לבדיקת חשש לרעידת אדמה
export const detectEarthquakePrecursor = async (cowsData) => {
  try {
    const groupAnomaly = detectGroupAnomaly(cowsData);
    
    if (groupAnomaly.detected && groupAnomaly.score > EARTHQUAKE_THRESHOLD) {
      // בדיקת דפוסי תנועה מיוחדים
      const movementPatterns = analyzeMovementPatterns(cowsData);
      
      if (movementPatterns.unusual) {
        const earthquakeRisk = {
          detected: true,
          confidence: (groupAnomaly.score + movementPatterns.score) / 2,
          details: `${groupAnomaly.affectedCount} מתוך ${groupAnomaly.totalCount} פרות מראות התנהגות חריגה. ${movementPatterns.details}`
        };
        
        // שליחת התראה
        if (earthquakeRisk.confidence > EARTHQUAKE_THRESHOLD) {
          await sendEarthquakeAlert(
            earthquakeRisk.confidence, 
            earthquakeRisk.details
          );
        }
        
        return earthquakeRisk;
      }
    }
    
    return { detected: false };
  } catch (error) {
    console.log('Error detecting earthquake precursor:', error);
    return { detected: false };
  }
};

// פונקציה לניתוח דפוסי תנועה
const analyzeMovementPatterns = (cowsData) => {
  // בדיקה אם הפרות מתקבצות באזור מסוים
  const clustering = checkClustering(cowsData);
  
  // בדיקה אם הפרות מראות תנועה מכוונת בכיוון מסוים
  const directedMovement = checkDirectedMovement(cowsData);
  ז
  // בדיקה אם הפרות מראות חוסר מנוחה כללי
  const restlessness = checkRestlessness(cowsData);
  
  const score = (clustering.score + directedMovement.score + restlessness.score) / 3;
  
  return {
    unusual: score > 0.7,
    score,
    details: `נצפתה ${clustering.detected ? 'התקבצות, ' : ''}${directedMovement.detected ? 'תנועה מכוונת, ' : ''}${restlessness.detected ? 'חוסר מנוחה' : ''}`
  };
};

// פונקציות עזר לניתוח דפוסי תנועה
const checkClustering = (cowsData) => {
  // בפרויקט אמיתי, כאן יהיה אלגוריתם לזיהוי התקבצות
  // לצורך הדגמה, נחזיר ערך קבוע
  return { detected: true, score: 0.9 };
};

const checkDirectedMovement = (cowsData) => {
  // בפרויקט אמיתי, כאן יהיה אלגוריתם לזיהוי תנועה מכוונת
  // לצורך הדגמה, נחזיר ערך קבוע
  return { detected: true, score: 0.85 };
};

const checkRestlessness = (cowsData) => {
  // בפרויקט אמיתי, כאן יהיה אלגוריתם לזיהוי חוסר מנוחה
  // לצורך הדגמה, נחזיר ערך קבוע
  return { detected: true, score: 0.95 };
};

// פונקציה לבדיקת אנומליות ושליחת התראות
export const monitorAndAlert = async (cowsData) => {
  try {
    // בדיקת אנומליות ברמת הפרה הבודדת
    for (const cow of cowsData) {
      const anomaly = detectAnomaly(cow);
      if (anomaly.detected && anomaly.score > ANOMALY_THRESHOLD) {
        await sendAnomalyAlert(
          cow.name,
          anomaly.type === 'activity' ? 'רמת פעילות חריגה' :
          anomaly.type === 'stress' ? 'רמת לחץ גבוהה' : 'דופק חריג',
          anomaly.severity === 'high' ? 'גבוהה' : 'נמוכה'
        );
      }
      
      // בדיקה מיוחדת לציון אנומליה גבוה מאוד
      if (cow.anomalyScore > 0.9) {
        await sendEarthquakeAlert(
          cow.anomalyScore,
          `הפרה "${cow.name}" מראה ציון אנומליה קריטי של ${cow.anomalyScore.toFixed(2)} - חשש לרעידת אדמה!`
        );
      }
    }
    
    // בדיקת חשש לרעידת אדמה
    await detectEarthquakePrecursor(cowsData);
  } catch (error) {
    console.log('Error in monitor and alert:', error);
  }
};