import pytest
import os
import sys
import pandas as pd
from backtesting import Backtest, Strategy
from backtesting.test import SMA

# Add the python-scripts directory to the system path to import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../python-scripts')))
from save_backtest import save_backtest

class SmaCross(Strategy):
    """
    A simple trading strategy using the Simple Moving Average (SMA).

    This strategy initializes two moving averages and defines a placeholder
    for trading logic in the next method, which is not implemented in this test.
    """
    def init(self):
        """
        Initialize indicators for the strategy.

        This method sets up the necessary indicators for the strategy,
        such as the moving averages.
        """
        self.ma1 = self.I(SMA, self.data.Close, 10)  # 10-period SMA
        self.ma2 = self.I(SMA, self.data.Close, 20)  # 20-period SMA

    def next(self):
        """
        Define the trading logic to execute on each time step.

        This method is called at each time step during the backtest.
        Currently, it does nothing (pass).
        """
        pass  # No trading logic

def test_backtest_run():
    """
    Test to ensure the Backtest runs without errors.

    This test initializes a Backtest instance with sample market data
    and runs the backtest. The goal is to verify that the backtest can
    execute without raising exceptions.
    """
    # Sample market data
    data = pd.DataFrame({
        'Open': [1.1, 1.2, 1.3, 1.4],
        'High': [1.2, 1.3, 1.4, 1.5],
        'Low': [1.0, 1.1, 1.2, 1.3],
        'Close': [1.15, 1.25, 1.35, 1.45],
        'Volume': [100, 200, 300, 400]
    })

    # Initialize the Backtest with the data and the strategy
    bt = Backtest(data, SmaCross, commission=0.002, exclusive_orders=True)

    # Run the backtest without checking any outputs
    bt.run()
