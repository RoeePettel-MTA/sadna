# Cow Behavior Monitoring System with Earthquake Prediction

A mobile application for monitoring cow behavior and detecting potential earthquake precursors using IoT sensors and machine learning.

## Core Functionalities

### Real-Time Behavior Monitoring
- Live dashboard showing activity levels, movement patterns, and stress indicators of all monitored cows
- Integration with IoT sensors (accelerometers, gyroscopes, heart rate monitors) attached to each cow
- Dynamic visualization through line graphs, heatmaps, and activity timelines

### Individual Cow Profile Page
- Displays detailed behavioral history, health status, GPS location, and anomaly alerts
- Comparison with herd averages and typical behavioral baselines
- Graphs for daily/weekly behavior trends

### Earthquake Anomaly Detection Engine
- Machine learning models (Random Forest, LSTM, CNN) trained on labeled behavioral and seismic data
- Real-time inference pipeline that flags potential anomalies and ranks them by confidence level
- Adaptive learning based on new behavioral patterns and confirmed seismic events

### Alert System
- Smart push notifications via Firebase Cloud Messaging
- Severity-based alerting system: Normal / Warning / Critical
- Alert log with timestamps, sensor data snapshots, and system confidence scores

### Farm & Sensor Management
- Admin panel to add/remove cows and register IoT sensors
- Associate cows with specific pens, GPS zones, or farm locations
- Calibration and testing interface for new sensor installations

### Analytics & History
- Query and filter behavioral anomalies by date, cow, severity, or event type
- Exportable CSV reports and API access for research institutions
- Earthquake event log cross-referenced with official seismic activity data

### User Roles & Permissions
- Multiple user roles: Admin, Farm Worker, Seismologist, and Observer
- Role-based access control (RBAC) for security and data integrity

### Offline Support & Failover
- Local caching of sensor data when internet is unavailable, with automatic sync
- Alert fallback system using SMS for critical events

## Technology Stack

- **Frontend**: React Native with Expo
- **UI Components**: Native components with custom styling
- **Navigation**: React Navigation with drawer navigation
- **State Management**: React Context API and local state
- **Data Visualization**: React Native Chart Kit and custom chart components
- **Notifications**: Expo Notifications with Firebase Cloud Messaging
- **Offline Support**: AsyncStorage for local caching
- **Machine Learning**: TensorFlow.js for on-device inference

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/cow-monitoring-app.git
cd cow-monitoring-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open the app on your device using the Expo Go app or run on a simulator

## Project Structure

```
cow-monitoring-app/
├── app/                   # Main application code
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation configuration
│   ├── services/          # API and business logic services
│   ├── models/            # Data models and types
│   └── utils/             # Helper functions and utilities
├── assets/                # Static assets (images, fonts)
└── docs/                  # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Research on animal behavior as earthquake precursors
- IoT sensor technology for livestock monitoring
- Machine learning approaches for anomaly detection