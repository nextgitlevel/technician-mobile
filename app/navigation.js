import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Centralized navigation functions for the app
export const AppNavigation = {
  // Auth routes
  goToLogin: () => router.replace('/'),
  goToMainApp: () => router.replace('/queue'),
  
  // Main app routes
  goToQueue: () => router.replace('/queue'),
  goToAssignment: (id) => router.navigate(`/Assignment/${id}`),
  goToTabs: () => router.replace('/(tabs)'),
  
  // Authentication helpers
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      return { isAuthenticated: Boolean(token && user), token, user: user ? JSON.parse(user) : null };
    } catch (error) {
      console.error('Error checking authentication:', error);
      return { isAuthenticated: false, token: null, user: null };
    }
  },
  
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
};

export default AppNavigation;