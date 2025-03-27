// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const result = document.getElementById('result');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceText = document.getElementById('confidenceText');
const status = document.getElementById('status');
const resultImage = document.getElementById('resultImage');
const loadingOverlay = document.querySelector('.loading-overlay');
const originalImage = document.getElementById('originalImage');
const elaImage = document.getElementById('elaImage');
const metadataContent = document.getElementById('metadataContent');
const comparisonOriginal = document.getElementById('comparisonOriginal');
const comparisonProcessed = document.getElementById('comparisonProcessed');

// Drag and Drop Event Handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#0a58ca';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#0d6efd';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#0d6efd';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

// File Handling
function handleFile(file) {
    showLoading();
    
    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);
    
    // Display original image
    originalImage.src = imageUrl;
    comparisonOriginal.src = imageUrl;
    
    // Extract metadata
    extractMetadata(file);
    
    // Perform ELA analysis
    performELA(file);
    
    // Simulate AI analysis (replace with actual API call)
    simulateAnalysis(file);
}

// Metadata Extraction
function extractMetadata(file) {
    EXIF.getData(file, function() {
        const metadata = {};
        
        // Basic file information
        metadata['File Name'] = file.name;
        metadata['File Size'] = formatFileSize(file.size);
        metadata['File Type'] = file.type;
        
        // EXIF data
        const exifData = EXIF.getAllTags(this);
        if (exifData) {
            metadata['Camera Make'] = exifData.Make || 'Not available';
            metadata['Camera Model'] = exifData.Model || 'Not available';
            metadata['Date Taken'] = exifData.DateTime || 'Not available';
            metadata['Exposure Time'] = exifData.ExposureTime ? `1/${exifData.ExposureTime}` : 'Not available';
            metadata['Focal Length'] = exifData.FocalLength ? `${exifData.FocalLength}mm` : 'Not available';
            metadata['ISO'] = exifData.ISOSpeedRatings || 'Not available';
        }
        
        // Update metadata display
        updateMetadataDisplay(metadata);
    });
}

// Error Level Analysis (ELA)
function performELA(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Apply ELA
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Calculate error level
                const error = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
                
                // Apply error level to pixel
                data[i] = error;
                data[i + 1] = error;
                data[i + 2] = error;
            }
            
            // Put modified image data back
            ctx.putImageData(imageData, 0, 0);
            
            // Display ELA result
            elaImage.src = canvas.toDataURL();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Simulate AI Analysis (Replace with actual API call)
function simulateAnalysis(file) {
    setTimeout(() => {
        // Simulate confidence score (0-1)
        const confidence = Math.random();
        
        // Update UI
        updateAnalysisResult(confidence);
        
        // Hide loading overlay
        hideLoading();
    }, 2000);
}

// UI Updates
function updateAnalysisResult(confidence) {
    result.classList.remove('d-none');
    
    // Update confidence score
    const confidencePercentage = (confidence * 100).toFixed(2);
    confidenceFill.style.width = `${confidencePercentage}%`;
    confidenceText.textContent = `${confidencePercentage}%`;
    
    // Update status
    if (confidence > 0.7) {
        status.textContent = 'HIGH RISK';
        status.className = 'badge bg-danger';
    } else if (confidence > 0.4) {
        status.textContent = 'MODERATE RISK';
        status.className = 'badge bg-warning';
    } else {
        status.textContent = 'LOW RISK';
        status.className = 'badge bg-success';
    }
}

function updateMetadataDisplay(metadata) {
    metadataContent.innerHTML = '';
    for (const [key, value] of Object.entries(metadata)) {
        const item = document.createElement('div');
        item.className = 'metadata-item';
        item.innerHTML = `
            <span class="metadata-key">${key}</span>
            <span class="metadata-value">${value}</span>
        `;
        metadataContent.appendChild(item);
    }
}

// Loading Overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Image Zoom Functionality
resultImage.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lens = document.querySelector('.zoom-lens');
    const result = document.querySelector('.zoom-result');
    
    lens.style.display = 'block';
    result.style.display = 'block';
    
    lens.style.left = (x - lens.offsetWidth/2) + 'px';
    lens.style.top = (y - lens.offsetHeight/2) + 'px';
    
    result.style.backgroundImage = `url(${this.src})`;
    result.style.backgroundSize = `${this.width * 2}px ${this.height * 2}px`;
    result.style.backgroundPosition = `-${x * 2 - result.offsetWidth/2}px -${y * 2 - result.offsetHeight/2}px`;
});

resultImage.addEventListener('mouseleave', function() {
    document.querySelector('.zoom-lens').style.display = 'none';
    document.querySelector('.zoom-result').style.display = 'none';
});