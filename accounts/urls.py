from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('login/',          views.RoleTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/',  TokenRefreshView.as_view(),              name='token_refresh'),
    path('logout/',         views.logout_view,                       name='logout'),
    path('register/',       views.RegisterView.as_view(),            name='register'),

    # Profile
    path('profile/',        views.ProfileView.as_view(),             name='profile'),
    path('me/',             views.me_view,                           name='me'),
    path('change-password/', views.ChangePasswordView.as_view(),     name='change_password'),
]
