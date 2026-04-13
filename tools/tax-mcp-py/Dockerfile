FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir ".[all]" || pip install --no-cache-dir \
    "mcp[cli]>=1.6.0" \
    "firebase-admin>=6.5.0" \
    "starlette>=0.46.0" \
    "uvicorn>=0.34.0"

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["python", "main.py"]
