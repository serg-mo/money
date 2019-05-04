FROM php:7.1-apache

WORKDIR /var/www/html/

# disable cache in .htaccess
RUN a2enmod headers
