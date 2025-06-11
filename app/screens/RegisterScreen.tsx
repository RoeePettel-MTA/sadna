import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { register } from '../services/AuthService';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password);
      
      if (result.success) {
        Alert.alert(
          'הרשמה הצליחה', 
          'החשבון נוצר בהצלחה',
          [{ text: 'אישור', onPress: () => router.replace('/') }]
        );
      } else {
        Alert.alert('שגיאה בהרשמה', result.error);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בעת ההרשמה');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/screens/LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הרשמה</Text>
      
      <TextInput
        style={styles.input}
        placeholder="אימייל"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="סיסמה"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="אימות סיסמה"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'נרשם...' : 'הירשם'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.loginLink} 
        onPress={navigateToLogin}
      >
        <Text style={styles.loginText}>
          כבר יש לך חשבון? התחבר כאן
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'right',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4285F4',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    color: '#4285F4',
    fontSize: 14,
  },
});