import os

from .database import Database
from .explore import explore


class Analyzer(object):
    def __init__(self):
        self.database = Database(os.environ["DB_HOST"])

    def analyze(self):
        data = self.database.get_table("btc_history")

        explore(data)
