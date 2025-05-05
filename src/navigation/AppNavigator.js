import React from 'react';
import { router } from 'expo-router';

// This file is now just a compatibility layer for legacy screen imports
// It redirects to the new expo-router paths

const AppNavigator = () => {
  // This component is now just a bridge to expo-router
  // It shouldn't be used directly anymore
  
  React.useEffect(() => {
    // Redirect to the main app route
    router.replace('/');
  }, []);
  
  return null;
};

// Helper functions to navigate from older components
AppNavigator.navigateToLogin = () => router.replace('/');
AppNavigator.navigateToQueue = () => router.replace('/queue');
AppNavigator.navigateToAssignment = (id) => router.replace(`/assignment/${id}`);

export default AppNavigator;