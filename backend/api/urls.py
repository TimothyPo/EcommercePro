from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, CartViewSet, OrderViewSet, 
    UserRegistrationView, UserProfileViewSet
)
from .payments import create_payment_intent, payment_success

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'auth', UserRegistrationView, basename='auth')
router.register(r'profile', UserProfileViewSet, basename='profile')

urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view({'post': 'register'}), name='register'),
    path('payments/create-payment-intent/', create_payment_intent, name='create-payment-intent'),
    path('payments/payment-success/', payment_success, name='payment-success'),
    path('', include(router.urls)),
]
