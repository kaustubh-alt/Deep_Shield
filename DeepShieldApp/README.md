# DeepShield - Deep Learning Image Analysis App

DeepShield is a React Native mobile application that allows users to upload images and analyze them using a Deep Neural Network (DNN) to determine if they are real or fake/manipulated.

## Features

- **Image Upload**: Select photos from your gallery or take new photos with your camera
- **AI Analysis**: Submit images to a deep learning model for fakeness detection
- **Real-time Results**: Receive immediate feedback on whether an image is genuine or fake
- **Confidence Score**: View the model's confidence level in its assessment

## Technologies Used

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **Deep Neural Networks**: Back-end AI model for image analysis
- **Axios**: For API communication

## Installation and Setup

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd DeepShieldApp
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure the API endpoint**:
   Edit `config.ts` to set your deep learning API endpoint:
   ```typescript
   export const API_ENDPOINT = 'https://your-deep-learning-api-endpoint.com/analyze';
   ```

4. **Run the application**:
   ```
   npm run ios     # For iOS
   npm run android # For Android
   npm run web     # For web
   ```

## Deep Learning Model Integration

The app is designed to communicate with any deep learning API that accepts image uploads and returns analysis results in the following format:

```json
{
  "isFake": true|false,
  "confidence": "95.7"
}
```

## API Service

The API service is implemented in `services/api.ts` and uses the Axios library to communicate with the backend. For development purposes, there's a mock API feature that can be enabled in the configuration file.

## Configuration

The `config.ts` file contains various settings:

```typescript
export const CONFIG = {
  // API settings
  API: {
    ENDPOINT: 'https://your-api-endpoint.com',
    TIMEOUT: 30000, // 30 seconds
  },
  
  // Feature flags
  ENABLE_MOCK_API: true, // For development
}
```

## Development

During development, you can use the mock API feature by setting `ENABLE_MOCK_API` to `true` in the config file. This will provide random fake/real results without requiring an actual backend.

## License

[Specify your license here]

## Credits

Created by [Your Name/Organization]
