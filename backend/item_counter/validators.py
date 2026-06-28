from rest_framework.exceptions import ValidationError

from item_counter.models import UserItem


ACTION_INCREMENT = "increment"
ACTION_DECREMENT = "decrement"


def item_action_param_validator[Value: str](value: Value) -> Value:
    """
    Проверяет, что значение query-параметра
    'action' содержит только допустимые значения
    """
    acceptable_options = {ACTION_INCREMENT, ACTION_DECREMENT}
    if value not in acceptable_options:
        raise ValidationError(
            "Недопустимое значение query-параметра. "
            f"Разрешённые значения: [{', '.join(acceptable_options)}]"
        )
    return value


def check_quest_count_limits(obj: UserItem, in_raid: bool, delta: int) -> None:
    """
    Проверяет, что при изменении кол-ва найденных [не] в рейде
    квестовых предметов в UserItem, значение не выйдет за допустимые границы
    """
    field_prefix = "in_raid" if in_raid else "out_raid"
    curr_count = getattr(obj, f"quest_{field_prefix}")
    max_count = getattr(obj.item.quest_details, field_prefix)

    location = "в рейде" if in_raid else "не в рейде"
    min_count = 0
    if curr_count + delta < min_count:
        raise ValidationError(
            detail=f"Кол-во предмета '{obj.item}' найденного "
            f"{location} не может быть ниже '0'.",
            code="invalid_action",
        )
    if curr_count + delta > max_count:
        raise ValidationError(
            detail=f"Кол-во предмета '{obj.item}' найденного "
            f"{location} не может быть больше '{max_count}'.",
            code="invalid_action",
        )
