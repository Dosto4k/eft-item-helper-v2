set -e

echo "Waiting for PostgreSQL to start..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
    sleep 1
done
echo "PostgreSQL started!"

echo "Applying migrations..."
uv run manage.py migrate --noinput

echo "Collecting static files..."
uv run manage.py collectstatic --noinput

echo "Starting server..."
uv run gunicorn core.wsgi:application --bind 0.0.0.0:8000