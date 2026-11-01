FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 gosu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend
COPY requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .

RUN useradd --create-home --uid 10001 appuser \
    && mkdir -p /var/data /app/backend/data \
    && chown -R appuser:appuser /app

EXPOSE 8000
CMD ["sh", "-c", "mkdir -p /var/data && chown appuser:appuser /var/data && exec gosu appuser uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
