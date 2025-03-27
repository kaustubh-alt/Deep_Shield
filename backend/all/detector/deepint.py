import os
import torch
import torch.nn as nn
import cv2
import albumentations as A
from albumentations.pytorch import ToTensorV2
from torchvision import models
from dataclasses import dataclass
from typing import Dict, Union

@dataclass
class DeepfakeConfig:
    IMAGE_SIZE: int = 224
    NUM_CLASSES: int = 2
    DEVICE: torch.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    CLASS_LABELS: tuple = ('Real', 'Fake')

model_path = r'C:\Programs\intaste\Deep_Shield\backend\all\detector\best_model.pth'

class DeepfakeDetector:
    def __init__(self):
        self.config = DeepfakeConfig()
        self.model = self._create_model()
        self._load_weights(model_path)
        self.transform = self._setup_transforms()
        
    def _create_model(self) -> nn.Module:
        model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.5),
            nn.Linear(in_features=1280, out_features=self.config.NUM_CLASSES)
        )
        return model.to(self.config.DEVICE)
    
    def _load_weights(self, model_path: str) -> None:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model weights not found at: {model_path}")
        checkpoint = torch.load(model_path, map_location=self.config.DEVICE)
        state_dict = checkpoint.get('model_state_dict', checkpoint)
        self.model.load_state_dict(state_dict, strict=False)
        self.model.eval()
    
    def _setup_transforms(self) -> A.Compose:
        return A.Compose([
            A.Resize(height=self.config.IMAGE_SIZE, width=self.config.IMAGE_SIZE),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ])
    
    def predict(self, image_path: str) -> Dict[str, Union[str, float, Dict[str, float]]]:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at: {image_path}")
            
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        transformed = self.transform(image=image)
        input_tensor = transformed['image'].unsqueeze(0).to(self.config.DEVICE)
        
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            prediction = torch.argmax(outputs, dim=1).item()
            
        return {
            'prediction': self.config.CLASS_LABELS[prediction],
            'confidence': float(probs[prediction]) * 100,
        }