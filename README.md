
# Simple Charts
```
docker run -p 80:80 -v "${PWD}/vhost.conf":/etc/apache2/sites-available/000-default.conf -v "${PWD}":/var/www/html/ php:7.1-apache
open http://localhost
```

# Deploy
```
aws s3 sync . s3://simple-charts --exclude ".*" --acl public-read
```
