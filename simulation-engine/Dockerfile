FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc --outDir dist
CMD ["node", "dist/index.js"]