from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction

from item_counter.models import Item, Quest, QuestItemDetail


class Command(BaseCommand):
    help = (
        "Очищает данные из следующих таблиц: "
        f"{Item._meta.db_table}, "
        f"{Quest._meta.db_table}, "
        f"{QuestItemDetail._meta.db_table}"
    )

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> str | None:  # noqa:ARG002,ANN401
        """Очищает таблицы, связанные с предметами"""
        QuestItemDetail.objects.all().delete()
        Quest.objects.all().delete()
        Item.objects.all().delete()
