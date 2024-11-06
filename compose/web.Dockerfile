# Use an official Node.js image as a base
FROM node:20-alpine

# Set up the application directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files to the container, including wait-for-it.sh
COPY . .

# Ensure wait-for-it.sh is executable
RUN chmod +x /app/wait-for-it.sh

# Set environment variables for production
ENV NODE_ENV=production

# Build the Next.js app
RUN npm run build

# Expose port 3000 for the application
EXPOSE 3000

# Default command will start the Next.js app, with database migration handled in docker-compose.yml
CMD ["npm", "run", "start"]
