
# Simple Charts
```
docker build -t simple-charts .
docker run -it --rm -p 80:80 -v "${PWD}":/var/www/html/ simple-charts
docker run -it --rm -p 80:80 -v "${PWD}":/var/www/html/ -v ~/Downloads/transactions.json:/var/www/html/transactions.json simple-charts

open http://localhost
```
