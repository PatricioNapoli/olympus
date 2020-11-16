import os

import pandas as pd

from .database import Database
from .lstm import lstm


class Training(object):
    def __init__(self):
        self.database = Database(os.environ["DB_HOST"])

    def train(self):
        mode = "hourly"

        db_table = "btc_history_daily"
        if mode == "hourly":
            db_table = "btc_history"

        pd.options.display.max_columns = 50
        pd.options.mode.chained_assignment = None

        data = self.database.get_table(db_table)
        df = pd.DataFrame(data)

        df['id'] = pd.to_datetime(df['id'], unit='s')
        df = df.set_index(keys=["id"])
        df.sort_index(inplace=True)

        close = df['close']
        df.drop(labels=['close'], axis=1, inplace=True)
        df.insert(0, 'close', close)

        monthly_roi, rmse, train_samples = lstm(mode, df)
        self.database.insert(db_table + "_latest", {"id": "model",
                                                    "monthly_roi": monthly_roi,
                                                    "rmse": rmse,
                                                    "train_samples": train_samples})
