from functools import wraps

import valkit
from rest_framework.exceptions import ValidationError
from valkit.common import valid_bool as valkit_valid_bool
from valkit.common import valid_number
from valkit.common import valid_string_list as valkit_valid_string_list

from query_params.types import TypeValidator


# VT - ValueType
def catch_valkit_validation_error[VT](
    validator: TypeValidator[VT],
) -> TypeValidator[VT]:
    @wraps(validator)
    def wrapper(arg: str) -> VT:
        try:
            return validator(arg)
        except valkit.ValidatorError as err:
            raise ValidationError(detail=str(err)) from err

    return wrapper


@catch_valkit_validation_error
def valid_int(arg: str) -> int:
    """
    Проверяет, что полученный arg можно преобразовать
    в int, иначе возвращает valkit.ValidationError
    """
    value = valid_number(arg)
    if isinstance(value, float):
        raise valkit.ValidatorError(f"The argument {arg} is not a valid {int.__name__}")
    return value


@catch_valkit_validation_error
def valid_float(arg: str) -> float:
    """
    Проверяет, что полученный arg можно преобразовать
    в float, иначе возвращает valkit.ValidationError
    """
    value = valid_number(arg)
    if isinstance(value, int):
        raise valkit.ValidatorError(
            f"The argument '{arg}' is not a valid {float.__name__}"
        )
    return value


@catch_valkit_validation_error
def valid_string_list(arg: str) -> list[str]:
    """
    Проверяет, что полученный arg можно преобразовать
    в list[str], иначе возвращает valkit.ValidationError
    """
    return valkit_valid_string_list(arg)


@catch_valkit_validation_error
def valid_bool(arg: str) -> bool:
    """
    Проверяет, что полученный arg можно преобразовать
    в bool, иначе возвращает valkit.ValidationError
    """
    return valkit_valid_bool(arg)
