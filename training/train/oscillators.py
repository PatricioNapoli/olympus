def rsi(diff, window):
    up, down = diff.copy(), diff.copy()
    up[up < 0] = 0
    down[down > 0] = 0

    roll_up1 = up.ewm(span=window).mean()
    roll_down1 = down.abs().ewm(span=window).mean()

    rs = roll_up1 / roll_down1
    return 100.0 - (100.0 / (1.0 + rs))


def macd(values, n1=12, n2=26):
    exp1 = values.ewm(span=n1, adjust=False).mean()
    exp2 = values.ewm(span=n2, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    return macd, signal
