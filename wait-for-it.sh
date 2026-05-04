#!/bin/bash
# Wait for a service to be available

HOST=$1
PORT=$2
TIMEOUT=${3:-300}

echo "Waiting for $HOST:$PORT..."

start_time=$(date +%s)

while true; do
  if nc -z "$HOST" "$PORT" 2>/dev/null; then
    echo "$HOST:$PORT is available"
    exit 0
  fi
  
  current_time=$(date +%s)
  elapsed=$((current_time - start_time))
  
  if [ $elapsed -ge $TIMEOUT ]; then
    echo "Timeout waiting for $HOST:$PORT"
    exit 1
  fi
  
  sleep 2
done
