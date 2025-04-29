"""
Backtest Results Saver

This module provides a function to save the results of a backtest, including
statistical data and a plot, to a specified folder.

@module SaveBacktest
@requires os
"""

import os

def save_backtest(backtest, folder_path):
    """
    Save the results of a backtest to a specified folder.

    This function runs the backtest, creates a results folder if it doesn't 
    exist, and saves the backtest statistics in JSON format and the plot as 
    an HTML file.

    @param backtest: Backtest - An instance of the Backtest class containing 
                      the strategy and data for the backtest.
    @param folder_path: str - The path of the folder where the results will be 
                            saved.

    @return: None
    """
    # Run the backtest
    stats = backtest.run()

    # Create the results folder if it doesn't exist
    results_folder = os.path.join(folder_path, "results")
    os.makedirs(results_folder, exist_ok=True)

    # Save the backtest results as a JSON file
    stats.to_json(os.path.join(results_folder, "backtest_results.json"))

    # Save the backtest plot as an HTML file
    backtest.plot(filename=os.path.join(results_folder, "plot.html"), open_browser=False)