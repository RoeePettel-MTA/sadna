import { detectAnomaly } from './AnomalyDetectionService';

export interface CowData {
  id: string;
  name: string;
  sensorId: string;
  location: string;
  activityLevel: number;
  stressLevel: number;
  heartRate: number;
  anomalyScore: number;
  gpsLocation: { x: number; y: number };
  lastUpdated: string;
  active: boolean;
  recentEvents: Array<{
    type: string;
    timestamp: string;
    value: string;
  }>;
}

// נתוני פרות ראשוניים
let cowsData: CowData[] = [
  {
    id: 'cow1',
    name: 'Bessie',
    sensorId: 'SEN001',
    location: 'North Pen',
    activityLevel: 7.2,
    stressLevel: 3.5,
    heartRate: 65,

    anomalyScore: 0.44,
    gpsLocation: { x: 45, y: 32 },
    lastUpdated: new Date().toISOString(),
    active: true,
    recentEvents: [
      { type: 'movement', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), value: 'walking' },
      { type: 'feeding', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), value: 'grazing' }
    ]
  },
  {
    id: 'cow2',
    name: 'Daisy',
    sensorId: 'SEN002',
    location: 'East Pen',
    activityLevel: 5.8,
    stressLevel: 4.2,
    heartRate: 72,

    anomalyScore: 0,
    gpsLocation: { x: 78, y: 56 },
    lastUpdated: new Date().toISOString(),
    active: true,
    recentEvents: [
      { type: 'movement', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), value: 'resting' },
      { type: 'feeding', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), value: 'drinking' }
    ]
  },
  {
    id: 'cow3',
    name: 'Buttercup',
    sensorId: 'SEN003',
    location: 'North Pen',
    activityLevel: 8.9,
    stressLevel: 8.7,
    heartRate: 95,

    anomalyScore: 0.87,
    gpsLocation: { x: 12, y: 78 },
    lastUpdated: new Date().toISOString(),
    active: true,
    recentEvents: [
      { type: 'movement', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), value: 'agitated' },
      { type: 'alert', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), value: 'unusual behavior' }
    ]
  },
  {
    id: 'cow4',
    name: 'Clover',
    sensorId: 'SEN004',
    location: 'West Pen',
    activityLevel: 9.1,
    stressLevel: 7.9,
    heartRate: 88,

    anomalyScore: 0.82,
    gpsLocation: { x: 67, y: 22 },
    lastUpdated: new Date().toISOString(),
    active: true,
    recentEvents: [
      { type: 'movement', timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(), value: 'pacing' },
      { type: 'alert', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), value: 'elevated heart rate' }
    ]
  }
];

// פונקציה לקבלת כל הפרות
export const getAllCows = (): CowData[] => {
  return cowsData;
};

// פונקציה לקבלת פרה לפי ID
export const getCowById = (id: string): CowData | undefined => {
  return cowsData.find(cow => cow.id === id);
};

// פונקציה להוספת פרה חדשה
export const addCow = (cowData: Omit<CowData, 'id' | 'anomalyScore' | 'lastUpdated'>): CowData => {
  const newId = `cow${Date.now()}`;
  
  // חישוב ציון אנומליה ראשוני
  const anomalyResult = detectAnomaly({
    activityLevel: cowData.activityLevel,
    stressLevel: cowData.stressLevel,
    heartRate: cowData.heartRate
  });
  
  const newCow: CowData = {
    ...cowData,
    id: newId,
    anomalyScore: anomalyResult.score || 0,
    lastUpdated: new Date().toISOString(),
    recentEvents: cowData.recentEvents || []
  };
  
  cowsData.push(newCow);
  return newCow;
};

// פונקציה לעדכון פרה קיימת
export const updateCow = (id: string, updates: Partial<CowData>): CowData | null => {
  const cowIndex = cowsData.findIndex(cow => cow.id === id);
  if (cowIndex === -1) return null;
  
  const updatedCow = {
    ...cowsData[cowIndex],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  // עדכון ציון אנומליה אם השתנו נתוני החיישנים
  if (updates.activityLevel !== undefined || updates.stressLevel !== undefined || updates.heartRate !== undefined) {
    const anomalyResult = detectAnomaly({
      activityLevel: updatedCow.activityLevel,
      stressLevel: updatedCow.stressLevel,
      heartRate: updatedCow.heartRate
    });
    updatedCow.anomalyScore = anomalyResult.score || 0;
  }
  
  cowsData[cowIndex] = updatedCow;
  return updatedCow;
};

// פונקציה למחיקת פרה
export const deleteCow = (id: string): boolean => {
  const initialLength = cowsData.length;
  cowsData = cowsData.filter(cow => cow.id !== id);
  return cowsData.length < initialLength;
};

// פונקציה לעדכון נתוני חיישנים בזמן אמת
export const updateSensorData = (cowId: string, sensorData: {
  activityLevel?: number;
  stressLevel?: number;
  heartRate?: number;
  gpsLocation?: { x: number; y: number };
}): CowData | null => {
  const cow = getCowById(cowId);
  if (!cow) return null;
  
  const updates: Partial<CowData> = {
    ...sensorData,
    lastUpdated: new Date().toISOString()
  };
  
  // הוספת אירוע חדש אם יש שינוי משמעותי
  if (sensorData.activityLevel && Math.abs(sensorData.activityLevel - cow.activityLevel) > 2) {
    const newEvent = {
      type: 'activity_change',
      timestamp: new Date().toISOString(),
      value: `Activity changed from ${cow.activityLevel.toFixed(1)} to ${sensorData.activityLevel.toFixed(1)}`
    };
    updates.recentEvents = [newEvent, ...(cow.recentEvents || [])].slice(0, 10);
  }
  
  return updateCow(cowId, updates);
};

// פונקציה לסימולציה של נתוני חיישנים חדשים
export const simulateNewSensorData = (): void => {
  // לא משנים נתונים - רק מעדכנים זמן אחרון
  cowsData.forEach(cow => {
    if (cow.active) {
      cow.lastUpdated = new Date().toISOString();
    }
  });
};

// פונקציה ליצירת נתוני פרה ברירת מחדל
export const createDefaultCowData = (
  name: string, 
  sensorId: string, 
  location: string,
  customData?: {
    activityLevel?: number;
    stressLevel?: number;
    heartRate?: number;
  }
): Omit<CowData, 'id' | 'anomalyScore' | 'lastUpdated'> => {
  return {
    name,
    sensorId,
    location,
    activityLevel: customData?.activityLevel ?? (5 + Math.random() * 3),
    stressLevel: customData?.stressLevel ?? (2 + Math.random() * 3),
    heartRate: customData?.heartRate ?? (60 + Math.floor(Math.random() * 20)),
    gpsLocation: {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100)
    },
    active: true,
    recentEvents: [
      {
        type: 'system',
        timestamp: new Date().toISOString(),
        value: 'Cow added to monitoring system'
      }
    ]
  };
};