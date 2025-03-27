import { StyleSheet, ScrollView, Image, Linking } from 'react-native';
import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CONFIG } from '@/config';

export default function InfoScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.title}>About DeepShield</ThemedText>
        <ThemedText>
          DeepShield is an application that uses advanced deep neural networks (DNN) to analyze images and detect if they are fake or manipulated.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>How It Works</ThemedText>
        <ThemedText style={styles.paragraph}>
          DeepShield uses a sophisticated deep learning model trained to identify visual inconsistencies, anomalies, and artifacts that are typically present in manipulated images.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          Our model analyzes patterns at the pixel level that may be invisible to the human eye, such as:
        </ThemedText>
        <ThemedText style={styles.listItem}>• Inconsistent lighting and shadows</ThemedText>
        <ThemedText style={styles.listItem}>• Unusual blending boundaries</ThemedText>
        <ThemedText style={styles.listItem}>• Noise pattern inconsistencies</ThemedText>
        <ThemedText style={styles.listItem}>• Digital manipulation artifacts</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Using the App</ThemedText>
        <ThemedText style={styles.paragraph}>
          1. Upload an image or take a photo using the Detector tab
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          2. Tap "Analyze Image" to process the image with our AI model
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          3. View the results showing whether the image is real or fake, along with a confidence score
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Limitations</ThemedText>
        <ThemedText style={styles.paragraph}>
          While our model is highly advanced, no detection system is perfect. Results should be considered as probability rather than absolute truth.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          Factors that may affect accuracy:
        </ThemedText>
        <ThemedText style={styles.listItem}>• Image quality and resolution</ThemedText>
        <ThemedText style={styles.listItem}>• Sophisticated manipulation techniques</ThemedText>
        <ThemedText style={styles.listItem}>• Images with extreme compression</ThemedText>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.version}>Version {CONFIG.APP_VERSION}</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 20,
  },
  listItem: {
    marginLeft: 8,
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    marginBottom: 40,
    alignItems: 'center',
  },
  version: {
    opacity: 0.6,
  },
}); 