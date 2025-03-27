import { StyleSheet, Platform, TouchableOpacity, Image, View, Text, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CONFIG } from '@/config';
import { DeepShieldAPI, AnalysisResult } from '@/services/api';

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    // Pick image
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null); // Reset previous result
    }
  };

  const takePicture = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Permission to access camera is required!');
      return;
    }

    // Take picture
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null); // Reset previous result
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    
    try {
      // Use our API service to analyze the image
      const analysisResult = await DeepShieldAPI.analyzeImage(image);
      setResult(analysisResult);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert(error instanceof Error ? error.message : 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>DeepShield</ThemedText>
      <ThemedText style={styles.subtitle}>Detect fake images with AI</ThemedText>
      
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <ThemedText>No image selected</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <ThemedText style={styles.buttonText}>Pick Image</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.analyzeButton, !image && styles.disabledButton]} 
        onPress={analyzeImage}
        disabled={!image || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.analyzeButtonText}>Analyze Image</ThemedText>
        )}
      </TouchableOpacity>

      {result && (
        <View style={[
          styles.resultContainer, 
          { backgroundColor: result.isFake ? CONFIG.UI.RESULT_COLORS.FAKE : CONFIG.UI.RESULT_COLORS.REAL }
        ]}>
          <ThemedText style={styles.resultText}>
            {result.isFake ? 'FAKE' : 'REAL'} 
            {result.confidence && ` (${result.confidence}% confidence)`}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
