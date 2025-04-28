import sys
import os
import pandas as pd
from backtesting import Backtest, Strategy
from backtesting.lib import crossover
from backtesting.test import SMA
import yfinance as yf
from datetime import datetime

def fetch_data(asset, from_date, to_date, interval):
    # Fetching data from Yahoo Finance
    data = yf.download(asset, start=from_date, end=to_date, interval=interval)
    return data

def save_to_csv(df, folder_name):
    # Creating the folder and saving CSV
    folder_path = os.path.join("Archive", folder_name)
    os.makedirs(folder_path, exist_ok=True)
    csv_file = os.path.join(folder_path, "data.csv")
    df.to_csv(csv_file)
    return csv_file, folder_path

def run_backtest(df, folder_path):
    class SmaCross(Strategy):
        def init(self):
            price = self.data.Close
            self.ma1 = self.I(SMA, price, 10)
            self.ma2 = self.I(SMA, price, 20)

        def next(self):
            if crossover(self.ma1, self.ma2):
                self.buy()
            elif crossover(self.ma2, self.ma1):
                self.sell()

    # Running backtest
    bt = Backtest(df, SmaCross, commission=.002, exclusive_orders=True)
    stats = bt.run()

    # Save the results to the folder
    results_folder = os.path.join(folder_path, "results")
    os.makedirs(results_folder, exist_ok=True)
    stats.to_json(os.path.join(results_folder, "backtest_results.json"))

    bt.plot(filename=os.path.join(results_folder, "plot.html"), open_browser=False)


if __name__ == '__main__':
    # Parse command line arguments
    asset = "EURUSD=X"
    from_date = "2023-01-01"
    to_date = "2023-06-30"
    interval = "1d"  # Daily interval


    # Create folder name based on asset and dates
    folder_name = f"{asset}_{from_date}_to_{to_date}"

    # Fetch and save data
    data = fetch_data(asset, from_date, to_date, interval)
    csv_file, folder_path = save_to_csv(data, folder_name)

    # Load the data and run the backtest
    df = pd.read_csv(csv_file)
    run_backtest(df, folder_path)
