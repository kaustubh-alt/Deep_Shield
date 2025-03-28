import torch
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import cv2
import os
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from torchvision import models

# Constants
IMAGE_SIZE = (299, 299)
HEATMAP_THRESHOLD = 0.1  # Threshold for suspicious regions
SUSPICIOUS_AREA_THRESHOLD = 50  # Percentage threshold for classification as Fake

# Load a Pretrained Model
model = models.efficientnet_b7(pretrained=True)  # Switch to EfficientNet for better feature extraction
model.eval()

def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  # Updated normalization for EfficientNet
    ])
    
    # Open and resize image
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0)
    return image, input_tensor

def detect_fakeness(image_path, output_path):
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(output_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}")
    
    # Preprocess input image
    original_image, input_tensor = preprocess_image(image_path)
    
    # Get the model prediction
    with torch.no_grad():
        outputs = model(input_tensor)
        predictions = torch.nn.functional.softmax(outputs, dim=1)
        class_idx = torch.argmax(predictions).item()
        confidence = predictions[0, class_idx].item()
    
    # Use Grad-CAM to highlight suspicious regions
    target_layers = [model.features[-1]]  # Update target layers for EfficientNet
    cam = GradCAM(model=model, target_layers=target_layers)

    # Compute Grad-CAM heatmap
    targets = [ClassifierOutputTarget(class_idx)]
    grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0]
    
    # Resize grayscale_cam to match image dimensions
    grayscale_cam_resized = cv2.resize(grayscale_cam, (original_image.size[0], original_image.size[1]))
    
    # Calculate suspicious area coverage
    suspicious_pixels = np.sum(grayscale_cam_resized >= HEATMAP_THRESHOLD)
    total_pixels = grayscale_cam_resized.size
    suspicious_area_percentage = (suspicious_pixels / total_pixels) * 100

    # Classify as Fake or Real based on suspicious area coverage
    if suspicious_area_percentage > SUSPICIOUS_AREA_THRESHOLD:
        class_label = "Fake"
    else:
        class_label = "Real"
    
    # Create mask for suspicious regions
    suspicious_mask = grayscale_cam_resized >= HEATMAP_THRESHOLD
    
    # Convert original image to numpy array
    original_array = np.array(original_image)
    
    # Set opacity level (0 to 1, where 1 is fully opaque)
    opacity = 0.3
    
    # Create semi-transparent color overlays
    output_array = original_array.copy()  # Start with the original image
    
    # Apply red tint to suspicious regions
    red_tint = np.zeros_like(original_array)
    red_tint[..., 0] = 255  # Red channel
    mask_3d = np.stack([suspicious_mask] * 3, axis=2)
    output_array = np.where(
        mask_3d,
        (1 - opacity) * original_array + opacity * red_tint,
        output_array
    )
    
    # Apply green tint to non-suspicious regions
    green_tint = np.zeros_like(original_array)
    green_tint[..., 1] = 255  # Green channel
    output_array = np.where(
        ~mask_3d,
        (1 - opacity) * original_array + opacity * green_tint,
        output_array
    )

    try:
        # Save the highlighted image
        highlighted_image = Image.fromarray(output_array.astype(np.uint8))
        highlighted_image.save(output_path)
        print(f"Saved highlighted image to: {output_path}")
        
        # Print statistics
        print(f"Suspicious area coverage: {suspicious_area_percentage:.2f}%")
        print(f"Number of suspicious regions: {np.sum(suspicious_mask)}")
        
    except Exception as e:
        print(f"Error saving image: {str(e)}")

    status = "real" if confidence < 0.5 else "fake"
    con = confidence 
    print(f"Prediction: {status} (confidence: {con*100:.2f}%)")
    
    return status, con

def main():
    try:
        # Example Usage
        image_path = r'C:\Programs\eatright\ML\data\deepfake\Test\Real\real_5414.jpeg'
        output_path = r'C:\Programs\eatright\ML\results\highlighted_image.jpg'

        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        status, conf = detect_fakeness(image_path, output_path)
        print(f"Final Prediction: {status}, Confidence: {conf:.2f}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
