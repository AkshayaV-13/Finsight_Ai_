# FinSight AI Backend Dockerfile
# Optimized for Hugging Face Spaces & Render deployment

FROM python:3.10-slim

# Prevent Python from writing .pyc and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONUTF8=1
ENV PORT=7860
ENV DATA_DIR=/code/data

# Install system dependencies (build-essential and curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /code

# Copy and install python dependencies
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY . /code/

# Set up non-root user for Hugging Face Spaces compliance
RUN useradd -m -u 1000 appuser && \
    mkdir -p /code/data && \
    chown -R appuser:appuser /code
USER appuser

# Expose default Hugging Face Spaces port (7860) and standard port (8000)
EXPOSE 7860 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
