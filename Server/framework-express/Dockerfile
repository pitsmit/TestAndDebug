FROM node:20-bullseye
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY ../common ./common
EXPOSE 3000
CMD ["sh", "-c", "npm run start:test"]