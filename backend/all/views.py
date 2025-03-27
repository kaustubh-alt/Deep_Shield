from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image
import uuid
import os
from django.views.decorators.csrf import csrf_exempt
from .detector.mlproj import detect_fakeness  # Import your detection function

@csrf_exempt
@api_view(['POST'])
def process_image(request):
    try:
        apikey = request.headers.get('apikey')
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
        file_path = default_storage.save(file_name, ContentFile(image_file.read()))

        # Optional: Resize the image
        full_file_path = os.path.join(settings.MEDIA_ROOT, file_path)
        with Image.open(full_file_path) as img:
            img = img.resize((800, 800))  # Resize image to 800x800
            img.save(full_file_path)

        status , con = detect_fakeness(full_file_path,full_file_path)

        

        # Return response with the file path
        return Response({'message': 'Image uploaded successfully','Prediction':status ,'confidence':con*100,'file_path': f"{settings.MEDIA_URL}{file_name}"})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


def demo_page(request):
    return render(request, 'main.html')

def old_page(request):
    return render(request, 'index.html')