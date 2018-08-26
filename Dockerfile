FROM node:10-alpine AS build
# Build site in node image.
WORKDIR /site
COPY . ./
RUN apk add --no-cache git
RUN npm --global install gulp-cli
RUN npm install
RUN gulp build
RUN rm -rf node_modules/

# Copy over built files to nginx image for serving.
FROM nginx:alpine
COPY --from=build /site /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]