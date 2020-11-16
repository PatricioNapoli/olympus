import os
import time

import joblib
from keras.models import load_model

from .database import Database

import pandas as pd
import numpy as np


def series_to_supervised(data, n_in=1, n_out=1, dropnan=True):
    n_vars = 1 if type(data) is list else data.shape[1]
    df = pd.DataFrame(data)
    cols, names = list(), list()
    # input sequence (t-n, ... t-1)
    for i in range(n_in, 0, -1):
        cols.append(df.shift(i))
        names += [('var%d(t-%d)' % (j + 1, i)) for j in range(n_vars)]
    # forecast sequence (t, t+1, ... t+n)
    for i in range(0, n_out):
        cols.append(df.shift(-i))
        if i == 0:
            names += [('var%d(t)' % (j + 1)) for j in range(n_vars)]
        else:
            names += [('var%d(t+%d)' % (j + 1, i)) for j in range(n_vars)]
    # put it all together
    agg = pd.concat(cols, axis=1)
    agg.columns = names
    # drop rows with NaN values
    if dropnan:
        agg.dropna(inplace=True)
    return agg


class Predict(object):
    def __init__(self):
        self.database = Database(os.environ["DB_HOST"])

    def predict(self):
        print("Loading models and scalers..")

        model_d = load_model('./trained_model')
        scaler_d = joblib.load('trained_model_scaler.gz')

        model_h = load_model('./trained_model_hour')
        scaler_h = joblib.load('trained_model_hour_scaler.gz')

        last_hour_ts = round(time.time() - (time.time() % 3600))
        last_hour_pred = self.database.get_max("btc_hourly_preds")

        if last_hour_ts + 3600 != last_hour_pred["id"]:
            ts, pred = self.predict_ts(scaler_h, model_h, self.database.get_max("btc_history"))
            self.database.insert("btc_hourly_preds", {"id": ts + 3600, "value": pred})
            print(f"Next hour pred: {pred}")

        while True:
            last_day_ts = round(time.time() - (time.time() % (3600 * 24)))
            last_day_pred = self.database.get_max("btc_daily_preds")

            if last_day_ts + (3600 * 24) != last_day_pred["id"]:
                print("Pushing day prediction..")
                ts, pred = self.predict_ts(scaler_d, model_d, self.database.get_max("btc_history_daily"))
                self.database.insert("btc_daily_preds", {"id": ts + 3600 * 24, "value": pred})
                print(f"Next day pred: {pred}")

            print("Waiting for hour data..")
            changes = self.database.changes("btc_history")

            for c in changes:
                print("Pushing hour prediction..")
                ts, pred = self.predict_ts(scaler_h, model_h, c['new_val'])
                self.database.insert("btc_hourly_preds", {"id": ts + 3600, "value": pred})
                print(f"Next hour pred: {pred}")

            time.sleep(5)

    def transform(self, scaler, d):
        data = [d]
        df = pd.DataFrame(data)

        df['id'] = pd.to_datetime(df['id'], unit='s')
        df = df.set_index(keys=["id"])
        df.sort_index(inplace=True)

        close = df['close']
        df.drop(labels=['close'], axis=1, inplace=True)
        df.insert(0, 'close', close)

        values = scaler.transform(df.values)
        values = values.reshape((values.shape[0], 1, values.shape[1]))
        return values

    def predict_ts(self, scaler, model, data):
        print(f"Predicting for {data}")

        x = self.transform(scaler, data)

        y_pred = model.predict(x)

        # Invert scaling for pred
        y_pred = y_pred.reshape((len(y_pred), 1))
        x = x.reshape((x.shape[0], x.shape[2]))
        inv_ypred = np.concatenate((y_pred, x[:, 1:]), axis=1)
        inv_ypred = scaler.inverse_transform(inv_ypred)
        inv_ypred = inv_ypred[:, 0]

        return data['id'], inv_ypred[0]
