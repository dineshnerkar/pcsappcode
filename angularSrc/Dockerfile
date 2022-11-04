
FROM node:12.16.1-alpine As build

WORKDIR /web_client

COPY package*.json ./

RUN npm install

EXPOSE 4200

CMD ["ng","serve","--host", "0.0.0.0"]