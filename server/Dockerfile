FROM node:20-slim

# Install Python 3, pip, and required system libraries for XGBoost
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy full repository into container
COPY . .

# Install Python ML dependencies for XGBoost inference
RUN pip3 install --no-cache-dir xgboost pandas numpy scikit-learn --break-system-packages

# Install Node backend dependencies
WORKDIR /app/server
RUN npm ci --only=production

ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/server.js"]
