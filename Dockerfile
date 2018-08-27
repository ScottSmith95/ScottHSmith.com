FROM node:10-alpine AS build
# Build site in node image.
WORKDIR /site
COPY . ./
RUN apk add --no-cache git
RUN npm --global install gulp-cli
RUN npm install
RUN gulp build
RUN rm -rf node_modules/

# Copy over built files to simple image for serving via volume/copy.
FROM busybox
RUN mkdir -p /var/www/root
COPY --from=build /site /var/www/root
WORKDIR /var/www/root
VOLUME /var/www/root
CMD ["/bin/sh"]

# $ docker build -t scotthsmith.com .
# $ docker create --name scotthsmith.com scotthsmith.com:latest
# $ docker cp scotthsmith.com:/var/www/root ~/Sites/scotthsmith.com
# $ docker cp scotthsmith.com:/var/www/root /var/www/scotthsmith.com/root
# $ docker rm -fv scotthsmith.com