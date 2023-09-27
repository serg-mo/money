# Demo
![demo](./simple-charts.gif)

# Dev
```
docker build -t simple-charts .
docker run -it --rm -p 80:80 -v "${PWD}":/var/www/html/ simple-charts

open http://localhost
```
