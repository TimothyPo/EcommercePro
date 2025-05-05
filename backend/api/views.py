from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Cart, CartItem, Order, OrderItem, UserProfile
from .serializers import (
    ProductSerializer, CartSerializer, CartItemSerializer, 
    OrderSerializer, CheckoutSerializer, UserRegistrationSerializer,
    UserProfileSerializer
)
from .permissions import IsAdminUser, IsCustomerUser

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']
    filterset_fields = ['price']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.AllowAny()]
    
    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        
        # Check if the product is in any order
        if OrderItem.objects.filter(product=product).exists():
            return Response(
                {"detail": "This product cannot be deleted as it is part of an order."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerUser]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        # Get or create cart for the user
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        serializer = CartItemSerializer(data={
            'product_id': request.data.get('product_id'),
            'quantity': request.data.get('quantity', 1)
        }, context={'request': request})
        
        if serializer.is_valid():
            product = Product.objects.get(pk=request.data.get('product_id'))
            
            # Check if stock is available
            if product.stock <= 0:
                return Response(
                    {"detail": "This product is out of stock."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if quantity requested is available
            if product.stock < int(request.data.get('quantity', 1)):
                return Response(
                    {"detail": f"Not enough stock. Available: {product.stock}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if already in cart
            existing_item = CartItem.objects.filter(cart=cart, product=product).first()
            if existing_item:
                existing_item.quantity += int(request.data.get('quantity', 1))
                existing_item.save()
                return Response(CartItemSerializer(existing_item).data)
            else:
                cart_item = CartItem.objects.create(
                    cart=cart,
                    product=product,
                    quantity=int(request.data.get('quantity', 1))
                )
                return Response(CartItemSerializer(cart_item).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        product_id = request.data.get('product_id')
        
        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            cart_item.delete()
            return Response({"detail": "Item removed from cart."})
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found in cart."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            
            # If quantity is 0, remove item
            if quantity <= 0:
                cart_item.delete()
                return Response({"detail": "Item removed from cart."})
            
            # Check if quantity requested is available
            if cart_item.product.stock < quantity:
                return Response(
                    {"detail": f"Not enough stock. Available: {cart_item.product.stock}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart_item.quantity = quantity
            cart_item.save()
            return Response(CartItemSerializer(cart_item).data)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found in cart."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response({"detail": "Cart cleared."})
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        serializer = CheckoutSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                order = serializer.save()
                return Response(OrderSerializer(order).data)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'created_at']
    
    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        
        # If admin, show all orders
        if hasattr(user, 'profile') and user.profile.is_admin:
            return Order.objects.all().order_by('-created_at')
        
        # If customer, show only their orders
        return Order.objects.filter(user=user).order_by('-created_at')

class UserRegistrationView(viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "User registered successfully."},
                status=status.HTTP_201_CREATED
            )
            
        # Check if username already exists
        username = request.data.get('username')
        if username and User.objects.filter(username=username).exists():
            return Response(
                {"username": ["A user with that username already exists."]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Otherwise return the general errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Return the current user's profile
        """
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
