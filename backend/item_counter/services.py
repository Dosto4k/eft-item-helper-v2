from django.db.models import QuerySet, Count, Q, F

from item_counter.models import UserItem
from item_counter.dataclasses import QuestCountProgressData


def collect_quest_count_progress_data(
    queryset: QuerySet[UserItem],
) -> QuestCountProgressData:
    """Получает данные о прогрессе собранных пользователем квестовых предметов"""
    # Поля для аннотации
    has_in_raid_quantity = Q(quest_in_raid=F("item__quest_details__in_raid"))
    has_out_raid_quantity = Q(quest_out_raid=F("item__quest_details__out_raid"))

    # Поля для агрегации
    total = Count("id")
    completed = Count(
        "id", filter=Q(has_in_raid_quantity=True) & Q(has_out_raid_quantity=True)
    )
    in_raid_completed = Count("id", filter=Q(has_in_raid_quantity=True))
    out_raid_completed = Count("id", filter=Q(has_out_raid_quantity=True))
    in_progress = Count(
        "id", filter=Q(has_in_raid_quantity=False) | Q(has_out_raid_quantity=False)
    )

    aggregated_data = queryset.annotate(
        has_in_raid_quantity=has_in_raid_quantity,
        has_out_raid_quantity=has_out_raid_quantity,
    ).aggregate(
        total=total,
        completed=completed,
        in_raid_completed=in_raid_completed,
        out_raid_completed=out_raid_completed,
        in_progress=in_progress,
    )

    total_value = aggregated_data["total"]
    completed_value = aggregated_data["completed"]
    if total_value > 0:
        aggregated_data["progress"] = int((completed_value / total_value) * 100)
    else:
        aggregated_data["progress"] = 0.0

    return QuestCountProgressData(**aggregated_data)
