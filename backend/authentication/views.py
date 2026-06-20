from rest_framework.generics import CreateAPIView

from authentication.serializers import CreateUserSerializer


class CreateUserAPIView(CreateAPIView):
    serializer_class = CreateUserSerializer
