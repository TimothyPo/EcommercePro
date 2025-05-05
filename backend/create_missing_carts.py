import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Cart, UserProfile

def create_missing_carts():
    # Get all users who don't have admin privileges
    non_admin_users = User.objects.filter(profile__is_admin=False)
    
    created_count = 0
    
    for user in non_admin_users:
        # Check if the user already has a cart
        try:
            user.cart
        except User.cart.RelatedObjectDoesNotExist:
            # If user doesn't have a cart, create one
            Cart.objects.create(user=user)
            created_count += 1
            print(f"Created cart for user: {user.username}")
    
    print(f"Created {created_count} carts for existing users.")

if __name__ == "__main__":
    create_missing_carts()