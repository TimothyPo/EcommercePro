import os
import sys
import django

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')

# Set up Django
django.setup()

from django.core.management import call_command
from django.contrib.auth.models import User
from api.models import UserProfile

# Apply migrations
call_command('migrate')

# Create a superuser if it doesn't exist
try:
    if not User.objects.filter(username='admin').exists():
        print('Creating superuser...')
        superuser = User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')
        UserProfile.objects.create(user=superuser, is_admin=True)
        print('Superuser created successfully!')
    else:
        print('Superuser already exists.')
        
    # Create test user
    if not User.objects.filter(username='testuser').exists():
        print('Creating test user...')
        test_user = User.objects.create_user('testuser', 'testuser@example.com', 'testpassword123')
        UserProfile.objects.create(user=test_user, is_admin=False)
        print('Test user created successfully!')
except Exception as e:
    print(f'Error creating users: {e}')

# Run the development server
if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    
    # Run the server
    sys.argv = ['manage.py', 'runserver', '0.0.0.0:8000']
    execute_from_command_line(sys.argv)
