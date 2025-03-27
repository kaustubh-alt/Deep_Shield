import axios from 'axios';
import { CONFIG } from '@/config';

export interface AnalysisResult {
  isFake: boolean;
  confidence?: string;
}

/**
 * API service for communicating with the Deep Learning backend
 */
export class DeepShieldAPI {
  /**
   * Analyze an image to determine if it's fake or real
   * @param imageUri URI of the image to analyze
   * @returns Analysis result indicating if the image is fake and the confidence level
   */
  static async analyzeImage(imageUri: string): Promise<AnalysisResult> {
    if (CONFIG.ENABLE_MOCK_API) {
      // Simulate API call with a delay for development
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { 
        isFake: Math.random() > 0.5, 
        confidence: (Math.random() * 100).toFixed(2) 
      };
    }

    try {
      // Create form data for API request
      const formData = new FormData();
      const imageName = imageUri.split('/').pop() || 'image.jpg';
      const imageType = 'image/' + (imageName.split('.').pop() === 'png' ? 'png' : 'jpeg');
      
      // @ts-ignore - FormData in React Native has slightly different typing
      formData.append('image', {
        uri: imageUri,
        name: imageName,
        type: imageType,
      });

      // Make API call
      const response = await axios.post(CONFIG.API.ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: CONFIG.API.TIMEOUT,
      });

      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }
} 