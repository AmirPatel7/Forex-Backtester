#!/bin/bash

# Start the React frontend (port 3000)
npm run react &

npm run server &

code-server --bind-addr 0.0.0.0:8080
