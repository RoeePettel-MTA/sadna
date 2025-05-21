/**
 * Sensor Service
 * 
 * This service handles communication with IoT sensors attached to cows,
 * including data collection, sensor management, and offline caching.
 */

import { SensorData } from './AnomalyDetectionService';

// Types for the service
export interface Sensor {
  id: string;
  cowId: string;
  type: 'Full Package' | 'Heart Rate Only' | 'Activity Only';
  battery: number;
  lastCalibration: string;
  status: 'active' | 'warning' | 'inactive';
  lastSyncTime: string;
}

export interface SensorConfig {
  samplingRateHz: number;
  transmitIntervalSeconds: number;
  batteryOptimization: boolean;
  calibrationSettings: Record<string, number>;
}

// Mock implementation of the sensor service
class SensorService {
  private sensors: Record<string, Sensor> = {};
  private offlineCache: SensorData[] = [];
  private isOnline: boolean = true;
  private defaultConfig: SensorConfig = {
    samplingRateHz: 10,
    transmitIntervalSeconds: 30,
    batteryOptimization: true,
    calibrationSettings: {
      accelerometerOffset: 0.05,
      gyroscopeOffset: 0.02,
      heartRateCalibration: 1.0
    }
  };
  
  /**
   * Register a new sensor in the system
   */
  public registerSensor(sensor: Omit<Sensor, 'lastSyncTime'>): string {
    const sensorId = sensor.id;
    this.sensors[sensorId] = {
      ...sensor,
      lastSyncTime: new Date().toISOString()
    };
    return sensorId;
  }
  
  /**
   * Get a list of all registered sensors
   */
  public getAllSensors(): Sensor[] {
    return Object.values(this.sensors);
  }
  
  /**
   * Get a specific sensor by ID
   */
  public getSensor(sensorId: string): Sensor | null {
    return this.sensors[sensorId] || null;
  }
  
  /**
   * Update sensor information
   */
  public updateSensor(sensorId: string, updates: Partial<Sensor>): boolean {
    if (!this.sensors[sensorId]) return false;
    
    this.sensors[sensorId] = {
      ...this.sensors[sensorId],
      ...updates
    };
    
    return true;
  }
  
  /**
   * Remove a sensor from the system
   */
  public removeSensor(sensorId: string): boolean {
    if (!this.sensors[sensorId]) return false;
    
    delete this.sensors[sensorId];
    return true;
  }
  
  /**
   * Calibrate a sensor
   */
  public async calibrateSensor(sensorId: string): Promise<boolean> {
    if (!this.sensors[sensorId]) return false;
    
    // In a real implementation, this would communicate with the physical sensor
    console.log(`Calibrating sensor ${sensorId}`);
    
    // Simulate calibration time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update calibration date
    this.sensors[sensorId].lastCalibration = new Date().toISOString();
    
    return true;
  }
  
  /**
   * Configure a sensor's settings
   */
  public async configureSensor(sensorId: string, config: Partial<SensorConfig>): Promise<boolean> {
    if (!this.sensors[sensorId]) return false;
    
    // In a real implementation, this would send configuration to the physical sensor
    console.log(`Configuring sensor ${sensorId}`, config);
    
    // Simulate configuration time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }
  
  /**
   * Get the latest data from a sensor
   */
  public async getLatestData(sensorId: string): Promise<SensorData | null> {
    if (!this.sensors[sensorId]) return null;
    
    // In a real implementation, this would fetch actual data from the sensor
    // This is a mock implementation that generates random data
    const sensor = this.sensors[sensorId];
    
    const mockData: SensorData = {
      cowId: sensor.cowId,
      timestamp: new Date().toISOString(),
      activityLevel: Math.random() * 10,
      stressLevel: Math.random() * 10,
      heartRate: 60 + Math.random() * 40,
      movementPattern: ['standing', 'walking', 'running', 'grazing', 'resting'][Math.floor(Math.random() * 5)],
      location: { x: Math.random() * 100, y: Math.random() * 100 },
      accelerometer: [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      gyroscope: [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]
    };
    
    // Update last sync time
    this.sensors[sensorId].lastSyncTime = new Date().toISOString();
    
    // If we're offline, cache the data
    if (!this.isOnline) {
      this.offlineCache.push(mockData);
      return mockData;
    }
    
    return mockData;
  }
  
  /**
   * Set the online/offline status
   */
  public setOnlineStatus(isOnline: boolean): void {
    const wasOffline = !this.isOnline;
    this.isOnline = isOnline;
    
    // If we're coming back online, sync cached data
    if (isOnline && wasOffline) {
      this.syncOfflineCache();
    }
  }
  
  /**
   * Sync offline cached data when coming back online
   */
  private async syncOfflineCache(): Promise<void> {
    if (this.offlineCache.length === 0) return;
    
    console.log(`Syncing ${this.offlineCache.length} cached sensor readings`);
    
    // In a real implementation, this would send the cached data to the server
    // Simulate sync time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear the cache after successful sync
    this.offlineCache = [];
  }
  
  /**
   * Check battery levels of all sensors and return those that need attention
   */
  public checkBatteryLevels(): Sensor[] {
    return Object.values(this.sensors).filter(sensor => sensor.battery < 30);
  }
  
  /**
   * Get the default sensor configuration
   */
  public getDefaultConfig(): SensorConfig {
    return { ...this.defaultConfig };
  }
  
  /**
   * Update the default sensor configuration
   */
  public updateDefaultConfig(config: Partial<SensorConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

export default new SensorService();