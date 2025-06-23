import { getAllCows, updateSensorData, simulateNewSensorData } from './CowDataService';
import { monitorAndAlert } from './AnomalyDetectionService';

class RealTimeService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private updateInterval = 10000; // 10 שניות
  private callbacks: Array<() => void> = [];

  // התחלת מעקב בזמן אמת
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      try {
        // סימולציה של נתוני חיישנים חדשים
        simulateNewSensorData();
        
        // בדיקת אנומליות
        const cows = getAllCows();
        await monitorAndAlert(cows);
        
        // הפעלת callbacks לעדכון UI
        this.callbacks.forEach(callback => callback());
        
        console.log('Real-time data updated');
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    }, this.updateInterval);
    
    console.log('Real-time monitoring started');
  }

  // עצירת מעקב בזמן אמת
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Real-time monitoring stopped');
  }

  // הוספת callback לעדכון UI
  addCallback(callback: () => void) {
    this.callbacks.push(callback);
  }

  // הסרת callback
  removeCallback(callback: () => void) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  // בדיקה אם השירות פועל
  isActive() {
    return this.isRunning;
  }

  // שינוי תדירות העדכון
  setUpdateInterval(interval: number) {
    this.updateInterval = interval;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // עדכון ידני של נתוני חיישן ספציפי
  async updateCowSensor(cowId: string, sensorData: {
    activityLevel?: number;
    stressLevel?: number;
    heartRate?: number;
    temperature?: number;
    gpsLocation?: { x: number; y: number };
  }) {
    try {
      const updatedCow = updateSensorData(cowId, sensorData);
      if (updatedCow) {
        // בדיקת אנומליות לפרה הספציפית
        const cows = getAllCows();
        await monitorAndAlert([updatedCow]);
        
        // הפעלת callbacks
        this.callbacks.forEach(callback => callback());
        
        return updatedCow;
      }
      return null;
    } catch (error) {
      console.error('Error updating cow sensor:', error);
      return null;
    }
  }

  // סימולציה של אירוע חירום (לבדיקות)
  simulateEmergency() {
    const cows = getAllCows();
    if (cows.length > 0) {
      // הגדלת רמות הלחץ והפעילות לכל הפרות
      cows.forEach(cow => {
        this.updateCowSensor(cow.id, {
          stressLevel: 8.5 + Math.random() * 1.5,
          activityLevel: 8.0 + Math.random() * 2.0,
          heartRate: 90 + Math.floor(Math.random() * 20)
        });
      });
      
      console.log('Emergency simulation activated');
    }
  }

  // איפוס לערכים נורמליים
  resetToNormal() {
    const cows = getAllCows();
    cows.forEach(cow => {
      this.updateCowSensor(cow.id, {
        stressLevel: 2 + Math.random() * 3, // 2-5
        activityLevel: 4 + Math.random() * 3, // 4-7
        heartRate: 60 + Math.floor(Math.random() * 20) // 60-80
      });
    });
    
    console.log('Reset to normal values');
  }
}

// יצירת instance יחיד
export const realTimeService = new RealTimeService();

// פונקציות עזר
export const startRealTimeMonitoring = () => realTimeService.start();
export const stopRealTimeMonitoring = () => realTimeService.stop();
export const addRealTimeCallback = (callback: () => void) => realTimeService.addCallback(callback);
export const removeRealTimeCallback = (callback: () => void) => realTimeService.removeCallback(callback);
export const simulateEmergency = () => realTimeService.simulateEmergency();
export const resetToNormal = () => realTimeService.resetToNormal();