#!/bin/bash

symbols=("DIV" "DIVO" "JEPI" "NUSI" "QYLD" "RYLD" "SDIV" "SPHD" "SRET" "XYLD" )

for symbol in "${symbols[@]}"; do
  file_path="public/dividends/${symbol}.json"

  echo "{dividends: " > $file_path

  curl -S "https://ycharts.com/charts/fund_data.json?&calcs=id%3Adividend%2Cinclude%3Atrue%2C%2C&securities=id%3A${symbol}%2Cinclude%3Atrue%2C%2C" \
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
    | jq '.chart_data[0][0].raw_data' >> $file_path

  echo ", expenseRatio: " >> $file_path

  curl -S 'https://api-global.morningstar.com/sal-service/v1/etf/quote/v1/F00000OBHG/data?fundServCode=&showAnalystRatingChinaFund=false&showAnalystRating=false&languageId=en&locale=en&clientId=MDC&benchmarkId=mstarorcat&component=sal-mip-quote&version=4.7.0' \
    -H 'accept: */*' \
    -H 'accept-language: en-US,en;q=0.9' \
    -H 'apikey: lstzFDEOhfFNMLikKa0am9mgEKLBl49T' \
    -H 'cache-control: no-cache' \
    -H 'dnt: 1' \
    -H 'origin: https://www.morningstar.com' \
    -H 'pragma: no-cache' \
    -H 'priority: u=1, i' \
    -H 'referer: https://www.morningstar.com/etfs/arcx/${symbol}/quote' \
    -H 'sec-ch-ua: "Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"' \
    -H 'sec-ch-ua-mobile: ?0' \
    -H 'sec-ch-ua-platform: "macOS"' \
    -H 'sec-fetch-dest: empty' \
    -H 'sec-fetch-mode: cors' \
    -H 'sec-fetch-site: same-site' \
    -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' \
    -H 'x-api-realtime-e: eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.X-h4zn65XpjG8cZnL3e6hj8LMbzupQBglHZce7tzu-c4utCtXQ2IYoLxdik04usYRhNo74AS_2crdjLnBc_J0lFEdAPzb_OBE7HjwfRaYeNhfXIDw74QCrFGqQ5n7AtllL-vTGnqmI1S9WJhSwnIBe_yRxuXGGbIttizI5FItYY.bB3WkiuoS1xzw78w.iTqTFVbxKo4NQQsNNlbkF4tg4GCfgqdRdQXN8zQU3QYhbHc-XDusH1jFii3-_-AIsqpHaP7ilG9aBxzoK7KPPfK3apcoMS6fDM3QLRSZzjkBoxWK75FtrQMAN5-LecdJk97xaXEciS0QqqBqNugoSPwoiZMazHX3rr7L5jPM-ecXN2uEjbSR0wfg-57iHAku8jvThz4mtGpMRAOil9iZaL6iRQ.o6tR6kuOQBhnpcsdTQeZWw' \
    -H 'x-api-requestid: 082b69f5-6c44-bb6b-2c8e-a2ae137279a8' \
    -H 'x-sal-contenttype: e7FDDltrTy+tA2HnLovvGL0LFMwT+KkEptGju5wXVTU=' \
    | jq '.expenseRatio' >> $file_path

    echo "}" >> $file_path

    sleep 2
done
