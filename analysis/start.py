from analyze import analyze


def run():
    a = analyze.Analyzer()
    a.analyze()


if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print()
        print("Olympus aborted. Exiting!")
