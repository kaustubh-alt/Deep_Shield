from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
import os
from PIL import Image
import uuid
from .detector.deepint import DeepfakeDetector 
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import base64
import io

obj = DeepfakeDetector()

@api_view(['POST'])
def process_image(request):
    try:
        # Check if 'image' is in the request
        if 'image' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=400)

        # Get the uploaded image file
        image_file = request.FILES['image']

        # Validate file type (optional)
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
        if image_file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type. Upload JPEG or PNG images only.'}, status=400)

        # Save the file to the media directory
        file_name = f"{uuid.uuid4()}{os.path.splitext(image_file.name)[1]}"
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)

        # Write file to the file system
        with open(file_path, 'wb') as f:
            for chunk in image_file.chunks():
                f.write(chunk)

        # Return response with the file path
        return Response({'message': 'Image uploaded successfully', 'file_path': f"{settings.MEDIA_URL}{file_name}"})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


def demo_page(request):
    return render(request, 'index.html')