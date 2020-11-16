from predict import predict


def run():
    p = predict.Predict()
    p.predict()


if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print()
        print("Olympus aborted. Exiting!")
