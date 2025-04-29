import pandas as pd
import os
from sklearn.ensemble import IsolationForest
import numpy as np
import matplotlib.pyplot as plt
import json

# Base directory for your Parquet files
base_dir = '../forex'
news_file_path = '../eur_usd_historical_data.csv'  # Path to your historical market news data
volume_threshold = 1.5  # Example threshold for volume spikes
plot_output = '../../../public/anomaly_results/anomaly.png'
json_output = '../../../public/anomaly_results/anomaly.json'

# Initialize a list to hold DataFrames and a dictionary to collect outputs for JSON
dataframes = []
results = {}

# Walk through the directory and load data
for root, dirs, files in os.walk(base_dir):
    results['directories_scanned'] = root
    for file in files:
        if file.endswith('.parquet'):
            file_path = os.path.join(root, file)
            df = pd.read_parquet(file_path)
            dataframes.append(df)

# Concatenate all DataFrames into one (if needed)
if dataframes:
    full_df = pd.concat(dataframes, ignore_index=True)

    # Data Preprocessing
    features = ['open', 'high', 'low', 'close', 'volume']
    X = full_df[features]
    X = X.fillna(X.mean())  # Handle missing data
    X_normalized = (X - X.mean()) / X.std()  # Normalize data

    # Calculate volume spikes
    mean_volume = full_df['volume'].mean()
    full_df['volume_spike'] = full_df['volume'] > (mean_volume * volume_threshold)

    # Train Isolation Forest model
    model = IsolationForest(contamination=0.01, random_state=42)
    full_df['anomaly'] = model.fit_predict(X_normalized)

    anomalies = full_df[full_df['anomaly'] == -1]
    results['anomalies_detected'] = len(anomalies)
    
    anomalies.to_csv('anomalies.csv', index=False)  # Save anomalies to CSV
    
    # Filter anomalies with volume spikes
    anomalies_with_volume = anomalies[anomalies['volume_spike']]
    results['anomalies_with_volume_spikes'] = len(anomalies_with_volume)

    # Additional Metrics
    total_data_points = len(full_df)
    anomaly_proportion = len(anomalies) / total_data_points * 100
    volume_spike_frequency = len(full_df[full_df['volume_spike']]) / total_data_points * 100
    anomaly_with_spike_proportion = len(anomalies_with_volume) / len(anomalies) * 100

    results['anomaly_proportion'] = anomaly_proportion
    results['volume_spike_frequency'] = volume_spike_frequency
    results['anomaly_volume_overlap'] = anomaly_with_spike_proportion
    results['anomaly_descriptive_statistics'] = anomalies[features].describe().to_dict()

    # Time of Day Analysis for Anomalies
    if 'time' in anomalies.columns:
        time_distribution = anomalies['time'].value_counts().sort_index()
        results['time_distribution'] = time_distribution.to_dict()

        # Plot Time of Day distribution
        plt.figure(figsize=(12, 6))
        plt.gca().set_facecolor('white')
        time_distribution.plot(kind='line', title='Anomalies by Time of Day', color='royalblue', grid=True)
        plt.grid(color='black', linestyle='-', linewidth=0.5)
        plt.gca().spines['top'].set_color('black')
        plt.gca().spines['right'].set_color('black')
        plt.gca().spines['bottom'].set_color('black')
        plt.gca().spines['left'].set_color('black')
        plt.xlabel('Time of Day (24-hour format)', fontsize=12, color='black')
        plt.ylabel('Number of Anomalies', fontsize=12, color='black')
        plt.xticks(rotation=45, color='black')
        plt.yticks(color='black')
        plt.tight_layout()
        plt.scatter(time_distribution.index, time_distribution, color='red', zorder=5)
        plt.savefig(plot_output)  # Save the plot as a PNG file
        plt.close()
    else:
        results['time_analysis'] = 'No time column available.'

else:
    results['error'] = "No Parquet files found."

# Save results to JSON
with open(json_output, 'w') as json_file:
    json.dump(results, json_file, indent=4)
