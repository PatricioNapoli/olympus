import pandas as pd

import matplotlib.pyplot as plt
from statsmodels.tsa.stattools import adfuller

from numpy import log

from .linear_assumptions import linear_regression_assumptions


def get_stationarity(df):
    df_open = df["close"]

    # Rolling Statistics
    rolling_mean = df_open.rolling(window=60).mean()
    rolling_std = df_open.rolling(window=60).std()

    plt.plot(df_open, color='blue', label='Valor')
    plt.plot(rolling_mean, color='red', label='Media Móvil')
    plt.plot(rolling_std, color='black', label='Desviación Móvil')

    plt.title(f"Precio Bitcoin Media & Desviación Estándar Móvil de 60 días")
    plt.xticks(rotation=90)
    plt.tight_layout()
    plt.show(block=False)

    plt.cla()

    plt.title(f"Precio Bitcoin Histograma Logarítmico")
    plt.hist(log(df_open))
    plt.show()

    # Dickey-Fuller Test
    result = adfuller(log(df["close"].values))
    print("Column: close")
    print('ADF Statistic: {}'.format(result[0]))
    print('p-value: {}'.format(result[1]))
    print('Critical Values:')
    for key, value in result[4].items():
        print('\t{}: {}'.format(key, value))


def explore(data):
    pd.options.display.max_columns = 20

    df = pd.DataFrame(data)
    df['id'] = pd.to_datetime(df['id'], unit='s')
    df = df.set_index(keys=["id"])
    df.sort_index(inplace=True)

    fts = ["hashrate", "difficulty",
            "block_time", "comments",
            "posts", "followers", "points",
            "reddit_active_users", "reddit_comments_per_hour"]

    linear_regression_assumptions(df[fts].to_numpy(), df["close"].to_numpy(), fts)

    print("Sample data: ")
    print(df.head().to_string())
    print()

    print("Summary Describe")
    print(df.iloc[:, 1:10].describe())
    print()

    get_stationarity(df)


