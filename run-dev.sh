#!/bin/bash

# JungleJourney Development Runner Script
# This script sets up the correct Node.js version and runs the development server

set -e  # Exit on any error

echo "🚀 Starting JungleJourney Development Server"
echo "=============================================="

# Check if NVM is available
if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
fi

# Load NVM if it exists
if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "📦 Loading NVM..."
    source "$NVM_DIR/nvm.sh"
else
    echo "❌ NVM not found. Please install NVM first."
    echo "   Visit: https://github.com/nvm-sh/nvm#installing-and-updating"
    exit 1
fi

# Use the correct Node.js version
echo "🔧 Switching to Node.js v18.20.8..."
nvm use 18.20.8

# Verify Node.js version
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" != "v18.20.8" ]]; then
    echo "❌ Wrong Node.js version. Expected v18.20.8, got $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION ready"

PORTS=(5000 8080)

# --- Aggressive port cleanup ---
# Uses multiple methods: fuser (via /proc), ss (socket stats), lsof (fallback)

free_port() {
    local PORT=$1

    # Method 1: fuser -k (uses /proc, works cross-user on Linux)
    fuser -k "${PORT}/tcp" 2>/dev/null || true

    # Method 2: ss -> extract PID -> kill by PID (most reliable for detection)
    PID=$(ss -tlnp "sport = :$PORT" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)
    if [ -n "$PID" ]; then
        kill -9 "$PID" 2>/dev/null || true
        # Also kill the parent tsx watcher if applicable
        PPID=$(ps -o ppid= -p "$PID" 2>/dev/null | tr -d ' ')
        [ -n "$PPID" ] && kill -9 "$PPID" 2>/dev/null || true
    fi

    # Method 3: lsof fallback
    lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
}

cleanup_ports() {
    local PORTS=("$@")

    # First pass: kill by process name (handles tsx watchers not bound to any port)
    pkill -f "tsx.*server/index" 2>/dev/null || true
    pkill -f "node.*server/index" 2>/dev/null || true

    for PORT in "${PORTS[@]}"; do
        echo "🧹 Freeing port $PORT..."
        free_port "$PORT"
    done

    # Retry loop: wait and verify with ss (up to ~8 seconds)
    for PORT in "${PORTS[@]}"; do
        for TRY in $(seq 1 8); do
            PID=$(ss -tlnp "sport = :$PORT" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)
            if [ -z "$PID" ]; then
                break
            fi
            echo "⏳ Port $PORT still held by PID $PID (attempt $TRY)..."
            kill -9 "$PID" 2>/dev/null || true
            sleep 1
        done
    done

    # Final status
    local any_in_use=0
    for PORT in "${PORTS[@]}"; do
        PID=$(ss -tlnp "sport = :$PORT" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)
        if [ -n "$PID" ]; then
            echo "⚠️  Port $PORT is still held by PID $PID — server may fail"
            any_in_use=1
        else
            echo "✅ Port $PORT is free"
        fi
    done
    return $any_in_use
}

cleanup_ports "${PORTS[@]}" || true

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set development environment
export NODE_ENV=development

echo "🎯 Starting development server..."
echo "   Frontend will be available at: http://localhost:5000"
echo "   API endpoints at: http://localhost:5000/api/*"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the development server
npm run dev