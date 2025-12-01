# CHANGE THIS LINE (was node:18-alpine)
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]