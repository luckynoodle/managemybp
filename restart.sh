#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Restarting BP Tracker..."
"$DIR/stop.sh"
sleep 1
"$DIR/start.sh"
