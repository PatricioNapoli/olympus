import math

from keras import initializers
from keras.models import Sequential
from keras.layers import Dense, LSTM, GRU
from keras.regularizers import l2

from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error

import pandas as pd
import numpy as np

import matplotlib.pyplot as plt

import joblib


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


def lstm(mode, df):
    np.random.seed(1337)

    scaler_names = {
        "hourly": './trained_model_hour_scaler.gz',
        "daily": './trained_model_scaler.gz'
    }

    model_names = {
        "hourly": './trained_model_hour',
        "daily": './trained_model'
    }

    epochs = {
        "hourly": 50,
        "daily": 300
    }

    bias = {
        "hourly": 0.5,
        "daily": 0.2
    }

    #del df['open']
    #df = df.iloc[:, 0:1] # Test daily data.., linear component is too strong.

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(df.values)
    joblib.dump(scaler, scaler_names[mode])

    reframed = series_to_supervised(scaled, 1, 1)
    reframed.drop(reframed.columns[21:], axis=1, inplace=True)
    print(reframed.head())

    # Split into train and test sets
    values = reframed.values
    n_train_hours = int(len(reframed) * 0.80)
    train = values[:n_train_hours, :]
    test = values[n_train_hours:, :]

    # Split into input and outputs
    train_X, train_y = train[:, :-1], train[:, -1]
    test_X, test_y = test[:, :-1], test[:, -1]

    # Reshape input to be 3D [samples, timesteps, features]
    train_X = train_X.reshape((train_X.shape[0], 1, train_X.shape[1]))
    test_X = test_X.reshape((test_X.shape[0], 1, test_X.shape[1]))

    # Network
    model = Sequential()

    model.add(LSTM(50,
                   return_sequences=True,
                   input_shape=(train_X.shape[1], train_X.shape[2]),
                   kernel_regularizer=l2(0.03),
                   recurrent_regularizer=l2(0.06),
                   bias_regularizer=l2(0.03),
                   dropout=0.001,
                   bias_initializer=initializers.Constant(bias[mode]),
                   ))

    model.add(GRU(50,
                  return_sequences=True,
                  input_shape=(train_X.shape[1], train_X.shape[2]),
                  ))

    model.add(Dense(100,
                    input_shape=(train_X.shape[1], train_X.shape[2]),
                    ))

    model.add(Dense(1))

    model.compile(loss='mae', optimizer='adamax')

    # Fit
    history = model.fit(train_X, train_y, epochs=epochs[mode], batch_size=64, validation_data=(test_X, test_y), verbose=2)

    # History plot
    plt.plot(history.history['loss'], label='train')
    plt.plot(history.history['val_loss'], label='test')
    plt.legend()
    plt.show()

    # Predict
    ypreds = model.predict(test_X)
    test_X = test_X.reshape((test_X.shape[0], test_X.shape[2]))

    ypreds = ypreds.reshape((len(ypreds), 1))

    # Invert scaling for preds
    inv_ypreds = np.concatenate((ypreds, test_X[:, 1:]), axis=1)
    inv_ypreds = scaler.inverse_transform(inv_ypreds)
    inv_ypreds = inv_ypreds[:, 0]

    # Invert scaling for actuals
    test_y = test_y.reshape((len(test_y), 1))
    inv_y = np.concatenate((test_y, test_X[:, 1:]), axis=1)
    inv_y = scaler.inverse_transform(inv_y)
    inv_y = inv_y[:, 0]

    # RMSE
    rmse = math.sqrt(mean_squared_error(inv_y, inv_ypreds))
    print('Test RMSE: %.3f' % rmse)

    plt.plot(inv_y, label='actual')
    plt.plot(inv_ypreds, label='predictions')
    plt.legend()
    plt.show()

    starting_portfolio = 2000
    i = 0
    usdt = 2000
    btc = 0
    for actual in inv_y:
        if i == 0 or i == len(inv_y) - 1:
            i += 1
            continue

        if inv_ypreds[i + 1] > actual:
            btc += usdt / actual  # Buy signal
            usdt = 0
        elif inv_ypreds[i + 1] < actual:
            usdt += btc * actual  # Sell signal
            btc = 0

        i += 1

    if usdt == 0:
        usdt = btc * inv_y[-1]

    monthly_ratios = {
        "daily": 30,
        "hourly": 24 * 30
    }

    profit = usdt - starting_portfolio
    prof_ratio = profit / starting_portfolio
    monthly_roi = prof_ratio / (len(inv_y) / monthly_ratios[mode])

    print(f"Profit with starting: USDT${starting_portfolio} was USDT${profit}")
    print(f"Monthly RoI: {monthly_roi}")

    if monthly_roi > 0.12:
        model.save(model_names[mode])

    return monthly_roi, rmse, train_X.shape[0]
