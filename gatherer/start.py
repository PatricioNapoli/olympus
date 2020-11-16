from gather import config
from gather import gather


def run():
    config.Configuration().load()
    gh = gather.Gatherer("hourly")
    gh.gather()

    gd = gather.Gatherer("daily")
    gd.gather()


if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print()
        print("Olympus aborted. Exiting!")
