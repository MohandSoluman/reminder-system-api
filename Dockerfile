# Use Node.js 22 as base
FROM node:22.11.0-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose application port
EXPOSE 3000

# Start with hot reload
CMD ["npm", "run", "start:dev"]
