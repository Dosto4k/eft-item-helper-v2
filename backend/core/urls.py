from debug_toolbar.toolbar import debug_toolbar_urls
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("authentication.urls", namespace="authentication")),
    path("item-counter/", include("item_counter.urls", namespace="item-counter")),
] + debug_toolbar_urls()
