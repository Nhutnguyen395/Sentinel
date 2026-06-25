# Lightweight Node Image
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Compile TypeScript code into plain Javascript in a 'dist' folder
RUN npx tsc --outDir dist

# Expose the API Port
EXPOSE 3000

# Run the compiled JavaScript using native node
CMD ["node", "dist/index.js"]