# Build site in node image.
FROM mhart/alpine-node:10 AS build
RUN ls -a
WORKDIR /site
COPY . ./
RUN apk add --no-cache git
RUN npm --global install gulp-cli
RUN npm install
RUN gulp build

# Copy over built files to nginx image for serving.
FROM nginx:alpine
COPY --from=build /site /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]