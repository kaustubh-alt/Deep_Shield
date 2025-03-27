from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
import os
from PIL import Image
import uuid

# Create your views here.

def detect_image(request):
    return render(request, 'detect_image.html')

@api_view(['POST'])
def process_image(request):
    try:
        # Check if image file is in request
        if 'image' not in request.FILES:
            return Response({
                'error': 'No image file provided'
            }, status=400)

        image_file = request.FILES['image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
        if image_file.content_type not in allowed_types:
            return Response({
                'error': 'Invalid file type. Please upload JPEG or PNG images only.'
            }, status=400)

        # Generate unique filename
        file_name = f"{uuid.uuid4()}{os.path.splitext(image_file.name)[1]}"
        file_path = os.path.join('uploads', file_name)

        # Save the file
        with default_storage.open(file_path, 'wb+') as destination:
            for chunk in image_file.chunks():
                destination.write(chunk)

        # Process image (add your image processing logic here)
        try:
            img = Image.open(default_storage.open(file_path))
            # Add your image processing code here
            # For example: dimensions = img.size

            response_data = {
                'success': True,
                'message': 'Image processed successfully',
                'file_name': file_name,
                'dimensions': f"{img.size[0]}x{img.size[1]}",
                # Add more data as needed
            }

            return Response(response_data, status=200)

        except Exception as e:
            return Response({
                'error': f'Error processing image: {str(e)}'
            }, status=500)

        finally:
            # Clean up - delete the uploaded file
            default_storage.delete(file_path)

    except Exception as e:
        return Response({
            'error': f'Server error: {str(e)}'
        }, status=500)