from django.urls import path
from . import views  # Assuming the view is in the same app

urlpatterns = [
    path('', views.demo_page, name='detect_image'),
    path('api/process-image/', views.process_image, name='process_image'),
]
