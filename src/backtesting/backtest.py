import pandas as pd
import os

# Load historical data from CSV
csv_file_path = '../data/eur_usd_historical_data.csv'  # Update the path

# Check if the file exists
if not os.path.exists(csv_file_path):
    raise FileNotFoundError(f"The file {csv_file_path} does not exist.")

data = pd.read_csv(csv_file_path, parse_dates=True, index_col='Date')

def moving_average_strategy(data, short_window=20, long_window=50):
    # Calculate short and long moving averages
    data['Short_MA'] = data['Close'].rolling(window=short_window).mean()
    data['Long_MA'] = data['Close'].rolling(window=long_window).mean()

    # Create a signal: 1 for buy, 0 for hold, -1 for sell
    data['Signal'] = 0
    data.iloc[short_window:, data.columns.get_loc('Signal')] = \
        (data['Short_MA'].iloc[short_window:] > data['Long_MA'].iloc[short_window:]).astype(int)  # Buy signal
    data['Position'] = data['Signal'].diff()  # Determine when to enter or exit a position

    return data

def calculate_metrics(portfolio, initial_capital):
    # Calculate performance metrics
    total_return = portfolio['Total'].iloc[-1] - initial_capital
    percentage_return = (total_return / initial_capital) * 100
    max_drawdown = (portfolio['Total'].min() - portfolio['Total'].max()) / portfolio['Total'].max()  # Maximum drawdown
    volatility = portfolio['Return'].std() * 252  # Annualized volatility
    annual_return = (portfolio['Total'].iloc[-1] / initial_capital) ** (1 / (portfolio.index[-1] - portfolio.index[0]).days * 365) - 1

    # Sharpe Ratio
    sharpe_ratio = annual_return / volatility if volatility != 0 else 0

    # Win Rate and other trade metrics
    trades = portfolio['Position'].dropna()
    num_trades = trades.count()
    wins = trades[trades > 0].count()
    win_rate = (wins / num_trades) * 100 if num_trades > 0 else 0

    metrics = {
        'Total Return [%]': percentage_return,
        'Return (Ann.) [%]': annual_return * 100,
        'Max. Drawdown [%]': max_drawdown * 100,
        'Volatility (Ann.) [%]': volatility * 100,
        'Sharpe Ratio': sharpe_ratio,
        'Win Rate [%]': win_rate,
        'Number of Trades': num_trades,
    }

    return metrics
def trading_strategy(data):
    data['Buy_Signal'] = (data['anomaly'] == -1) & (data['volume_spike'])
    data['Sell_Signal'] = (data['anomaly'] == 1) & (data['volume_spike'])
    
    # Portfolio logic
    portfolio = pd.DataFrame(index=data.index)
    portfolio['Position'] = 0
    
    portfolio.loc[data['Buy_Signal'], 'Position'] = 1  # Buying
    portfolio.loc[data['Sell_Signal'], 'Position'] = -1  # Selling

    # Calculate returns
    portfolio['Daily_Return'] = data['close'].pct_change() * portfolio['Position'].shift(1)
    portfolio['Total_Return'] = (1 + portfolio['Daily_Return']).cumprod()
    
    return portfolio

def backtest(data):
    data = moving_average_strategy(data)

    initial_capital = 10000  # Starting capital
    shares = 100  # Number of shares to buy/sell

    # Create a DataFrame to hold portfolio values
    portfolio = pd.DataFrame(index=data.index)
    portfolio['Holdings'] = (data['Signal'].shift(1) * shares * data['Close']).cumsum()  # Portfolio value
    portfolio['Cash'] = initial_capital - (data['Position'].shift(1) * shares * data['Close']).cumsum()  # Cash
    portfolio['Total'] = portfolio['Holdings'] + portfolio['Cash']  # Total portfolio value
    portfolio['Return'] = portfolio['Total'].pct_change()  # Daily return
    portfolio['Position'] = data['Position']  # Ensure Position is included

    # Calculate performance metrics
    metrics = calculate_metrics(portfolio, initial_capital)

    return portfolio, metrics

if __name__ == "__main__":
    # Run backtest
    portfolio, metrics = backtest(data)

    # Output results
    print(portfolio.tail())  # Display last few rows of the portfolio
    print("\nPerformance Metrics:")
    for key, value in metrics.items():
        print(f"{key}: {value:.2f}")
