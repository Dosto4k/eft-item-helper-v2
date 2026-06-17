uv run manage.py migrate --noinput
uv run manage.py collectstatic --noinput
uv run gunicorn core.wsgi:application --bind 0.0.0.0:8000