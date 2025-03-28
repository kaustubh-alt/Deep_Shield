// DOM Elements
const imageUploadInput = document.getElementById('image-upload');
const selectImageBtn = document.getElementById('selectImageBtn');
const dropZone = document.getElementById('dropZone');
const previewImage = document.getElementById('preview-image');
const originalImage = document.getElementById('original-image');
const resultSection = document.getElementById('result-section');
const resultText = document.getElementById('result-text');
const confidenceBar = document.getElementById('confidence-bar');
const confidencePercent = document.getElementById('confidence-percent');
const newAnalysisButton = document.getElementById('new-analysis-button');
const loadingOverlay = document.getElementById('loading-overlay');

// Global variables
let currentImageData = null;
let uploadedImageUrl = null;

// API URLs
const API_URL = "https://x9j8w8gm-8000.inc1.devtunnels.ms/api/process-image/";
const BASE_URL = "https://x9j8w8gm-8000.inc1.devtunnels.ms";

// Event listeners
imageUploadInput.addEventListener('change', handleImageUpload);
selectImageBtn.addEventListener('click', () => imageUploadInput.click());
newAnalysisButton.addEventListener('click', resetAnalysis);

// Drag and Drop Events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

dropZone.addEventListener('drop', handleDrop, false);

// Functions
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropZone.classList.add('dragover');
}

function unhighlight() {
    dropZone.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        imageUploadInput.files = files;
        handleImageUpload({ target: imageUploadInput });
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
        // Create a local object URL for the uploaded image
        uploadedImageUrl = URL.createObjectURL(file);
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            originalImage.src = uploadedImageUrl;
            previewImage.src = uploadedImageUrl;
            currentImageData = e.target.result;
            
            // Start analysis immediately when file is loaded
            analyzeImage(file);
        };
        
        reader.readAsDataURL(file);
    }
}

async function analyzeImage(file) {
    if (!currentImageData) {
        alert('Please upload an image first');
        return;
    }
    
    // Show loading overlay with fade in
    loadingOverlay.style.display = 'flex';
    setTimeout(() => {
        loadingOverlay.style.opacity = '1';
    }, 10);
    
    try {
        // Extract base64 data without the prefix
        let imageData = currentImageData;
        if (imageData.includes('base64,')) {
            imageData = imageData.split('base64,')[1];
        }
        
        // Create FormData for file upload approach
        const formData = new FormData();
        formData.append('image', file);
        
        // First try FormData approach
        try {
            const formResponse = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
            
            if (formResponse.ok) {
                const result = await formResponse.json();
                displayResults(result, uploadedImageUrl);
                return;
            }
        } catch (formError) {
            console.log('FormData approach failed, trying JSON approach...');
        }
        
        // Fall back to JSON approach if FormData fails
        const jsonResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
        });
        
        if (!jsonResponse.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await jsonResponse.json();
        
        // Display results
        displayResults(result, uploadedImageUrl);
    } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Error analyzing image. Please try again.');
    } finally {
        // Hide loading overlay with fade out
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }
}

function displayResults(result, uploadedImageUrl) {
    // Prepare to show results section
    resultSection.classList.remove('d-none');
    resultSection.style.opacity = '0';
    dropZone.style.display = 'none';
    
    // Assuming the API returns a result with prediction data
    // Adjust these fields based on the actual API response format
    let isReal = false;
    let confidence = 0;
    
    // Check for Prediction field from reference code
    if (result.Prediction !== undefined) {
        // If using the format from the reference code
        isReal = result.Prediction.toLowerCase() === 'real';
        confidence = result.confidence || 0.8; // Default confidence if not provided
    }
    // Check the structure of the API response and extract relevant information
    else if (result.prediction !== undefined) {
        // If the API returns a 'prediction' field
        isReal = result.prediction === 'real';
        confidence = result.confidence || 0;
    } else if (result.is_real !== undefined) {
        // If the API returns an 'is_real' field
        isReal = result.is_real;
        confidence = result.confidence || 0;
    } else if (result.isReal !== undefined) {
        // If the API returns an 'isReal' field
        isReal = result.isReal;
        confidence = result.confidence || 0;
    } else if (result.is_authentic !== undefined) {
        // If the API returns an 'is_authentic' field from the new UI
        isReal = result.is_authentic;
        confidence = result.confidence || 0;
    } else {
        // Default fallback
        isReal = false;
        confidence = 0;
        console.error('Unknown API response format:', result);
    }
    
    // Process confidence value
    confidence = parseFloat(confidence) || 0;
    
    // If confidence is given as a decimal (0-1), convert to percentage
    if (confidence > 0 && confidence < 1) {
        confidence = confidence * 100;
    }
    
    // Round up to the nearest integer using Math.ceil()
    confidence = Math.ceil(confidence);
    
    // Ensure confidence is within 0-100 range
    confidence = Math.min(Math.max(confidence, 0), 100);
    
    // Display the processed image if it's available
    const processedImageUrl = result.file_path || result.processed_image || BASE_URL + "/processed_image";
    
    // Update the original and processed images
    originalImage.src = uploadedImageUrl;
    previewImage.src = processedImageUrl;
    
    // Apply the appropriate CSS class to the result text
    resultText.classList.remove('real', 'fake');
    
    // Set result text based on result
    if (isReal) {
        resultText.innerHTML = 'This image appears to be <span class="text-success">REAL</span>';
        resultText.classList.add('real');
    } else {
        resultText.innerHTML = 'This image appears to be <span class="text-danger">FAKE</span>';
        resultText.classList.add('fake');
    }
    
    // Add a slight delay before displaying confidence to allow for animation
    setTimeout(() => {
        // Update confidence bar
        confidenceBar.style.width = `${confidence}%`;
        confidencePercent.textContent = `${confidence}%`;
        
        // Set color of confidence bar based on result
        if (isReal) {
            confidenceBar.style.backgroundColor = 'var(--success-color)';
        } else {
            confidenceBar.style.backgroundColor = 'var(--danger-color)';
        }
        
        // Fade in the results
        resultSection.style.opacity = '1';
    }, 100);
}

function resetAnalysis() {
    // Reset form and variables
    imageUploadInput.value = '';
    currentImageData = null;
    uploadedImageUrl = null;
    
    // Fade out the result section
    resultSection.style.opacity = '0';
    
    setTimeout(() => {
        // Reset UI
        resultSection.classList.add('d-none');
        confidenceBar.style.width = '0%';
        
        // Reset images
        originalImage.src = '';
        previewImage.src = '';
        
        // Show upload area with fade in
        dropZone.style.display = 'block';
        dropZone.style.opacity = '0';
        setTimeout(() => {
            dropZone.style.opacity = '1';
        }, 10);
    }, 400);
}
