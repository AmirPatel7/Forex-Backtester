"""
Historical Currency Pair Data Downloader

This script downloads historical data for a specified currency pair from 
Yahoo Finance and saves it as a CSV file for further analysis or backtesting.

@module CurrencyDataDownloader
@requires yfinance
"""


import yfinance as yf

# Download historical data for a currency pair (e.g., EUR/USD)
currency_pair = 'EURUSD=X'  # Yahoo Finance ticker symbol for EUR/USD
data = yf.download(currency_pair, start="2020-01-01", end="2024-01-01")

# Print the data to analyze or feed into your backtesting engine
print(data)

data.to_csv('eur_usd_historical_data.csv')
