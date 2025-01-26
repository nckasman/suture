FROM python:3.12-bullseye

RUN apt-get update && \
    apt-get install -y software-properties-common && \
    apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

RUN pip install poetry

WORKDIR /app

COPY pyproject.toml poetry.lock README.md ./
COPY backend ./backend
COPY suture-448921-197bdf1cc1ad.json ./backend/gcp-credentials.json

RUN poetry config virtualenvs.create false && \
    poetry install --only main

ENV PYTHONPATH=/app
ENV AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
EXPOSE 8000

CMD ["poetry", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
