# Demo
![demo](./simple-charts.gif)

# Production
https://serg-mo.github.io/simple-charts/


## Commands
```
docker run -it -p 8080:80 -p 8000:8000 -v $(pwd):/usr/src/app node:14 bash
vue ui --headless --port 8000 --host 0.0.0.0

npm install
npm run serve
npm run build
npm run lint

open http://localhost
```
