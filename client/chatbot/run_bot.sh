#!/bin/bash
# Shell script to start TelePlan AI Chatbot from chatbot directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

export PYTHONPATH="$HOME/Library/Python/3.9/lib/python/site-packages:$PYTHONPATH"

if [ "$1" == "--server" ]; then
    echo "Starting TelePlan AI Chatbot FastAPI server on http://localhost:5005..."
    python3 bot.py --server
else
    echo "Starting TelePlan AI Chatbot CLI Terminal Mode..."
    python3 bot.py
fi
