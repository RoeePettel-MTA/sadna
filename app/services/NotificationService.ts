/**
 * Notification Service
 * 
 * This service handles sending alerts and notifications to users through
 * various channels (push notifications, SMS, email) with fallback mechanisms.
 */

// Types for the service
export interface Alert {
  id: string;
  cowId: string;
  cowName: string;
  timestamp: string;
  type: 'behavior' | 'health' | 'earthquake';
  message: string;
  severity: 'Normal' | 'Warning' | 'Critical';
  confidence: number;
  acknowledged: boolean;
}

export interface NotificationChannel {
  type: 'push' | 'sms' | 'email';
  enabled: boolean;
  config: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  channels: NotificationChannel[];
  severityThreshold: 'Normal' | 'Warning' | 'Critical';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

// Mock implementation of the notification service
class NotificationService {
  private alerts: Alert[] = [];
  private userPreferences: Record<string, NotificationPreferences> = {};
  private fcmAvailable: boolean = true; // Firebase Cloud Messaging availability
  
  /**
   * Create a new alert
   */
  public createAlert(alert: Omit<Alert, 'id' | 'acknowledged'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: `alert${Date.now()}`,
      acknowledged: false
    };
    
    this.alerts.push(newAlert);
    
    // Send notifications based on alert severity
    this.sendAlertNotifications(newAlert);
    
    return newAlert;
  }
  
  /**
   * Get all alerts, optionally filtered
   */
  public getAlerts(filters?: {
    cowId?: string;
    type?: 'behavior' | 'health' | 'earthquake';
    severity?: 'Normal' | 'Warning' | 'Critical';
    acknowledged?: boolean;
    startDate?: string;
    endDate?: string;
  }): Alert[] {
    if (!filters) return [...this.alerts];
    
    return this.alerts.filter(alert => {
      if (filters.cowId && alert.cowId !== filters.cowId) return false;
      if (filters.type && alert.type !== filters.type) return false;
      if (filters.severity && alert.severity !== filters.severity) return false;
      if (filters.acknowledged !== undefined && alert.acknowledged !== filters.acknowledged) return false;
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        const alertDate = new Date(alert.timestamp);
        if (alertDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        const alertDate = new Date(alert.timestamp);
        if (alertDate > endDate) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string, userId: string): boolean {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return false;
    
    this.alerts[alertIndex].acknowledged = true;
    
    // In a real app, log who acknowledged the alert and when
    console.log(`Alert ${alertId} acknowledged by user ${userId}`);
    
    return true;
  }
  
  /**
   * Delete an alert
   */
  public deleteAlert(alertId: string): boolean {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return false;
    
    this.alerts.splice(alertIndex, 1);
    return true;
  }
  
  /**
   * Set user notification preferences
   */
  public setUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    if (!this.userPreferences[userId]) {
      // Default preferences
      this.userPreferences[userId] = {
        userId,
        channels: [
          { type: 'push', enabled: true, config: {} },
          { type: 'sms', enabled: false, config: { phoneNumber: '' } },
          { type: 'email', enabled: false, config: { email: '' } }
        ],
        severityThreshold: 'Warning',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      };
    }
    
    this.userPreferences[userId] = {
      ...this.userPreferences[userId],
      ...preferences
    };
  }
  
  /**
   * Get user notification preferences
   */
  public getUserPreferences(userId: string): NotificationPreferences | null {
    return this.userPreferences[userId] || null;
  }
  
  /**
   * Send notifications for an alert based on its severity and user preferences
   */
  private async sendAlertNotifications(alert: Alert): Promise<void> {
    // Get all users who should receive this alert
    const userIds = Object.keys(this.userPreferences);
    
    for (const userId of userIds) {
      const prefs = this.userPreferences[userId];
      
      // Check if the alert meets the user's severity threshold
      if (this.getSeverityLevel(alert.severity) < this.getSeverityLevel(prefs.severityThreshold)) {
        continue;
      }
      
      // Check quiet hours
      if (prefs.quietHours.enabled && this.isInQuietHours(prefs.quietHours)) {
        // During quiet hours, only send Critical alerts
        if (alert.severity !== 'Critical') {
          continue;
        }
      }
      
      // Try to send through enabled channels
      let notificationSent = false;
      
      for (const channel of prefs.channels) {
        if (!channel.enabled) continue;
        
        try {
          switch (channel.type) {
            case 'push':
              notificationSent = await this.sendPushNotification(userId, alert);
              break;
            case 'sms':
              // Only send SMS for Critical alerts or if push failed
              if (alert.severity === 'Critical' || !notificationSent) {
                notificationSent = await this.sendSmsNotification(userId, alert, channel.config);
              }
              break;
            case 'email':
              // Only send email for Critical alerts or if other methods failed
              if (alert.severity === 'Critical' || !notificationSent) {
                notificationSent = await this.sendEmailNotification(userId, alert, channel.config);
              }
              break;
          }
          
          // If notification was sent successfully through this channel, we can stop
          if (notificationSent) break;
        } catch (error) {
          console.error(`Failed to send ${channel.type} notification to user ${userId}:`, error);
          // Continue to next channel as fallback
        }
      }
      
      // If all channels failed for a Critical alert, log this for monitoring
      if (!notificationSent && alert.severity === 'Critical') {
        console.error(`CRITICAL: Failed to notify user ${userId} about alert ${alert.id} through any channel`);
      }
    }
  }
  
  /**
   * Send a push notification
   */
  private async sendPushNotification(userId: string, alert: Alert): Promise<boolean> {
    // In a real app, this would use Firebase Cloud Messaging or another push service
    console.log(`Sending push notification to user ${userId} for alert ${alert.id}`);
    
    // Simulate FCM being down
    if (!this.fcmAvailable) {
      throw new Error('Firebase Cloud Messaging is currently unavailable');
    }
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  }
  
  /**
   * Send an SMS notification (fallback method)
   */
  private async sendSmsNotification(userId: string, alert: Alert, config: any): Promise<boolean> {
    // In a real app, this would use Twilio or another SMS service
    if (!config.phoneNumber) {
      throw new Error('No phone number configured for SMS notifications');
    }
    
    console.log(`Sending SMS to ${config.phoneNumber} for user ${userId} for alert ${alert.id}`);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  }
  
  /**
   * Send an email notification (fallback method)
   */
  private async sendEmailNotification(userId: string, alert: Alert, config: any): Promise<boolean> {
    // In a real app, this would use SendGrid or another email service
    if (!config.email) {
      throw new Error('No email address configured for email notifications');
    }
    
    console.log(`Sending email to ${config.email} for user ${userId} for alert ${alert.id}`);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  }
  
  /**
   * Check if current time is within quiet hours
   */
  private isInQuietHours(quietHours: { start: string; end: string }): boolean {
    if (!quietHours.start || !quietHours.end) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Handle case where quiet hours span midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }
  
  /**
   * Convert severity string to numeric level for comparison
   */
  private getSeverityLevel(severity: 'Normal' | 'Warning' | 'Critical'): number {
    switch (severity) {
      case 'Critical': return 3;
      case 'Warning': return 2;
      case 'Normal': return 1;
      default: return 0;
    }
  }
  
  /**
   * Set the availability of Firebase Cloud Messaging
   * (for testing fallback mechanisms)
   */
  public setFcmAvailability(available: boolean): void {
    this.fcmAvailable = available;
  }
  
  /**
   * Export alerts to CSV format
   */
  public exportAlertsToCsv(filters?: any): string {
    const alerts = this.getAlerts(filters);
    
    if (alerts.length === 0) {
      return 'No alerts match the specified filters';
    }
    
    // Create CSV header
    const headers = ['id', 'cowId', 'cowName', 'timestamp', 'type', 'message', 'severity', 'confidence', 'acknowledged'];
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    for (const alert of alerts) {
      const row = [
        alert.id,
        alert.cowId,
        alert.cowName,
        alert.timestamp,
        alert.type,
        `"${alert.message.replace(/"/g, '""')}"`, // Escape quotes in message
        alert.severity,
        alert.confidence.toString(),
        alert.acknowledged.toString()
      ];
      
      csv += row.join(',') + '\n';
    }
    
    return csv;
  }
}

export default new NotificationService();