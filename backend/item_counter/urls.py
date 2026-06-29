from django.urls import path

from item_counter.views import (
    QuestItemCountActionView,
    UserQuestItemsCountView,
    UserQuestItemProgress,
)

app_name = "item-counter"
urlpatterns = [
    path("quests/", UserQuestItemsCountView.as_view(), name="count-quest-items"),
    path(
        "quests/<int:pk>/",
        QuestItemCountActionView.as_view(),
        name="action-quest-items-count",
    ),
    path(
        "quests/progress/",
        UserQuestItemProgress.as_view(),
        name="progress-quest-item-count",
    ),
]
