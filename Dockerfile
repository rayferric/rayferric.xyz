FROM node:16-alpine
WORKDIR /app

ENV NODE_ENV=production

# This optimizes build times
COPY package.json yarn.lock ./
RUN yarn install

ARG NEXT_PUBLIC_ORIGIN
ENV NEXT_PUBLIC_ORIGIN $NEXT_PUBLIC_ORIGIN

COPY . .
RUN yarn run next build
RUN yarn run next-sitemap
