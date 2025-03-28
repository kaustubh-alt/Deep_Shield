import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import HomeScreen from './src/components/HomeScreen';
import CameraScreen from './src/components/CameraScreen';

// Create the stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#4361EE" barStyle="light-content" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: 'DeepShield',
            headerStyle: {
              backgroundColor: '#4361EE',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ 
            title: '',
            headerStyle: {
              backgroundColor: '#4361EE',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
