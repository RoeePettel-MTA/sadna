import AsyncStorage from '@react-native-async-storage/async-storage';

// מפתח לשמירת מצב ההתחברות
const AUTH_KEY = '@auth_status';
const USER_KEY = '@user_data';

// פונקציה להתחברות
export const login = async (email: string, password: string) => {
  try {
    // בפרויקט אמיתי, כאן תהיה קריאה לשרת לאימות
    // לצורך הדגמה, נקבל כל משתמש וסיסמה
    const userData = { email, name: email.split('@')[0] };
    
    // שמירת מצב התחברות ופרטי משתמש
    await AsyncStorage.setItem(AUTH_KEY, 'true');
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'שגיאה בהתחברות' };
  }
};

// פונקציה להרשמה
export const register = async (email: string, password: string) => {
  try {
    // בפרויקט אמיתי, כאן תהיה קריאה לשרת לרישום
    const userData = { email, name: email.split('@')[0] };
    
    // שמירת מצב התחברות ופרטי משתמש
    await AsyncStorage.setItem(AUTH_KEY, 'true');
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'שגיאה בהרשמה' };
  }
};

// פונקציה להתנתקות
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'שגיאה בהתנתקות' };
  }
};

// בדיקה אם המשתמש מחובר
export const isLoggedIn = async () => {
  try {
    const authStatus = await AsyncStorage.getItem(AUTH_KEY);
    return authStatus === 'true';
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// קבלת פרטי המשתמש המחובר
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};