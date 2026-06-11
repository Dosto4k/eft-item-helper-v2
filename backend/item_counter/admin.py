from django.contrib import admin

from item_counter.models import Item, Quest, QuestItemDetail, UserItem


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "name",
        "display_quest_details__in_raid",
        "display_quest_details__out_raid",
    ]

    @admin.display(description="Кол-во в рейде")
    def display_quest_details__in_raid(self, obj: Item) -> int:
        return obj.quest_details.in_raid

    @admin.display(description="Кол-во не в рейде")
    def display_quest_details__out_raid(self, obj: Item) -> int:
        return obj.quest_details.out_raid


@admin.register(QuestItemDetail)
class QuestItemDetailAdmin(admin.ModelAdmin):
    list_display = ["id", "display_item__name", "in_raid", "out_raid"]
    list_select_related = ["item"]

    @admin.display(description="Предмет")
    def display_item__name(self, obj: QuestItemDetail) -> str:
        return obj.item.name


@admin.register(Quest)
class QuestAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "guide"]


@admin.register(UserItem)
class UserItemAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "display_user__username",
        "display_item__name",
        "quest_in_raid",
        "quest_out_raid",
    ]
    list_select_related = ["user", "item"]

    @admin.display(description="Пользователь")
    def display_user__username(self, obj: UserItem) -> str:
        return obj.user.username

    @admin.display(description="Предмет")
    def display_item__name(self, obj: UserItem) -> str:
        return obj.item.name
