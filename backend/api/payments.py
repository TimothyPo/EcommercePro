import stripe
import os
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order, Cart
from decimal import Decimal

# Set Stripe API key
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    try:
        # Get cart data
        cart = Cart.objects.get(user=request.user)
        cart_items = cart.items.all()
        
        # Check if cart is empty
        if not cart_items.exists():
            return Response(
                {"error": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate total amount
        total_amount = sum(item.product.price * item.quantity for item in cart_items)
        
        # Create payment intent with proper amount (convert to cents)
        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),  # Convert to cents
            currency='usd',
            metadata={
                'user_id': request.user.id,
                'user_email': request.user.email or 'anonymous',
            },
        )
        
        return Response({
            'clientSecret': intent.client_secret,
            'amount': float(total_amount),
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_success(request):
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        shipping_address = request.data.get('shipping_address')
        
        if not payment_intent_id or not shipping_address:
            return Response(
                {"error": "Missing payment details or shipping address."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify payment with Stripe
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if payment_intent.status != 'succeeded':
            return Response(
                {"error": "Payment has not been completed successfully."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Process the order
        user = request.user
        cart = Cart.objects.get(user=user)
        cart_items = cart.items.all()
        
        # Calculate total amount
        total_amount = sum(item.product.price * item.quantity for item in cart_items)
        
        # Create order
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            shipping_address=shipping_address,
            status='processing'  # Use processing since payment succeeded
        )
        
        # Create order items and update stock
        for item in cart_items:
            from .models import OrderItem
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
        
        return Response({
            "success": True,
            "message": "Payment processed successfully.",
            "order_id": order.id
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )