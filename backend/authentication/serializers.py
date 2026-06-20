from typing import Any

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers, status

User = get_user_model()


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    password2 = serializers.CharField(write_only=True, style={"input_type": "password"})
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                "Пароли не совпадают", status.HTTP_400_BAD_REQUEST
            )
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                e.messages, status.HTTP_400_BAD_REQUEST
            ) from e
        return attrs

    def create(self, validated_data: dict[str, Any]) -> AbstractUser:
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
