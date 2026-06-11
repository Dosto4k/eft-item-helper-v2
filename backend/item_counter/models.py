from django.contrib.auth import get_user_model
from django.db import models


class Item(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название", unique=True)
    users = models.ManyToManyField(
        get_user_model(),
        through="UserItem",
        verbose_name="Пользователи",
        related_name="items",
    )

    class Meta:
        verbose_name = "Предмет"
        verbose_name_plural = "Предметы"

    def __str__(self) -> str:
        return f"{self.name}"


class QuestItemDetail(models.Model):
    item = models.OneToOneField(
        "Item",
        on_delete=models.CASCADE,
        verbose_name="Предмет",
        related_name="quest_details",
    )
    in_raid = models.PositiveIntegerField(verbose_name="Кол-во в рейде")
    out_raid = models.PositiveIntegerField(verbose_name="Кол-во не в рейде")

    class Meta:
        verbose_name = "Детали квестового предмета"
        verbose_name_plural = "Детали квестовых предметов"

    def __str__(self) -> str:
        return f"Детали квестового предмета: {self.item}"


class Quest(models.Model):
    items = models.ManyToManyField(
        "Item", verbose_name="Предметы", related_name="quests"
    )
    name = models.CharField(max_length=255, verbose_name="Название", unique=True)
    guide = models.URLField(verbose_name="Гайд")

    class Meta:
        verbose_name = "Квест"
        verbose_name_plural = "Квесты"

    def __str__(self) -> str:
        return f"{self.name}"


class UserItem(models.Model):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="count_items",
    )
    item = models.ForeignKey("Item", on_delete=models.CASCADE, verbose_name="Предмет")
    quest_in_raid = models.PositiveIntegerField(
        verbose_name="В рейде для квестов", default=0
    )
    quest_out_raid = models.PositiveIntegerField(
        verbose_name="Не в рейде для квестов", default=0
    )

    def __str__(self) -> str:
        return f"{self.user}: {self.item}"
