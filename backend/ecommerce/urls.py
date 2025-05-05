from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Function to handle requests that should be redirected to the frontend
def frontend_redirect(request):
    # Return a 404 status to let the Express server handle the request
    return HttpResponse(status=404)

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Redirect root to frontend server
    path('', frontend_redirect, name='frontend'),
]
