# Build the React app
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Create the optimized HTML/JS/CSS in the /dist folder
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
# Build the files from before into Nginx's public folder
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]