FROM node:14-alpine

# Create app directory
WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8080

CMD [ "node", "server.js" ]