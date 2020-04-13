#usr/bin/sh
export DEBUG='sample:*'

node ./dashboard/index.js & node ./balance/index.js & node ./bookkeeping/index.js & node ./event-gateway/index.js
