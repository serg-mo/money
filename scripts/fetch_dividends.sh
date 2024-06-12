#!/bin/bash

symbols=("DIV" "DIVO" "JEPI" "NUSI" "QYLD" "RYLD" "SDIV" "SPHD" "SRET" "XYLD" )

for symbol in "${symbols[@]}"; do
  file="public/dividends/${symbol}"

  curl -sS "https://ycharts.com/charts/fund_data.json?&calcs=id%3Adividend%2Cinclude%3Atrue%2C%2C&securities=id%3A${symbol}%2Cinclude%3Atrue%2C%2C" \
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
    | jq '{ dividends: .chart_data[0][0].raw_data }' > "$file.dividends.json"


  # morningstar does not have QYLD
  curl -sS "https://ycharts.com/companies/${symbol}" \
    -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
    -H 'accept-language: en-US,en;q=0.9' \
    -H 'cache-control: max-age=0' \
    -H 'cookie: quickflowsSingleSecurityCookieV2=%7B%22displaySecurityId%22%3A%22QYLD%22%2C%22securityId%22%3A%22QYLD%22%2C%22securityName%22%3A%22Global%20X%20NASDAQ%20100%20Covered%20Call%20ETF%22%2C%22securityUrl%22%3A%22%2Fcompanies%2FQYLD%22%7D; _gid=GA1.2.547543221.1718206767; __stripe_mid=c2733137-f608-49b5-8dfb-f347a17368b627765c; __stripe_sid=903ee668-6ab5-41b0-ad7b-bb70a4ea92c13e4633; _gcl_au=1.1.862432897.1718206768; __hstc=165832289.7d7b77518540b2820b813fccd30c0a27.1718206767875.1718206767875.1718206767875.1; hubspotutk=7d7b77518540b2820b813fccd30c0a27; __hssrc=1; cookieyes-consent=consentid:WUlEcWFEVDdRazRVQk5EQzhXU0drbmEwSWg0SU9tZUU,consent:no,action:,necessary:yes,functional:yes,analytics:yes,performance:yes,advertisement:yes,other:yes,lastRenewedDate:1704823885000; messagesUtk=485f7f3d8e344a03bd9e3aa11c32feba; page_view_ctr=2; _gat=1; _ga_29JVRYKWPW=GS1.1.1718206767.1.1.1718207073.60.0.0; __hssc=165832289.2.1718206767875; _ga=GA1.2.430669970.1718206767; _gat_gtag_UA_8129500_1=1' \
    -H 'dnt: 1' \
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
    > "$file.quote.html"

    cat "$file.quote.html" \
    | sed -nE 's/<span class="index-rank-value">([0-9.]+)<\/span>/{ "price": \1 }/p' \
    | sed 's/^[[:space:]]*//' \
    > "$file.price.json"

    cat "$file.quote.html" \
    | grep -o "keyStats='[^>]*'" \
    | sed -e "s/keyStats='\(.*\)'/\1/" \
    | sed -E 's/&quot;/"/g' \
    | jq -r 'reduce .[] as $item ({}; .[$item.calc_name] = $item.value)' \
    > "$file.stats.json"

  jq -s 'add' "$file.dividends.json" "$file.price.json" "$file.stats.json" > "$file.json"
  rm "$file.dividends.json" "$file.quote.html" "$file.price.json" "$file.stats.json"
  
  echo "$symbol"

  # sleep for a random amount of time between 1 and 3 seconds
  timeout=$(( (RANDOM % 3) + 1 ))
  sleep $timeout
done
