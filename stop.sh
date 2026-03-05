#!/bin/bash
PORT=8100
DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill any process on the port
PIDS=$(lsof -ti :$PORT 2>/dev/null)
if [ -n "$PIDS" ]; then
    echo "Killing process(es) on port $PORT: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null
else
    echo "No process found on port $PORT"
fi

# Clean up PID file
rm -f "$DIR/.server.pid"
echo "Server stopped"
