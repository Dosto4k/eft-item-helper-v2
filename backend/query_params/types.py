from dataclasses import dataclass
from typing import Any, Callable, TypeVar

# Тип значения query-параметра
ValueType = TypeVar("ValueType")

# Сырые query-параметры, полученные из request.query_params
type RawQueryParams = dict[str, str]
# Query-параметры, прошедшие валидацию типа и значения,
# указанные в атрибуте query_params миксина QueryParamsMixin
type QueryParams = dict[str, Any]
# Имя query-параметра
type QueryParamName = str

# Схемa query-параметров
type QueryParamsSchema = dict[QueryParamName, "QueryParamsSchemaItem[Any]"]

# Валидатор типа query-параметра
type TypeValidator[ValueType] = Callable[[str], ValueType]
# Валидатор значения query-параметра
type ValueValidator[ValueType] = Callable[[ValueType], ValueType]


# Dataclass, содержащий валидаторы query-параметра
@dataclass
class QueryParamsSchemaItem[ValueType]:
    type_validator: Callable[[str], ValueType]
    value_validators: list[Callable[[ValueType], ValueType]]
