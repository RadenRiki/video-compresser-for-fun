FROM node:18-alpine
RUN apk add --no-cache ffmpeg  # <- ini wajib
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]