FROM node:16-alpine3.15

ARG FIREBASE_TOOLS_VERSION

RUN apk --no-cache add openjdk16-jre bash openssl
RUN npm config set user root
RUN npm install -g firebase-tools@$FIREBASE_TOOLS_VERSION && firebase -V
RUN npm cache clean --force

WORKDIR /firebase

COPY . .

CMD firebase emulators:start --project=${FIREBASE_PROJECT_ID} --only=${EMULATORS_USED} 