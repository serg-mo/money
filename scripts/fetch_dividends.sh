#!/bin/bash

symbols=("DIV" "DIVO" "JEPI" "NUSI" "QYLD" "RYLD" "SDIV" "SPHD" "SRET" "XYLD" )

for symbol in "${symbols[@]}"; do
  curl "https://ycharts.com/charts/fund_data.json?&calcs=id%3Adividend%2Cinclude%3Atrue%2C%2C&securities=id%3A${symbol}%2Cinclude%3Atrue%2C%2C" \
    -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
    -H 'accept-language: en-US,en;q=0.9' \
    -H 'cache-control: no-cache' \
    -H 'dnt: 1' \
    -H 'pragma: no-cache' \
    -H 'priority: u=0, i' \
    -H 'sec-ch-ua: "Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"' \
    -H 'sec-ch-ua-mobile: ?0' \
    -H 'sec-ch-ua-platform: "macOS"' \
    -H 'sec-fetch-dest: document' \
    -H 'sec-fetch-mode: navigate' \
    -H 'sec-fetch-site: none' \
    -H 'sec-fetch-user: ?1' \
    -H 'upgrade-insecure-requests: 1' \
    -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' \
    -o "public/dividends/${symbol}.json"

    sleep 2
done
