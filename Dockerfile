FROM nginx:mainline

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# RUN rm /etc/nginx/sites-enabled/default.conf
RUN apt-get update && apt-get install -y net-tools
WORKDIR /brain

COPY . .

EXPOSE 80