from .config import Configuration
from .oscillators import rsi, macd

import pandas as pd

from sklearn.preprocessing import MinMaxScaler


def add_technical_features(df):
    df['close_diff'] = df['close'].diff()

    close = df['close']
    close_diff = df['close_diff']

    df['sma_5'] = close.rolling(5).mean()
    df['sma_10'] = close.rolling(10).mean()
    df['sma_15'] = close.rolling(15).mean()

    df['rsi_5'] = rsi(close_diff, 5)
    df['rsi_10'] = rsi(close_diff, 10)
    df['rsi_15'] = rsi(close_diff, 15)

    _macd, signal = macd(close)
    df['macd_12_26'] = _macd
    df['macd_signal'] = signal

    return df


def build(prices, social, block, granularity):
    coin_agg = {}

    for coin_id, block_data in block.items():
        for api_call in block_data:
            if len(api_call['Data']['Data']) == 0:
                print("Problem at block data")
                pass
            for block_info in api_call['Data']['Data']:
                if granularity == "hourly":
                    for i in range(1, 51):
                        coin_agg[str(block_info['time'] + 3600 * i)] = {
                            "hashrate": block_info['hashrate'],
                            "difficulty": block_info['difficulty'],
                            "block_time": block_info['block_time']
                        }
                else:
                    coin_agg[str(block_info['time'])] = {
                        "hashrate": block_info['hashrate'],
                        "difficulty": block_info['difficulty'],
                        "block_time": block_info['block_time']
                    }

    for coin_id, social_data in social.items():
        for api_call in social_data:
            if len(api_call['Data']) == 0:
                print("Problem at social data")
                pass
            for social_info in api_call['Data']:
                k = str(social_info['time'])
                if k not in coin_agg:
                    coin_agg[k] = {}
                coin_agg[k]['comments'] = social_info['comments']
                coin_agg[k]['posts'] = social_info['posts']
                coin_agg[k]['followers'] = social_info['followers']
                coin_agg[k]['points'] = social_info['points']
                coin_agg[k]['reddit_active_users'] = social_info['reddit_active_users']
                coin_agg[k]['reddit_comments_per_hour'] = social_info['reddit_comments_per_hour']

    for coin_id, currency_data in prices.items():
        for api_call in currency_data:
            if len(api_call['Data']) == 0:
                pass

            for d in api_call['Data']:
                coin_agg[str(d["time"])]['high'] = d['high']
                coin_agg[str(d["time"])]['low'] = d['low']
                coin_agg[str(d["time"])]['open'] = d['open']
                coin_agg[str(d["time"])]['close'] = d['close']

    csv = []
    prev = {
        "comments": 0,
        "posts": 0,
        "followers": 0,
        "points": 0,
    }
    for k, v in coin_agg.items():
        if len(v) != 13:
            continue

        if len(prev) == 4:
            prev['comments'] = v['comments']
            prev['posts'] = v['posts']
            prev['followers'] = v['followers']
            prev['points'] = v['points']

        csv.append({
            "id": int(k),
            "close": v['close'],
            "open": v['open'],
            "hashrate": int(v['hashrate']),
            "difficulty": int(v['difficulty']),
            "block_time": int(v['block_time']),
            "comments": v['comments'] - prev['comments'],
            "posts": v['posts'] - prev['posts'],
            "followers": v['followers'] - prev['followers'],
            "points": v['points'] - prev['points'],
            "reddit_active_users": v['reddit_active_users'],
            "reddit_comments_per_hour": int(v['reddit_comments_per_hour'])
        })

        prev = v

    df = pd.DataFrame(csv)
    df = df.set_index(keys=["id"])
    df.sort_index(inplace=True)
    df = add_technical_features(df)

    df.reset_index(inplace=True)
    csv = df.to_dict('records')

    return csv


def find_coin(coin_id):
    currencies = Configuration.config["currencies"]

    for coin in currencies:
        if coin["id"] == coin_id:
            return coin["coin"].lower()

