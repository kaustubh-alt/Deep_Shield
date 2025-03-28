import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const API_CONFIG = {
  URL: "https://x9j8w8gm-8000.inc1.devtunnels.ms/api/process-image/",
  BASE_URL: "https://x9j8w8gm-8000.inc1.devtunnels.ms",
  KEY: "", // No API key needed for this service
};

interface ProcessImageResult {
  prediction: {
    label: string;      
    confidence: number; 
  } | null;
  processedImageUrl?: string; 
  error: string | null;     
}

class ModelService {
  isModelReady: boolean = true;

  constructor() {
    console.log('Model service initialized with external API');
  }

  private getFullMediaUrl(mediaPath: string): string {
    if (mediaPath.startsWith('http')) {
      return mediaPath;
    }
    
    // If the path doesn't start with /, add it
    if (!mediaPath.startsWith('/')) {
      mediaPath = '/' + mediaPath;
    }
    
    // Return the full URL by combining the base URL and media path
    return API_CONFIG.BASE_URL + mediaPath;
  }

  async processImage(uri: string): Promise<ProcessImageResult> {
    try {
      console.log('Starting image processing');
   
      const resizedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 600, height: 600 } }], 
        { format: SaveFormat.JPEG }              
      );

      console.log('Image resized successfully');
      
      
      const formData = new FormData();
      
      const fileInfo = {
        uri: resizedImage.uri,
        name: "uploaded_image.jpg", 
        type: "image/jpeg",       
      };
      
      // Append the file to form data with key 'image' as required by the API
      formData.append("image", fileInfo as any);
      
      console.log('Sending request to API...', API_CONFIG.URL);
      
    
      const response = await fetch(API_CONFIG.URL, {
        method: 'POST',                     
        headers: {
          "Content-Type": "multipart/form-data", 
        },
        body: formData                  
      });
      
      console.log('Response status:', response.status);
      
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        return { 
          prediction: null, 
          error: `Error processing image (${response.status}). Please try again.` 
        };
      }
    
      try {
        const result = await response.json();
        console.log('API response:', result);

        let processedImagePath = null;
        
        // Check all possible field names for the processed image path
        if (result.ProcessedImageUrl) processedImagePath = result.ProcessedImageUrl;
        else if (result.processedImageUrl) processedImagePath = result.processedImageUrl;
        else if (result.processed_image_url) processedImagePath = result.processed_image_url;
        else if (result.file_path) processedImagePath = result.file_path;
        else if (result.image_path) processedImagePath = result.image_path;
        else if (result.media_path) processedImagePath = result.media_path;
        else if (result.media) processedImagePath = result.media;
        else if (result.path) processedImagePath = result.path;
        
        let fullProcessedImageUrl = uri; // Default to original image
        if (processedImagePath) {
          console.log('Found processed image path:', processedImagePath);
          
          // If the path contains /media/, it's likely a server path
          if (typeof processedImagePath === 'string' && 
              (processedImagePath.includes('/media/') || processedImagePath.startsWith('media/'))) {
            fullProcessedImageUrl = this.getFullMediaUrl(processedImagePath);
            console.log('Full processed image URL:', fullProcessedImageUrl);
          } else {
            fullProcessedImageUrl = processedImagePath;
          }
        }
        
        if (result && result.Prediction) {
          return {
            prediction: {
              label: result.Prediction,               
              confidence: result.confidence || result.Confidence || 0.95
            },
            processedImageUrl: fullProcessedImageUrl,
            error: null
          };
        } else {

          if (result && typeof result.prediction !== 'undefined') {
            return {
              prediction: {

                label: result.prediction === true || result.prediction === 'fake' ? 'Fake' : 'Real',
                confidence: result.confidence || 0.95
              },
              processedImageUrl: fullProcessedImageUrl,
              error: null
            };
          } 
          else if (result && typeof result.is_fake !== 'undefined') {
            return {
              prediction: {
                label: result.is_fake ? 'Fake' : 'Real',
                confidence: result.confidence || 0.95
              },
              processedImageUrl: fullProcessedImageUrl,
              error: null
            };
          } 
          // Format 3: response.result field
          else if (result && typeof result.result !== 'undefined') {
            return {
              prediction: {
                label: typeof result.result === 'string' 
                  ? result.result 
                  : result.result === true ? 'Fake' : 'Real',
                confidence: result.score || result.confidence || 0.95
              },
              processedImageUrl: fullProcessedImageUrl,
              error: null
            };
          }
        }
        
        // If we couldn't interpret the JSON response but found a processed image
        if (processedImagePath) {
          return {
            prediction: {
              label: 'Unknown',
              confidence: 0.5
            },
            processedImageUrl: fullProcessedImageUrl,
            error: null
          };
        }
        
        // If we couldn't interpret the JSON response
        return {
          prediction: null,
          processedImageUrl: uri, // Fall back to original image
          error: 'Could not interpret server response'
        };
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        
        // Step 8: Handle text responses if JSON parsing fails
        const responseText = await response.text();
        console.log('API raw text response:', responseText);
        
        // Check if the response might contain a media path
        let mediaPathMatch = null;
        if (responseText.includes('/media/')) {
          // Try to extract a media path with simple regex
          mediaPathMatch = responseText.match(/\/media\/[^\s"']+/);
          if (mediaPathMatch) {
            const mediaPath = mediaPathMatch[0];
            console.log('Found media path in text response:', mediaPath);
            const fullUrl = this.getFullMediaUrl(mediaPath);
            
            return {
              prediction: {
                label: responseText.toLowerCase().includes('fake') ? 'Fake' : 'Real',
                confidence: 0.95
              },
              processedImageUrl: fullUrl,
              error: null
            };
          }
        }
        
        // Check if response text contains keywords
        if (typeof responseText === 'string' && responseText.trim().length > 0) {
          const lowerText = responseText.toLowerCase().trim();
          
          // Check for "fake" keyword
          if (lowerText === 'fake' || lowerText.includes('fake')) {
            return {
              prediction: {
                label: 'Fake',
                confidence: 0.95  // Default confidence when not provided
              },
              processedImageUrl: uri, // Fall back to original image
              error: null
            };
          } 
          // Check for "real" keyword
          else if (lowerText === 'real' || lowerText.includes('real')) {
            return {
              prediction: {
                label: 'Real',
                confidence: 0.95  // Default confidence when not provided
              },
              processedImageUrl: uri, // Fall back to original image
              error: null
            };
          }
        }
        
        // Couldn't interpret text response
        return {
          prediction: null,
          processedImageUrl: uri, // Fall back to original image
          error: 'Failed to parse server response'
        };
      }
    } catch (error) {
      // Step 9: Handle any unexpected errors
      console.error('Error processing image:', error);
      return { 
        prediction: null, 
        error: 'Failed to process image. Please check your connection.' 
      };
    }
  }
  
  /**
   * Updates the API URL (internal method, not exposed in UI)
   * @param url - New API URL to use
   */
  _updateApiUrl(url: string) {
    API_CONFIG.URL = url;
    const urlObj = new URL(url);
    API_CONFIG.BASE_URL = `${urlObj.protocol}//${urlObj.host}`;
    console.log('API URL updated internally. Base URL:', API_CONFIG.BASE_URL);
  }
  
  /**
   * Checks if the model service is ready to process images
   * @returns Boolean indicating if the service is ready
   */
  isLoaded() {
    return this.isModelReady;
  }
}

// Export as singleton instance to ensure only one service is used throughout the app
export default new ModelService(); 