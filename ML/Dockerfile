# Use Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy files into the container
COPY requirements.txt requirements.txt
COPY app.py app.py
COPY model.pkl model.pkl

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 8080 (used by Cloud Run)
ENV PORT 8080
EXPOSE 8080

# Run the app
CMD ["python", "app.py"]
