import pytest
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from unittest.mock import patch, MagicMock
import os
import sys

# Add the directory containing your script to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import your script (assuming it's named anomaly_detection.py)
import anomaly_detection

@pytest.fixture
def sample_df():
    return pd.DataFrame({
        'open': [1.0, 2.0, 3.0, 4.0, 5.0],
        'high': [1.1, 2.1, 3.1, 4.1, 5.1],
        'low': [0.9, 1.9, 2.9, 3.9, 4.9],
        'close': [1.05, 2.05, 3.05, 4.05, 5.05],
        'volume': [1000, 2000, 3000, 4000, 10000],
        'time': ['09:00', '10:00', '11:00', '12:00', '13:00']
    })

def test_load_data(tmp_path):
    # Create a temporary directory with mock Parquet files
    d = tmp_path / "test_data"
    d.mkdir()
    mock_df = pd.DataFrame({'open': [1, 2, 3], 'high': [1.1, 2.1, 3.1], 'low': [0.9, 1.9, 2.9], 'close': [1.05, 2.05, 3.05], 'volume': [1000, 2000, 3000], 'time': ['09:00', '10:00', '11:00']})
    mock_df.to_parquet(d / "test1.parquet")
    mock_df.to_parquet(d / "test2.parquet")

    # Test data loading
    result = anomaly_detection.load_data(str(d))
    
    assert isinstance(result, pd.DataFrame)
    assert len(result) == 6  # 3 rows * 2 files
    assert list(result.columns) == ['open', 'high', 'low', 'close', 'volume', 'time']

def test_preprocess_data(sample_df):
    features = ['open', 'high', 'low', 'close', 'volume']
    preprocessed = anomaly_detection.preprocess_data(sample_df, features)
    
    assert preprocessed.shape == (5, 5)
    assert np.allclose(preprocessed.mean(), 0, atol=1e-10)
    assert np.allclose(preprocessed.std(), 1, atol=1e-10)

def test_detect_anomalies(sample_df):
    features = ['open', 'high', 'low', 'close', 'volume']
    X = anomaly_detection.preprocess_data(sample_df, features)
    anomalies = anomaly_detection.detect_anomalies(X)
    
    assert len(anomalies) == len(sample_df)
    assert set(anomalies).issubset({-1, 1})

def test_calculate_volume_spikes(sample_df):
    volume_spikes = anomaly_detection.calculate_volume_spikes(sample_df, threshold=1.5)
    
    assert len(volume_spikes) == len(sample_df)
    assert volume_spikes.sum() == 1  # Only the last value should be a spike

def test_analyze_anomalies(capsys, sample_df):
    sample_df['anomaly'] = [-1, 1, -1, 1, 1]
    sample_df['volume_spike'] = [True, False, True, False, False]
    anomalies = sample_df[sample_df['anomaly'] == -1]
    features = ['open', 'high', 'low', 'close', 'volume']
    
    anomaly_detection.analyze_anomalies(sample_df, anomalies, features)
    
    captured = capsys.readouterr()
    assert "Anomalies detected: 2" in captured.out
    assert "Anomalies with volume spikes: 2" in captured.out
    assert "Anomaly Proportion: 40.00%" in captured.out
    assert "Volume Spike Frequency: 40.00%" in captured.out
    assert "Percentage of Anomalies with Volume Spikes: 100.00%" in captured.out

def test_plot_time_distribution(sample_df):
    sample_df['anomaly'] = [-1, 1, -1, 1, 1]
    anomalies = sample_df[sample_df['anomaly'] == -1]
    
    with patch('matplotlib.pyplot.show') as mock_show:
        anomaly_detection.plot_time_distribution(anomalies)
        mock_show.assert_called_once()

def test_main_execution(tmp_path):
    # Mock command line arguments
    test_args = ['anomaly_detection.py', '--base_dir', str(tmp_path), '--news_file_path', 'dummy_news.csv', '--volume_threshold', '1.5']
    
    with patch('sys.argv', test_args), \
         patch('anomaly_detection.load_data', return_value=sample_df()), \
         patch('anomaly_detection.pd.DataFrame.to_csv') as mock_to_csv, \
         patch('matplotlib.pyplot.show'):
        
        # Run the main function
        anomaly_detection.main()
        
        # Check if the CSV was written
        mock_to_csv.assert_called_once_with('anomalies.csv', index=False)

if __name__ == '__main__':
    pytest.main()
