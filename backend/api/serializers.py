from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Cart, CartItem, Order, OrderItem, UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'is_admin', 'phone_number', 'address']
        read_only_fields = ['id']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    is_admin = serializers.BooleanField(required=False, default=False, write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'is_admin']
    
    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        is_admin = validated_data.pop('is_admin', False)
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, is_admin=is_admin)
        
        # Create a cart for the new user if they are a customer (not admin)
        if not is_admin:
            Cart.objects.create(user=user)
            
        return user

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'image_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'added_at']
        read_only_fields = ['id', 'added_at']
    
    def create(self, validated_data):
        product = validated_data.pop('product_id')
        validated_data['product'] = product
        
        # Check if stock is available
        if product.stock <= 0:
            raise serializers.ValidationError({"product": "This product is out of stock."})
        
        # Check if the product already exists in cart
        cart = validated_data.get('cart')
        existing_item = CartItem.objects.filter(cart=cart, product=product).first()
        
        if existing_item:
            # If already in cart, update quantity
            existing_item.quantity += validated_data.get('quantity', 1)
            existing_item.save()
            return existing_item
        
        return super().create(validated_data)

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_total_price(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']
        read_only_fields = ['id']
    
    def get_product_name(self, obj):
        return obj.product.name

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'username', 'status', 'total_amount', 'shipping_address', 
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'username', 'created_at', 'updated_at']
    
    def get_username(self, obj):
        return obj.user.username

class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.CharField(required=True)
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.get(user=user)
        cart_items = cart.items.all()
        
        # Check if cart is empty
        if not cart_items.exists():
            raise serializers.ValidationError({"cart": "Your cart is empty."})
        
        # Check if all items are in stock
        for item in cart_items:
            if item.product.stock < item.quantity:
                raise serializers.ValidationError({
                    "product": f"'{item.product.name}' does not have enough stock. Available: {item.product.stock}"
                })
        
        # Calculate total amount
        total_amount = sum(item.product.price * item.quantity for item in cart_items)
        
        # Create order
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            shipping_address=validated_data['shipping_address']
        )
        
        # Create order items and update stock
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            
            # Update stock
            item.product.stock -= item.quantity
            item.product.save()
        
        # Clear cart
        cart.items.all().delete()
        
        return order
