FROM node

WORKDIR /app/

ADD package.json yarn.lock ./
RUN yarn

ADD . /app/
RUN yarn build

FROM staticdeploy/app-server:cra-runtime
COPY --from=0 /app/build /build
