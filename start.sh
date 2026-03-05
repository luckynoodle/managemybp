#!/bin/bash
PORT=8100
DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if port is already in use
if lsof -ti :$PORT > /dev/null 2>&1; then
    echo "Port $PORT is already in use. Run ./restart.sh or ./stop.sh first."
    exit 1
fi

echo "Starting BP Tracker on http://localhost:$PORT"
cd "$DIR" && python3 -m http.server $PORT &
echo $! > "$DIR/.server.pid"
echo "Server started (PID: $!)"
