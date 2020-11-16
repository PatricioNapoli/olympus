# Olympus Algorithmic Trading

## Overview

Project for Bachelor's thesis, aiming to predict BTC price and use Binance exchange to trade accordingly, detecting the BUY/SELL signals.  
Python -> Keras, Scikit, Pandas, Numpy, Statsmodels, Matplotlib  
Golang -> Fasthttp server & router  
React -> SemanticUI 

## Running

Run RethinkDB from Docker compose. 
Create tables from WebUI: 

```
[
    "bots" ,
    "btc_daily_preds" ,
    "btc_history" ,
    "btc_history_daily" ,
    "btc_history_daily_latest" ,
    "btc_history_latest" ,
    "btc_hourly_preds" ,
    "btc_test" ,
    "trades" ,
    "users"
]
```

Run with python: gatherer/start.py, training/start.py, predictor/start.py, and optionally: analysis/start.py  
Move the trained models and scalers from training/ to predictor/ before running predictor.  
Run `npm run build` in web/dashboard and move the build output to web/api/assets/static  
Run Golang app in web/api/main.go  
Create a user in RethinkDB with ID 1, remember binanceKey and binanceSecret  
App currently only works with single user, single coin (BTC)  