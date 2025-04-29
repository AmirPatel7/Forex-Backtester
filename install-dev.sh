npm install -g pnpm

# Run pnpm install
pnpm install

# Check if code-server is installed, if not, install it
if ! command -v code-server > /dev/null; then
    curl -fsSL https://code-server.dev/install.sh | sh
fi

# Copy config.yaml to code-server configuration directory
cp config.yaml ~/.config/code-server/config.yaml

# Check if Python is installed
if ! command -v python3 > /dev/null; then
    echo "Python3 is not installed. Please install Python 3.11 or newer."
    exit 1
fi

# Create a virtual environment in the python-scripts/venv directory
if [ ! -d "python-scripts/venv" ]; then
    python3 -m venv python-scripts/venv
    echo "Virtual environment created at python-scripts/venv"
else
    echo "Virtual environment already exists at python-scripts/venv"
fi

# Activate the virtual environment
source python-scripts/venv/bin/activate

# Upgrade pip in the virtual environment
pip install --upgrade pip

# Install the required Python packages from requirements.txt
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "requirements.txt not found. Please ensure the file exists."
    exit 1
fi

# Deactivate the virtual environment
deactivate

echo "Setup completed successfully."