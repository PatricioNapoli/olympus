from train import train


def run():
    a = train.Training()
    a.train()


if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print()
        print("Olympus aborted. Exiting!")
