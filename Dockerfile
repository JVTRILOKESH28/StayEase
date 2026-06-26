FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]