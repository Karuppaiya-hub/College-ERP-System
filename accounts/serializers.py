from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT serializer to:
    1. Embed role + profile IDs into the token claims.
    2. Optionally validate that the user's role matches the requested role.
    3. Return the full user profile alongside the tokens.
    """
    role = serializers.ChoiceField(
        choices=['admin', 'student', 'faculty'],
        required=False,
        write_only=True,
    )

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Embed custom claims so the frontend can decode them if needed
        token['role'] = user.role
        token['username'] = user.username
        token['student_profile'] = user.student_profile_id
        token['faculty_profile'] = user.faculty_profile_id
        return token

    def validate(self, attrs):
        requested_role = attrs.pop('role', None)

        # Run standard username/password validation
        data = super().validate(attrs)

        user = self.user

        # Role mismatch check
        if requested_role and user.role != requested_role:
            raise serializers.ValidationError(
                f"This account is not registered as {requested_role}. "
                f"Please select the correct portal."
            )

        # Attach full user profile to response
        data['user'] = UserSerializer(user).data
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'student_profile', 'faculty_profile',
            'is_active', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirm Password')

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role',
            'student_profile', 'faculty_profile',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
