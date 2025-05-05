import { Stack, SplashScreen, router } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

// Prevent auto hiding of splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check for auth on first load
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        
        // Determine if user is authenticated
        setAuthenticated(Boolean(token && user));

        // Give time to load app fully
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error('Error checking auth', error);
      } finally {
        setInitializing(false);
        SplashScreen.hideAsync();
      }
    };
    
    checkAuth();
  }, []);

  // Show loading screen while checking auth
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          // Make sure login and app stack don't transition
          animation: 'none',
        }}  
      />
      <Stack.Screen name="login" />
      <Stack.Screen 
        name="queue" 
        options={{
          // Prevent going back to login screen
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Assignment/[id]" 
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          animation: 'fade',
        }} 
      />
    </Stack>
  );
}