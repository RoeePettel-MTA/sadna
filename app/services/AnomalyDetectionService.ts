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
  if (cowData.activityLevel > 7 || cowData.activityLevel < 3) {
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

  // בדיקת פרות עם ציון 0.9 ומעלה
  const highScoreCows = cowsData.filter(cow => cow.anomalyScore >= 0.9);
  
  // דרישה: לפחות 2 פרות עם ציון 0.9 ומעלה
  if (highScoreCows.length >= 2) {
    const avgScore = highScoreCows.reduce((sum, cow) => sum + cow.anomalyScore, 0) / highScoreCows.length;
    
    return {
      detected: true,
      type: 'group',
      severity: 'critical',
      score: avgScore,
      affectedCount: highScoreCows.length,
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
    // בדיקת חשש לרעידת אדמה רק על בסיס קבוצתי
    await detectEarthquakePrecursor(cowsData);
  } catch (error) {
    console.log('Error in monitor and alert:', error);
  }
};