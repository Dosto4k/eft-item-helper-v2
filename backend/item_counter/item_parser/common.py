import requests
from requests.exceptions import ReadTimeout


def get_json_response(url: str, timeout: int | float = 5) -> dict:
    """Делает запрос на ссылку url с таймаутом timeout"""
    try:
        response = requests.get(url=url, timeout=timeout)
    except ReadTimeout as err:
        raise ReadTimeout(f"Истекло время ожидания ответа. url={url}") from err
    response.raise_for_status()
    if response.headers["content-type"] != "application/json":
        raise ValueError(
            "Ожидается что заголовок 'Content-Type' "
            f"будет 'application/json'. url={url}"
        )
    return response.json()
