"""
Historical Data Fetcher for Financial Assets

This script fetches historical data for a specified financial asset from 
Yahoo Finance, saves it as a CSV file, and can optionally execute a 
backtesting script with the saved data.

@module ImportData
@requires yfinance
@requires os
@requires sys
@requires subprocess
"""

import sys
import os
import yfinance as yf
import subprocess

def fetch_data(asset, from_date, to_date, interval):
    """
    Fetch historical data for the specified asset from Yahoo Finance.

    @param asset: str - The asset ticker symbol (e.g., 'EURUSD=X').
    @param from_date: str - The start date for the data in 'YYYY-MM-DD' format.
    @param to_date: str - The end date for the data in 'YYYY-MM-DD' format.
    @param interval: str - The frequency of data (e.g., '1d', '1h').

    @return: DataFrame - A pandas DataFrame containing the fetched data.
    """
    print(f"Fetching data for {asset} from {from_date} to {to_date} with interval {interval}...", flush=True)
    # Fetching data from Yahoo Finance
    data = yf.download(asset, start=from_date, end=to_date, interval=interval)
    print(f"Data fetching completed for {asset}.", flush=True)
    return data

def save_to_csv(df, folder_path):
    """
    Save the DataFrame to a CSV file in the specified folder.

    @param df: DataFrame - The pandas DataFrame to save.
    @param folder_path: str - The path of the folder where the CSV file will be saved.

    @return: str - The full path of the saved CSV file.
    """
    print(f"Saving data to CSV in folder: {folder_path}...", flush=True)
    # Creating the folder and saving CSV
    os.makedirs(folder_path, exist_ok=True)
    csv_file = os.path.join(folder_path, "data.csv")
    df.to_csv(csv_file)
    print(f"Data saved to {csv_file}.", flush=True)
    return csv_file

if __name__ == '__main__':
    if len(sys.argv) != 7:
        print("Usage: python Import_data.py EURUSD=X 2023-01-01 2023-06-30 1d Backtester.py path/to/folder", flush=True)
        sys.exit(1)

    # Parse command line arguments
    asset = sys.argv[1]
    from_date = sys.argv[2]
    to_date = sys.argv[3]
    interval = sys.argv[4]
    backtester = sys.argv[5]
    folder_path = sys.argv[6]

    # Fetch and save data
    data = fetch_data(asset, from_date, to_date, interval)
    csv_file = save_to_csv(data, folder_path)

    # # Run the backtester script
    # try:
    #     print(f"Running backtester script: {backtester} with folder path: {folder_path}...", flush=True)
    #     subprocess.run([sys.executable, backtester, folder_path], check=True)
    #     print(f"Backtester executed successfully with folder path: {folder_path}", flush=True)
    # except subprocess.CalledProcessError as e:
    #     print(f"Error executing backtester script: {e}", flush=True)
    #     sys.exit(1)
