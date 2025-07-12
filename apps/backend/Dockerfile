
# Use a Node.js 18 image as the base
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN npm run build # Assuming a build script exists in package.json for TypeScript compilation

EXPOSE 3000
CMD ["npm", "start"] # Assuming a start script exists in package.json
