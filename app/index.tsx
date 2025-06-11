import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import DrawerNavigator from './navigation/DrawerNavigator';
import { isLoggedIn } from './services/AuthService';

export default function Index() {
  const [authChecked, setAuthChecked] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    // בדיקה אם המשתמש מחובר
    const checkAuthStatus = async () => {
      const loggedIn = await isLoggedIn();
      setUserLoggedIn(loggedIn);
      setAuthChecked(true);
    };

    checkAuthStatus();
  }, []);

  const navigateToLogin = () => {
    router.push('/screens/LoginScreen');
  };

  const navigateToRegister = () => {
    router.push('/screens/RegisterScreen');
  };

  if (!authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (userLoggedIn) {
    return <DrawerNavigator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>ברוכים הבאים</Text>
        <Text style={styles.subtitle}>מערכת ניטור פרות</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={navigateToLogin}>
            <Text style={styles.buttonText}>התחברות</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={navigateToRegister}>
            <Text style={styles.buttonText}>הרשמה</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 960,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#38434D',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: '#34A853',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});