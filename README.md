
# Simple Charts
```
docker build -t simple-charts .
docker run -it --rm -p 80:80 -v "${PWD}/vhost.conf":/etc/apache2/sites-available/000-default.conf -v "${PWD}":/var/www/html/ simple-charts

open http://localhost
```
