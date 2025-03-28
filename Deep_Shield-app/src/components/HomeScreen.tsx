import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { NavigationProp, useNavigation, useIsFocused } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
      
      <View style={styles.header}>
        <Text style={styles.title}>DeepShield</Text>
        <Text style={styles.subtitle}>AI-Powered Fake Image Detection</Text>
      </View>
      
      <View style={styles.imageContainer}>
        <View style={styles.shieldLogo}>
          <Text style={styles.shieldText}>DS</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <Text style={styles.infoText}>
          1. Take a photo or select from gallery
        </Text>
        <Text style={styles.infoText}>
          2. Our AI model analyzes the image
        </Text>
        <Text style={styles.infoText}>
          3. Get results: Real or Fake
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.buttonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Deep Neural Networks
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  shieldLogo: {
    width: 200,
    height: 200,
    backgroundColor: '#4285F4',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  shieldText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#fff',
  },
  image: {
    width: 200,
    height: 200,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  }
}); 