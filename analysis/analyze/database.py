from rethinkdb import RethinkDB


class Database(object):
    def __init__(self, url):
        self.r = RethinkDB()
        self.conn = self.r.connect(url, 28015)

    def client(self):
        return self.r

    def get_table(self, tbl):
        return self.r.db("olympus").table(tbl).run(self.conn)

    def get(self, tbl, key):
        return self.r.db("olympus").table(tbl).get(key).run(self.conn)

    def insert(self, tbl, obj):
        self.r.db("olympus").table(tbl).insert(
            obj,
            conflict="replace"
        ).run(self.conn)
