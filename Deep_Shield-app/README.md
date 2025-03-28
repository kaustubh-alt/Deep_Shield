# DeepShield Web

A modern web application that uses a Deep Neural Network (DNN) to detect fake images with an advanced user interface.

## Features

- Modern, responsive UI built with Bootstrap 5
- Drag and drop interface for easy image uploads
- Detailed analysis results with confidence scores
- Integration with external DNN API for fake image detection

## Technologies Used

- Frontend: HTML, CSS, JavaScript, Bootstrap 5, Font Awesome
- Deep Learning: External DNN API for image processing

## API Integration

This application connects to an external API for image analysis:
- API URL: `https://x9j8w8gm-8000.inc1.devtunnels.ms/api/process-image/`
- Base URL: `https://x9j8w8gm-8000.inc1.devtunnels.ms`

## Setup and Installation

### Quick Start

Simply open the `index.html` file in a modern web browser to run the application locally.

### Using HTTP Server (recommended for development)

1. Clone the repository
```
git clone https://github.com/yourusername/DeepShield.git
cd DeepShield
```

2. Install the development HTTP server
```
npm install
```

3. Start the server
```
npm start
```

Your default browser will open automatically with the application.

## How It Works

1. User uploads an image by dragging and dropping or selecting from their device
2. The image is automatically sent to the external API as a base64-encoded string
3. The API processes the image using a DNN model and returns the result
4. The application displays the result with detailed confidence levels and analysis scores

## UI Features

- **Drag & Drop Interface**: Easily upload images by dragging them into the upload area
- **Modern Design**: Clean, responsive interface built with Bootstrap 5
- **Detailed Results**: View confidence scores and analysis metrics for the processed image
- **Image Preview**: See the uploaded image alongside the analysis results

## License

MIT

---

## Future Improvements

- Add heatmap visualization of potentially manipulated areas
- Implement batch processing of multiple images
- Add user accounts to save analysis history
- Implement additional analysis methods for more comprehensive results
