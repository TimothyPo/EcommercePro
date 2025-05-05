import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile
from rest_framework.test import APIClient
from django.test import RequestFactory
from api.views import UserRegistrationView

# Print existing users
print('Existing usernames:')
for user in User.objects.all():
    print(f'- {user.username}')

# Test registration with test data
test_data = {
    'username': 'debuguser',
    'email': 'debug@example.com',
    'password': 'debug123',
    'password_confirm': 'debug123',
    'first_name': 'Debug',
    'last_name': 'User',
    'is_admin': False
}

client = APIClient()
response = client.post('/api/auth/register/', test_data, format='json')
print(f"\nTest registration response status: {response.status_code}")
print(f"Response content: {response.content.decode()}")

# Direct view test
factory = RequestFactory()
request = factory.post('/api/auth/register/', test_data, content_type='application/json')
view = UserRegistrationView.as_view({'post': 'register'})
response = view(request)
print(f"\nDirect view test status: {response.status_code}")
print(f"Response data: {response.data}")