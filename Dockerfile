FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build Next.js
RUN npm run build

# Start Server
CMD ["npm", "start"]