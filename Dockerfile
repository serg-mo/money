FROM php:7.1-apache

WORKDIR /var/www/html/

COPY vhost.conf /etc/apache2/sites-available/000-default.conf

# disable cache in .htaccess
RUN a2enmod headers
