FROM node:18-alpine

# Install FFmpeg dan dependencies sistem
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Expose port dan jalankan server
EXPOSE 3000
CMD ["npm", "start"]