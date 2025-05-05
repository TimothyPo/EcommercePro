import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Cart

def check_user_cart(username):
    try:
        user = User.objects.get(username=username)
        try:
            cart = user.cart
            print(f"User {username} has a cart (ID: {cart.id})")
        except User.cart.RelatedObjectDoesNotExist:
            print(f"User {username} does NOT have a cart")
            # Create a cart for this user
            Cart.objects.create(user=user)
            print(f"Created a new cart for user {username}")
    except User.DoesNotExist:
        print(f"User {username} not found")

# Check for specific users
check_user_cart('kyleee')
check_user_cart('2101859')