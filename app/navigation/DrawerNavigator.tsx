import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AnomalyDetectionScreen from '../screens/AnomalyDetectionScreen';
import CowDetailScreen from '../screens/CowDetailScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FarmManagementScreen from '../screens/FarmManagementScreen';
import { logout } from '../services/AuthService';

const Drawer = createDrawerNavigator();

// Custom sidebar content component
const SidebarContent = props => {
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        router.replace('/');
      } else {
        Alert.alert('שגיאה', 'אירעה שגיאה בהתנתקות');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בהתנתקות');
    }
  };

  return (
    <View style={styles.sidebarContainer}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Cow Monitoring System</Text>
        <Text style={styles.sidebarSubtitle}>Earthquake Detection</Text>
      </View>
      
      <View style={styles.sidebarContent}>
        {props.state.routes.map((route, index) => {
          const { options } = props.descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = props.state.index === index;
          
          const onPress = () => {
            const event = props.navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              props.navigation.navigate(route.name);
            }
          };
          
          // Get icon based on route name
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'CowDetail') {
            iconName = 'information-circle';
          } else if (route.name === 'AnomalyDetection') {
            iconName = 'warning';
          } else if (route.name === 'FarmManagement') {
            iconName = 'settings';
          }
          
          return (
            <View 
              key={route.key} 
              style={[styles.sidebarItem, isFocused && styles.sidebarItemActive]}
            >
              <Ionicons 
                name={iconName} 
                size={24} 
                color={isFocused ? '#4dabf7' : '#495057'} 
                style={styles.sidebarIcon}
              />
              <Text 
                style={[styles.sidebarLabel, isFocused && styles.sidebarLabelActive]}
                onPress={onPress}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="#ff6b6b" style={styles.sidebarIcon} />
        <Text style={styles.logoutText}>התנתק</Text>
      </TouchableOpacity>
      
      <View style={styles.sidebarFooter}>
        <Text style={styles.sidebarFooterText}>v1.0.0</Text>
      </View>
    </View>
  );
};

const DrawerNavigator = () => (
  <Drawer.Navigator 
    drawerContent={props => <SidebarContent {...props} />}
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4dabf7',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Drawer.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        title: 'Dashboard',
      }}
    />
    <Drawer.Screen 
      name="CowDetail" 
      component={CowDetailScreen}
      options={{
        title: 'Cow Details',
      }}
    />
    <Drawer.Screen 
      name="AnomalyDetection" 
      component={AnomalyDetectionScreen}
      options={{
        title: 'Anomaly Detection',
      }}
    />
    <Drawer.Screen 
      name="FarmManagement" 
      component={FarmManagementScreen}
      options={{
        title: 'Farm Management',
      }}
    />
  </Drawer.Navigator>
);

const styles = StyleSheet.create({
  sidebarContainer: {
    flex: 1,
    padding: 16,
  },
  sidebarHeader: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    marginBottom: 16,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sidebarSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: '#e7f5ff',
  },
  sidebarIcon: {
    marginRight: 12,
    width: 24,
  },
  sidebarLabel: {
    fontSize: 16,
    color: '#495057',
  },
  sidebarLabelActive: {
    fontWeight: 'bold',
    color: '#4dabf7',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  sidebarFooter: {
    paddingVertical: 16,
  },
  sidebarFooterText: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
  },
});

export default DrawerNavigator;