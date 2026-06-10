from debug_toolbar.toolbar import debug_toolbar_urls
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path("", TemplateView.as_view(template_name="base.html"), name="temp_home"),
    path("admin/", admin.site.urls),
    path("users/", include("users.urls", namespace="users")),
] + debug_toolbar_urls()
