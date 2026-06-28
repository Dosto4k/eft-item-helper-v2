from typing import Any, Callable, Sequence

from rest_framework.exceptions import ValidationError

from query_params.types import (
    QueryParamName,
    QueryParams,
    QueryParamsSchema,
    QueryParamsSchemaItem,
    RawQueryParams,
    ValueValidator,
)
from query_params.validators import (
    valid_bool,
    valid_float,
    valid_int,
    valid_string_list,
)

# Имя атрибута, в котором указываются желаемые query-параметры и их типы
QUERY_PARAMS_ATTR_NAME = "query_params"
# Имя атрибута, в котором указываются валидаторы для значения query-параметра
QUERY_PARAMS_VALIDATOR_ATTR_NAME = "query_params_validators"
# Сопоставление типа и валидатора для него
TYPE_VALIDATOR_MAP: dict[type, Callable[[str], Any]] = {
    int: valid_int,
    float: valid_float,
    bool: valid_bool,
    list[str]: valid_string_list,
    # По дефолту нам приходит валидная строкаб,
    # поэтому она не нужнается в валидации типа
    str: lambda value: value,
}


class QueryParamsMixin:
    query_params: dict[QueryParamName, type]
    query_params_validators: dict[QueryParamName, list[ValueValidator]]
    required_query_params: Sequence[QueryParamName] = ()
    allow_not_expected_query_params: bool = True

    def __init__(self, *args: Any, **kwargs: Any) -> None:  # noqa:ANN401
        self.__validate_attr()
        super().__init__(*args, **kwargs)

    def get_query_params(self, raw_query_params: RawQueryParams) -> QueryParams:
        """Возвращает валидированные query-параметры, указанные в query_params"""
        query_params_schema = self.__get_query_params_schema()
        self.__check_required_query_params(raw_query_params)
        return self.__validate_query_params(raw_query_params, query_params_schema)

    def __check_required_query_params(self, query_params: RawQueryParams) -> None:
        """
        Проверяет, что все query-параметры, указанные
        в required_query_params, были переданы при запросе
        """
        missing_query_params = []
        for query_param_name in self.required_query_params:
            if query_param_name not in query_params:
                missing_query_params.append(query_param_name)
        if missing_query_params:
            raise ValidationError(
                detail="Обязательные query-параметры "
                f"[{', '.join(missing_query_params)}] не были переданы.",
                code="missing_required_query_param",
            )

    def __get_query_params_schema(self) -> QueryParamsSchema:
        """
        Создаёт вспомогательный объект (схему параметров)
        для дальнейшей валидации query-параметров
        """
        query_param_schema: QueryParamsSchema = {}
        for query_param_name, query_param_type in self.query_params.items():
            query_param_schema[query_param_name] = QueryParamsSchemaItem[
                query_param_type
            ](
                type_validator=self.__get_type_validator_by_type(query_param_type),
                value_validators=self.query_params_validators.get(query_param_name, []),
            )
        return query_param_schema

    def __get_type_validator_by_type[ValueType: type](
        self,
        value_type: ValueType,
    ) -> Callable[[str], ValueType]:
        """Возвращает валидатор типа в соответствии с переданным типом"""
        return TYPE_VALIDATOR_MAP[value_type]

    def __validate_query_params(
        self,
        raw_query_params: RawQueryParams,
        query_params_schema: QueryParamsSchema,
    ) -> QueryParams:
        """Валидирует query-параметры, опираясь на схему query-параметров"""
        clean_query_params = {}
        errors = {}

        for raw_query_param_name, raw_query_param_value in raw_query_params.items():
            if raw_query_param_name not in query_params_schema:
                if not self.allow_not_expected_query_params:
                    raise ValidationError(
                        detail="Получен не ожидаемый "
                        f"query-параметр '{raw_query_param_name}'",
                        code="invalid_query_param",
                    )
                continue

            type_validator = query_params_schema[raw_query_param_name].type_validator
            value_validators = query_params_schema[
                raw_query_param_name
            ].value_validators

            try:
                clean_type_value = type_validator(raw_query_param_value)
            except ValidationError as err:
                errors[raw_query_param_name] = err.detail
                continue

            value_being_checked = clean_type_value
            for value_validator in value_validators:
                try:
                    validated_value = value_validator(value_being_checked)
                except ValidationError as err:
                    errors[raw_query_param_name] = err.detail
                    break
                else:
                    value_being_checked = validated_value
            else:
                clean_query_params[raw_query_param_name] = value_being_checked

        if errors:
            raise ValidationError(detail=errors, code="invalid_query_param")
        return clean_query_params

    def __validate_attr(self) -> None:
        """
        Проверяет, что были указаны необходимые для работы миксина
        атрибуты, также присваивает дефолтные значения при их отсутствии.
        """
        if not hasattr(self, QUERY_PARAMS_ATTR_NAME):
            raise AttributeError(
                f"Для использования {QueryParamsMixin.__name__} "
                f"необходимо определить атрибут {QUERY_PARAMS_ATTR_NAME}"
            )
        query_params = getattr(self, QUERY_PARAMS_ATTR_NAME)
        if not isinstance(query_params, dict):
            raise AttributeError(
                f"Атрибут '{QUERY_PARAMS_ATTR_NAME}' должен "
                "быть типа 'dict[QueryParamName, type]'"
            )

        for param_name, param_type in query_params.items():
            if param_type not in TYPE_VALIDATOR_MAP:
                raise ValueError(
                    f"У query-параметра '{param_name}' указан не "
                    f"поддерживаемый тип значения '{param_type}'"
                )

        query_params_validators = getattr(self, QUERY_PARAMS_VALIDATOR_ATTR_NAME, None)
        if query_params_validators is None:
            self.query_params_validators = {}
        elif not isinstance(query_params_validators, dict):
            raise AttributeError(
                f"Атрибут '{QUERY_PARAMS_VALIDATOR_ATTR_NAME}' должен "
                "быть типа 'dict[QueryParamName, list[ValueValidator]]'"
            )
