import sys
import pytest
import os
import pandas as pd

# Adding the parent directory of 'python-scripts' to the system path to import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../python-scripts')))

from Import_data import fetch_data, save_to_csv

def test_fetch_data():
    """
    Test the fetch_data function to ensure it returns a DataFrame.

    This test calls the fetch_data function with specific parameters 
    and checks that the returned DataFrame is not empty and contains 
    a 'Close' column. This ensures that the data fetching logic is 
    working as intended.
    """
    data = fetch_data('EURUSD=X', '2023-01-01', '2023-06-30', '1d')
    assert not data.empty  # The fetched data should not be empty
    assert 'Close' in data.columns  # The data should contain a 'Close' column

def test_save_to_csv(tmpdir):
    """
    Test the save_to_csv function to ensure it saves data correctly.

    This test calls the fetch_data function to retrieve data and 
    then saves it to a CSV file using the save_to_csv function. 
    It checks whether the file exists and whether the saved CSV can 
    be read back correctly, ensuring that the data has been saved 
    properly.
    
    Parameters:
        tmpdir: A pytest fixture that provides a temporary directory 
                unique to the test invocation.
    """
    data = fetch_data('EURUSD=X', '2023-01-01', '2023-06-30', '1d')
    csv_file = save_to_csv(data, tmpdir)

    # Check if the file exists
    assert os.path.exists(csv_file)
    
    # Check if the saved file can be read back correctly
    saved_data = pd.read_csv(csv_file)
    assert not saved_data.empty  # Ensure the saved CSV is not empty
    assert 'Close' in saved_data.columns  # Ensure 'Close' column is present
