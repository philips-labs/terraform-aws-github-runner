FROM node:12

WORKDIR /lambda

COPY . /lambda

RUN apt-get update \
    && apt-get install -y zip \
    && rm -rf /var/lib/apt/lists/*

RUN yarn install \
    && yarn run dist

