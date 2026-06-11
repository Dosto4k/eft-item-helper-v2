from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.views.generic import CreateView

from users.forms import UserCreationForm


class LoginUserView(LoginView):
    template_name = "users/login.html"

    def get_success_url(self) -> str:
        return reverse_lazy("temp_home")


class LogoutUserView(LogoutView):
    def get_success_url(self) -> str:
        return reverse_lazy("temp_home")


class RegisterUserView(CreateView):
    form_class = UserCreationForm
    template_name = "users/register.html"
    success_url = reverse_lazy("users:login")
