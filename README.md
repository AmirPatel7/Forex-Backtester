## Running through terminal on development server

### Node.js and npm (running )

Make sure you have Node.js and npm installed. To verify the version of Node.js and npm, run:

```bash
nvm install 20
nvm use 20
```

### Install using install-dev.sh

```bash
chmod +x install-dev.sh
./install-dev.sh
```

### Running development server
```bash
npm start
```

### Running the anomaly detection 

Here is an example 

```bash
python anomaly_detection.py --base_dir "../forex" --news_file_path "../eur_usd_historical_data.csv"
```

where the base_dir is the specific company data that you would like to compare to 
yfinance data that can be specified under the --new_file_path tag 

## Running through Docker container (under development)

(Do not need to install Node.js)

Ensure Docker is installed:

```bash
docker --version
```

If you receive a "command not found" error, install Docker:

#### macOS Installation

1. Go to the [Docker Desktop for Mac download page](https://docs.docker.com/desktop/install/mac-install/#install-and-run-docker-desktop-on-mac).
2. Download the Docker Desktop installer (.dmg file).
3. Open the .dmg file and drag Docker to your Applications folder.
4. Launch Docker from the Applications folder and complete the setup instructions.

## Running the Project

### Build the Docker Image (Under construction, not working)

Build the Docker image with the following command:

```bash
docker compose up -d
```

To stop the docker image:

```bash
docker stop FOREX-Backtester
```





