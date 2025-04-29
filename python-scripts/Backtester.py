"""
Backtesting Script for SMA Crossover Strategy

This script performs backtesting on a trading strategy using historical data 
from a CSV file. The strategy implemented is a simple moving average (SMA) 
crossover strategy, which buys when the shorter moving average crosses above 
the longer moving average and sells when the opposite occurs.

@module BacktestScript
@requires sys
@requires pandas
@requires backtesting
@requires save_backtest
"""

import sys
from backtesting import Backtest, Strategy
from backtesting.lib import crossover
import pandas as pd
from backtesting.test import SMA
from save_backtest import save_backtest

def run_backtest(folderPath):
    """
    Runs the backtest on the historical data contained in the specified CSV file.

    @param folderPath: str - The path to the folder containing the data.csv file.
    """
    # Read CSV file provided as an argument
    df = pd.read_csv(folderPath + "/data.csv")

    class SmaCross(Strategy):
        """
        A trading strategy that uses the SMA crossover method.
        """
        def init(self):
            """
            Initializes the strategy by setting up the moving averages.
            """
            price = self.data.Close
            self.ma1 = self.I(SMA, price, 10)
            self.ma2 = self.I(SMA, price, 20)

        def next(self):
            """
            Executes the trading logic for the strategy at each time step.
            Buys if the shorter SMA crosses above the longer SMA and sells 
            if the shorter SMA crosses below the longer SMA.
            """
            if crossover(self.ma1, self.ma2):
                self.buy()
            elif crossover(self.ma2, self.ma1):
                self.sell()

    # Run backtest on the data read from the CSV file
    bt = Backtest(df, SmaCross, commission=.002, exclusive_orders=True)
    save_backtest(bt, folderPath)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python test.py <csv_file_name>")
        sys.exit(1)

    # Get the file name from the command line argument
    folderPath = sys.argv[1]
    
    # Run the backtest with the given file name
    run_backtest(folderPath)
