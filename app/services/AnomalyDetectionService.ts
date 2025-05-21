/**
 * Anomaly Detection Service
 * 
 * This service handles the machine learning models for detecting behavioral anomalies
 * and potential earthquake precursors in cow behavior data.
 */

// Types for the service
export interface SensorData {
  cowId: string;
  timestamp: string;
  activityLevel: number;
  stressLevel: number;
  heartRate: number;
  movementPattern: string;
  location: { x: number; y: number };
  accelerometer: number[];
  gyroscope: number[];
}

export interface AnomalyResult {
  isAnomaly: boolean;
  confidence: number;
  anomalyType: 'behavior' | 'health' | 'earthquake' | null;
  severity: 'Normal' | 'Warning' | 'Critical';
  features: string[];
  featureImportance: Record<string, number>;
}

export interface ModelConfig {
  sensitivityThreshold: number;
  minConfidence: number;
  timeWindowMinutes: number;
  modelType: 'RandomForest' | 'LSTM' | 'CNN';
  enabledFeatures: string[];
}

// Mock implementation of the anomaly detection service
class AnomalyDetectionService {
  private config: ModelConfig = {
    sensitivityThreshold: 0.7,
    minConfidence: 0.65,
    timeWindowMinutes: 30,
    modelType: 'RandomForest',
    enabledFeatures: [
      'activityLevel',
      'stressLevel',
      'heartRate',
      'movementPattern',
      'accelerometer',
      'gyroscope'
    ]
  };
  
  private sensorDataBuffer: Record<string, SensorData[]> = {};
  private lastSeismicPrediction: Date | null = null;
  
  /**
   * Process new sensor data and detect anomalies
   */
  public async processSensorData(data: SensorData): Promise<AnomalyResult | null> {
    // Add data to buffer
    if (!this.sensorDataBuffer[data.cowId]) {
      this.sensorDataBuffer[data.cowId] = [];
    }
    
    this.sensorDataBuffer[data.cowId].push(data);
    
    // Keep only data within the time window
    const cutoffTime = new Date(Date.now() - this.config.timeWindowMinutes * 60 * 1000);
    this.sensorDataBuffer[data.cowId] = this.sensorDataBuffer[data.cowId].filter(
      item => new Date(item.timestamp) > cutoffTime
    );
    
    // Check for individual cow anomalies
    const individualAnomaly = this.detectIndividualAnomaly(data);
    
    // Check for coordinated herd anomalies (potential earthquake precursors)
    const herdAnomaly = await this.detectHerdAnomaly();
    
    // Return the more severe anomaly if both exist
    if (herdAnomaly && individualAnomaly) {
      return herdAnomaly.confidence > individualAnomaly.confidence ? herdAnomaly : individualAnomaly;
    }
    
    return herdAnomaly || individualAnomaly || null;
  }
  
  /**
   * Detect anomalies for an individual cow
   */
  private detectIndividualAnomaly(data: SensorData): AnomalyResult | null {
    // In a real implementation, this would use the actual ML model
    // This is a simplified mock implementation
    
    let isAnomaly = false;
    let confidence = 0;
    let anomalyType: 'behavior' | 'health' | 'earthquake' | null = null;
    let severity: 'Normal' | 'Warning' | 'Critical' = 'Normal';
    
    // Simple rule-based detection for demonstration
    if (data.stressLevel > 8) {
      isAnomaly = true;
      confidence = Math.min(data.stressLevel / 10, 0.95);
      anomalyType = 'behavior';
      severity = confidence > 0.8 ? 'Warning' : 'Normal';
    }
    
    if (data.heartRate > 90) {
      isAnomaly = true;
      const hrConfidence = Math.min((data.heartRate - 70) / 50, 0.95);
      if (hrConfidence > confidence) {
        confidence = hrConfidence;
        anomalyType = 'health';
        severity = confidence > 0.8 ? 'Warning' : 'Normal';
      }
    }
    
    // Only return if it meets the minimum confidence threshold
    if (isAnomaly && confidence >= this.config.minConfidence) {
      return {
        isAnomaly,
        confidence,
        anomalyType,
        severity,
        features: ['stressLevel', 'heartRate', 'activityLevel'],
        featureImportance: {
          stressLevel: 0.5,
          heartRate: 0.3,
          activityLevel: 0.2
        }
      };
    }
    
    return null;
  }
  
  /**
   * Detect coordinated anomalies across multiple cows (potential earthquake precursors)
   */
  private async detectHerdAnomaly(): Promise<AnomalyResult | null> {
    // Prevent frequent seismic predictions (no more than once per hour)
    if (this.lastSeismicPrediction && 
        (Date.now() - this.lastSeismicPrediction.getTime()) < 60 * 60 * 1000) {
      return null;
    }
    
    // Get all cows with recent data
    const cowIds = Object.keys(this.sensorDataBuffer);
    if (cowIds.length < 3) {
      // Need at least 3 cows for herd analysis
      return null;
    }
    
    // Count cows with elevated stress levels
    const stressedCows = cowIds.filter(cowId => {
      const recentData = this.sensorDataBuffer[cowId][this.sensorDataBuffer[cowId].length - 1];
      return recentData.stressLevel > 7;
    });
    
    // If more than 50% of cows show elevated stress, consider it a potential earthquake precursor
    if (stressedCows.length >= cowIds.length * 0.5) {
      this.lastSeismicPrediction = new Date();
      
      const confidence = Math.min(0.6 + (stressedCows.length / cowIds.length) * 0.4, 0.95);
      const severity = confidence > 0.8 ? 'Critical' : 'Warning';
      
      return {
        isAnomaly: true,
        confidence,
        anomalyType: 'earthquake',
        severity,
        features: ['stressLevel', 'movementPattern', 'herdCoordination'],
        featureImportance: {
          stressLevel: 0.4,
          movementPattern: 0.3,
          herdCoordination: 0.3
        }
      };
    }
    
    return null;
  }
  
  /**
   * Update the model configuration
   */
  public updateConfig(newConfig: Partial<ModelConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Get the current model configuration
   */
  public getConfig(): ModelConfig {
    return { ...this.config };
  }
  
  /**
   * Train or retrain the model with new labeled data
   */
  public async trainModel(labeledData: Array<{ data: SensorData, label: string }>): Promise<boolean> {
    // In a real implementation, this would train the actual ML model
    console.log(`Training model with ${labeledData.length} samples`);
    
    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  }
  
  /**
   * Validate the model performance with test data
   */
  public async validateModel(testData: Array<{ data: SensorData, label: string }>): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }> {
    // In a real implementation, this would validate the actual ML model
    console.log(`Validating model with ${testData.length} samples`);
    
    // Simulate validation time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock metrics
    return {
      accuracy: 0.87,
      precision: 0.82,
      recall: 0.79,
      f1Score: 0.80
    };
  }
}

export default new AnomalyDetectionService();