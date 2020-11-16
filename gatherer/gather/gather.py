import math
import time
import requests
import os

from .config import Configuration
from .database import Database
from .csv import build


class Gatherer(object):
    def __init__(self, granularity):
        self.currencies = Configuration.config["currencies"]
        self.currency_conversion = Configuration.config["currency_conversion"]
        self.api_histo_hour_limit = Configuration.config["api_histo_hour_limit"]

        self.database = Database(os.environ["DB_HOST"])

        self.step = 0
        self.timesteps_needed = 0
        self.start_time = time.time()
        self.granularity = granularity

        self.api_histo_daily_block_url = Configuration.config["api_histo_day_block_url"]

        if granularity == "hourly":
            self.timestep = 3600
            self.db_table = "btc_history"
            self.db_table_latest = "btc_history_latest"
            self.api_histo_hour_url = Configuration.config["api_histo_hour_url"]
            self.api_histo_hour_social_url = Configuration.config["api_histo_hour_social_url"]
        else:
            self.timestep = 3600 * 24
            self.db_table = "btc_history_daily"
            self.db_table_latest = "btc_history_daily_latest"
            self.api_histo_hour_url = Configuration.config["api_histo_day_url"]
            self.api_histo_hour_social_url = Configuration.config["api_histo_day_social_url"]

    def get_info(self):
        return "Gathering for currencies: " + str(self.currencies) + \
               " - Physical currency: " + self.currency_conversion + " - "

    def gather(self):
        print("Starting for " + self.granularity)

        latest = self.database.get(self.db_table_latest, "latest_epoch")

        diff = (60 * 60 * 24 * 365)
        if self.granularity == "daily":
            diff *= 4

        since = time.time() - diff

        if latest is not None:
            since = latest["value"]

        time_diff = time.time() - since
        if time_diff >= self.timestep:
            self.timesteps_needed = math.floor(time_diff / self.timestep)
        else:
            self.timesteps_needed = 0

        if self.timesteps_needed == 0:
            print("Database up to date!")
            return

        self.timesteps_needed += 26  # Minimum for moving averages

        print(self.get_info() + "Since epoch: " + str(since))
        print("Downloading " + str(self.timesteps_needed) + " timesteps per currency.")
        print("API timesteps per call limit: " + str(self.api_histo_hour_limit) +
              " - API calls needed per currency: " + str(math.ceil(self.timesteps_needed / self.api_histo_hour_limit)))

        print('Downloading.. ', end='', flush=True)

        self.start()

        self.database.insert(self.db_table_latest, {"id": "latest_epoch", "value": int(round(time.time() - time.time() % self.timestep))})

        print("Time taken: " + str(time.time() - self.start_time) + " seconds.")

    def make_request(self, lst, res_list):
        for coin_id, urls in lst.items():
            for url in urls:
                r = requests.get(url)

                if r.text != "" and r.text is not None:
                    res_list[coin_id].append((r.json()))

    def start(self):
        response_list_histo = {}
        response_list_histo_social = {}
        response_list_histo_block = {}

        histo_url_list = self.generate_urls(self.api_histo_hour_url)
        histo_social_url_list = self.generate_urls(self.api_histo_hour_social_url)
        histo_block_url_list = self.generate_urls(self.api_histo_daily_block_url)

        for i, u in histo_url_list.items():
            response_list_histo[i] = []

        for i, u in histo_social_url_list.items():
            response_list_histo_social[i] = []

        for i, u in histo_block_url_list.items():
            response_list_histo_block[i] = []

        self.make_request(histo_url_list, response_list_histo)
        self.make_request(histo_social_url_list, response_list_histo_social)
        self.make_request(histo_block_url_list, response_list_histo_block)

        csv = build(response_list_histo, response_list_histo_social, response_list_histo_block, self.granularity)
        self.database.insert(self.db_table, csv[26:])

    def generate_urls(self, endpoint):
        url_list = {}

        for i in range(len(self.currencies)):
            ts_left = self.timesteps_needed

            if endpoint == self.api_histo_daily_block_url:
                ts_left += 1

            last_to = int(time.time())

            url_list[self.currencies[i]["id"]] = []

            while ts_left > 0:

                if ts_left > self.api_histo_hour_limit:
                    h = self.api_histo_hour_limit
                else:
                    h = ts_left

                final_url_endpoint = endpoint + "?fsym=" + self.currencies[i]["coin"] + \
                                                      "&tsym=" + self.currency_conversion + \
                                                      "&coin=1182" + \
                                                      "&limit=" + str(h) + \
                                                      "&aggregate=1&toTs=" + str(last_to) + \
                                                      "&api_key=" + os.environ['OLYMPUS_CRYPTO_API']
                print(final_url_endpoint)

                url_list[self.currencies[i]["id"]].append(final_url_endpoint)

                ts_left -= self.api_histo_hour_limit
                last_to -= h * self.timestep

        return url_list
