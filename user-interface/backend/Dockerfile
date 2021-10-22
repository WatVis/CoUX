FROM node:latest

RUN apt-get update -y  \
    && apt-get -y upgrade \
    && apt-get install -y build-essential ffmpeg

WORKDIR /app/

ADD package.json yarn.lock ./
RUN yarn

ADD . /app/

CMD ["yarn", "prod"]