#!/bin/sh
set -e

echo "Waiting for Elasticsearch to be ready..."
/app/wait-for-it.sh elasticsearch 9200 120

echo "Elasticsearch is ready. Starting application..."
exec java -jar /app/app.jar
