import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import AssignmentQueueScreen from '../screens/AssignmentQueueScreen';
import AssignmentDetailScreen from '../screens/AssignmentDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ 
          headerShown: false 
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AssignmentQueue" component={AssignmentQueueScreen} />
        <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;