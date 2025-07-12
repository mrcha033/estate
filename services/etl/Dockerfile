
# Use a Python 3.10 image as the base
FROM python:3.10-slim-buster

WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

CMD ["celery", "-A", "main", "worker", "--loglevel=info"]
