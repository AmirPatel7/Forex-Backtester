# Use Node.js 20-alpine image to satisfy code-server requirements
FROM node:20-alpine

# Install Python 3.12, pip, build tools, and curl for code-server
RUN apk add --no-cache \
    python3 \
    python3-dev \
    py3-pip \
    build-base \
    curl \
    krb5-dev \
    g++ \
    make

# Install code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Copy the code-server config.yaml file
COPY config.yaml /root/.config/code-server/config.yaml
RUN chown -R node:node /root/.config/code-server/

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir setuptools --break-system-packages
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages

# Expose necessary ports
EXPOSE 3000 5000 8080

COPY run.sh ./
RUN chmod +x run.sh

# Command to run your application
CMD ["sh", "-c", "./run.sh"]
