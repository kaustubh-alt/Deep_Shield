import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Image, ScrollView, Dimensions, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import modelService from '../services/modelService';
import { NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
};

type CameraScreenNavigationProp = NavigationProp<RootStackParamList, 'Camera'>;

interface CameraScreenProps {
  navigation: CameraScreenNavigationProp;
}

interface PredictionResult {
  label: string;
  confidence: number;
}

const { width, height } = Dimensions.get('window');

// Color palette
const COLORS = {
  primary: '#4361EE',
  primaryDark: '#3A56D4',
  secondary: '#4CC9F0',
  success: '#4ECB71',
  danger: '#F72585',
  warning: '#F9C74F',
  light: '#F8F9FA',
  dark: '#212529',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
};

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showResults, setShowResults] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (showResults) {
      navigation.setOptions({
        headerShown: false
      });
    } else {
      navigation.setOptions({
        headerShown: true,
        title: 'DeepShield'
      });
    }
  }, [showResults, navigation]);

  useEffect(() => {
    StatusBar.setHidden(false);
  }, []);

  const takePicture = async () => {
    try {
      // Reset states
      setResult(null);
      setError(null);
      setProcessedImage(null);
      setShowResults(false);

      const cameraResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
        const uri = cameraResult.assets[0].uri;
        setCapturedImage(uri);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      setError('Failed to take picture');
    }
  };

  const pickImage = async () => {
    try {
      // Reset states
      setResult(null);
      setError(null);
      setProcessedImage(null);
      setShowResults(false);

      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (galleryStatus.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant gallery permissions to upload photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setCapturedImage(uri);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      setError('Failed to pick image from gallery');
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) {
      setError('Please capture or select an image first');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await modelService.processImage(capturedImage);
      if (response.error) {
        setError(response.error);
        setIsProcessing(false);
        return;
      }
      
      // Update UI with prediction results
      if (response.prediction) {
        setResult(response.prediction);

        if (response.processedImageUrl) {
          setProcessedImage(response.processedImageUrl);
        } else {
          setProcessedImage(capturedImage);
        }
        
        // Switch to results view
        setShowResults(true);
      } else {
        setError('Unable to determine if the image is real or fake');
      }
    } catch (error) {
      console.error('Error in image processing:', error);
      setError('Failed to process the image');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToCapture = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    setResult(null);
    setError(null);
    setShowResults(false);
  };

  // Render permission loading state
  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <StatusBar backgroundColor={COLORS.light} barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  // Render permission denied state
  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <StatusBar backgroundColor={COLORS.light} barStyle="dark-content" />
        <Ionicons name="close-circle" size={64} color={COLORS.gray} />
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => ImagePicker.requestCameraPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render the comparison view when showing results
  if (showResults && capturedImage && processedImage) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.light} barStyle="dark-content" />
        <View style={styles.resultsHeader}>
          <TouchableOpacity 
            style={styles.backButtonSmall}
            onPress={resetToCapture}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={styles.resultHeaderText}>Analysis Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Result banner */}
          {result && (
            <View style={[
              styles.resultBanner,
              result.label.toLowerCase() === 'fake' ? styles.fakeBanner : styles.realBanner
            ]}>
              <View style={styles.resultIconContainer}>
                <Ionicons 
                  name={result.label.toLowerCase() === 'fake' ? 'alert-circle' : 'checkmark-circle'} 
                  size={28} 
                  color={COLORS.light} 
                />
              </View>
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>
                  {result.label}
                </Text>
                <Text style={styles.resultConfidence}>
                  Probability Score: {result.confidence > 1 ? result.confidence.toFixed(2) : (result.confidence * 100).toFixed(2)}%
                </Text>
              </View>
            </View>
          )}

          {/* Image comparison */}
          <View style={styles.comparisonContainer}>
            {/* Original image */}
            <View style={styles.imageCard}>
              <Text style={styles.imageLabel}>Original</Text>
              <Image source={{ uri: capturedImage }} style={styles.comparisonImage} />
            </View>
            
            {/* Processed image */}
            <View style={styles.imageCard}>
              <Text style={styles.imageLabel}>Processed</Text>
              <Image source={{ uri: processedImage }} style={styles.comparisonImage} />
            </View>
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>
              What does this mean?
            </Text>
            <Text style={styles.descriptionText}>
              {result && result.label.toLowerCase() === 'fake' 
                ? "This image has been detected as potentially manipulated or artificially generated."
                : "This image appears to be an authentic photograph without signs of manipulation."
              }
            </Text>
          </View>
          
          {/* Action button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={resetToCapture}
          >
            <Ionicons name="camera" size={20} color={COLORS.light} style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Error message display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  }

  // Main capture mode render
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.light} barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DeepShield</Text>
        <Text style={styles.headerSubtitle}>Detect manipulated images</Text>
      </View>
      
      {/* Image preview area */}
      <View style={styles.previewContainer}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.preview} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image" size={64} color={COLORS.gray} />
            <Text style={styles.placeholderText}>
              Take a photo or select from gallery
            </Text>
          </View>
        )}
      </View>
      
      {/* Analyze button */}
      {capturedImage && (
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={analyzeImage}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.light} />
          ) : (
            <>
              <Ionicons name="search" size={20} color={COLORS.light} style={styles.buttonIcon} />
              <Text style={styles.analyzeButtonText}>Analyze Image</Text>
            </>
          )}
        </TouchableOpacity>
      )}
      
      {/* Loading overlay */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Analyzing image...</Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        </View>
      )}
        
      {/* Camera and gallery controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          {/* Gallery button */}
          <TouchableOpacity
            style={styles.roundButton}
            onPress={pickImage}
            disabled={isProcessing}
          >
            <Ionicons name="images" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          
          {/* Camera capture button */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color={COLORS.light} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          
          {/* Reset button (only show if there's a captured image) */}
          {capturedImage ? (
            <TouchableOpacity
              style={styles.roundButton}
              onPress={resetToCapture}
              disabled={isProcessing}
            >
              <Ionicons name="refresh" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyButton} />
          )}
        </View>
      </View>

      {/* Error message display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.dark,
    marginTop: 15,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.light,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButtonSmall: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  previewContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 15,
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 25,
    margin: 15,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  analyzeButtonText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    width: width * 0.8,
    elevation: 5,
  },
  loadingText: {
    color: COLORS.dark,
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingSubtext: {
    color: COLORS.gray,
    marginTop: 5,
    fontSize: 14,
  },
  controlsContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  roundButton: {
    padding: 15,
    borderRadius: 50,
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: COLORS.primary,
    elevation: 2,
  },
  emptyButton: {
    width: 54, // Same width as button with padding
    height: 54, // Same height as button with padding
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(67, 97, 238, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: COLORS.primary,
  },
  resultBanner: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  fakeBanner: {
    backgroundColor: COLORS.danger,
  },
  realBanner: {
    backgroundColor: COLORS.success,
  },
  resultIconContainer: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light,
  },
  resultConfidence: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  imageCard: {
    width: (width - 45) / 2, // Half width minus margins
    borderRadius: 10,
    backgroundColor: COLORS.light,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    padding: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  comparisonImage: {
    width: '100%',
    height: width * 0.4, // Square images
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  resultHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'center',
    flex: 1,
  },
  descriptionContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 25,
    margin: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
  },
  actionButtonText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: COLORS.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  errorText: {
    color: COLORS.light,
    fontSize: 14,
    textAlign: 'center',
  }
});