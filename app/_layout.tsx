import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check for auth on first load
    const checkAuth = async () => {
      try {
        // Wait a bit to avoid flash of loading screen
        await new Promise(resolve => setTimeout(resolve, 200));
        setInitializing(false);
      } catch (error) {
        console.error('Error checking auth', error);
        setInitializing(false);
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
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="queue" />
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