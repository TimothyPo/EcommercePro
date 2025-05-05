from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.is_admin
        )

class IsCustomerUser(permissions.BasePermission):
    """
    Allows access only to customer users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (not hasattr(request.user, 'profile') or not request.user.profile.is_admin)
        )
