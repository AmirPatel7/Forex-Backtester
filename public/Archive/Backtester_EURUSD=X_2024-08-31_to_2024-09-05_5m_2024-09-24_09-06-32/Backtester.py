import sys
from backtesting import Backtest, Strategy
from backtesting.lib import crossover
import pandas as pd
from backtesting.test import SMA
from save_backtest import save_backtest

def run_backtest(folderPath):
    # Read CSV file provided as an argument
    df = pd.read_csv(folderPath + "/data.csv")

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
