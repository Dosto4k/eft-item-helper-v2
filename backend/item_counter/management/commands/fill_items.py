from typing import Any

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from item_counter.item_parser.dataclasses import ItemData, QuestData
from item_counter.item_parser.parsers import QuestParser, QuestSourcesParser
from item_counter.models import Item, Quest, QuestItemDetail


class Command(BaseCommand):
    help = (
        "Парсит и добавляет в базу данных данные о предметах, "
        "их кол-ве и квестах, в которых они используются."
    )

    def check_items_models_is_empty(self) -> None:
        """Проверяет, что перед заполнением бд в таблицах нет ни одной записи"""
        exception = CommandError(
            "При использовании команды fill_items необходимо "
            "убедиться в том, что следующие таблицы пусты:\n"
            f"  - {Item._meta.db_table}\n"
            f"  - {Quest._meta.db_table}\n"
            f"  - {QuestItemDetail._meta.db_table}\n"
            "hint: Для очистки вышеупомянутых таблиц можно вызвать команду clean_items"
        )
        if Item.objects.all().exists():
            raise exception
        if Quest.objects.all().exists():
            raise exception
        if QuestItemDetail.objects.all().exists():
            raise exception

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> str | None:  # noqa:ARG002,ANN401
        """Получает данные предметов и добавляет их в бд"""
        self.check_items_models_is_empty()

        raw_items = self.get_items()
        items = self.craete_items(raw_items)
        self.create_quest_item_details(raw_items, items)
        self.create_and_fill_quests(raw_items, items)

    def craete_items(self, raw_items: list[ItemData]) -> list[Item]:
        """Создаёт все предметы и добавляет их в бд одним запросом"""
        items = []
        for raw_item in raw_items:
            items.append(Item(name=raw_item.name))
        return Item.objects.bulk_create(items)

    def create_quest_item_details(
        self, raw_items: list[ItemData], items: list[Item]
    ) -> None:
        """
        Создаёт все детали предметов, связывает их с необходимыми
        предметами и добавляет их в бд одним запросом
        """
        item_details = []
        for raw_item, item in zip(raw_items, items, strict=True):
            item_details.append(
                QuestItemDetail(
                    item=item,
                    in_raid=raw_item.in_raid,
                    out_raid=raw_item.out_raid,
                )
            )
        QuestItemDetail.objects.bulk_create(item_details)

    def create_and_fill_quests(
        self, raw_items: list[ItemData], items: list[Item]
    ) -> None:
        """Создаёт и добавляет необходимые квесты предметам"""
        for raw_item, item in zip(raw_items, items, strict=True):
            quests = self.get_or_create_quests(raw_item.quests)
            item.quests.add(*quests)

    def get_or_create_quests(self, raw_quests: list[QuestData]) -> list[Quest]:
        """Создаёт квесты или получает их из бд, если они существуют"""
        quests: list[Quest] = []
        for raw_quest in raw_quests:
            quests.append(
                Quest.objects.get_or_create(
                    name=raw_quest.name,
                    defaults={
                        "name": raw_quest.name,
                        "guide": raw_quest.guide,
                    },
                )[0]
            )
        return quests

    def get_items(self) -> list[ItemData]:
        """Парсит данные о предметах"""
        quests_links = QuestSourcesParser().get_result()
        return QuestParser(quests_links).get_result()
