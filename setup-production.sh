#!/bin/bash

# Production Environment Setup Script
# This script helps configure production secrets for Fly.io

set -e

echo "🚀 JungleJourney Production Setup"
echo "=================================="

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly.io CLI not found. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in to Fly.io
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run:"
    echo "   fly auth login"
    exit 1
fi

echo "✅ Fly.io CLI ready"

# Get Fly.io app name
read -p "Enter your Fly.io app name (e.g., jungle-tours-backend): " FLY_APP_NAME

if [ -z "$FLY_APP_NAME" ]; then
    echo "❌ App name is required"
    exit 1
fi

# Verify app exists
if ! fly apps list | grep -q "$FLY_APP_NAME"; then
    echo "❌ Fly.io app '$FLY_APP_NAME' not found. Please create it first:"
    echo "   fly apps create $FLY_APP_NAME"
    exit 1
fi

echo "✅ Fly.io app '$FLY_APP_NAME' found"

# Database URL
echo ""
echo "📊 Database Configuration"
read -p "Enter production DATABASE_URL: " DB_URL
if [ -n "$DB_URL" ]; then
    fly secrets set DATABASE_URL="$DB_URL" --app "$FLY_APP_NAME"
    echo "✅ DATABASE_URL set"
fi

# Wompi Configuration
echo ""
echo "💳 Wompi Payment Gateway Configuration"
read -p "Enter production WOMPI_PUBLIC_KEY: " WOMPI_PUBLIC
if [ -n "$WOMPI_PUBLIC" ]; then
    fly secrets set WOMPI_PUBLIC_KEY="$WOMPI_PUBLIC" --app "$FLY_APP_NAME"
    echo "✅ WOMPI_PUBLIC_KEY set"
fi

read -p "Enter production WOMPI_PRIVATE_KEY: " WOMPI_PRIVATE
if [ -n "$WOMPI_PRIVATE" ]; then
    fly secrets set WOMPI_PRIVATE_KEY="$WOMPI_PRIVATE" --app "$FLY_APP_NAME"
    fly secrets set WOMPI_BASE="https://production.wompi.co/v1" --app "$FLY_APP_NAME"
    echo "✅ WOMPI_PRIVATE_KEY and WOMPI_BASE set"
fi

# Email Configuration
echo ""
echo "📧 Email Configuration"
read -p "Enter EMAIL_USER (default: paraisoayahuasca@gmail.com): " EMAIL_USER
EMAIL_USER=${EMAIL_USER:-paraisoayahuasca@gmail.com}
fly secrets set EMAIL_USER="$EMAIL_USER" --app "$FLY_APP_NAME"

read -p "Enter EMAIL_PASS: " EMAIL_PASS
if [ -n "$EMAIL_PASS" ]; then
    fly secrets set EMAIL_PASS="$EMAIL_PASS" --app "$FLY_APP_NAME"
    echo "✅ Email credentials set"
fi

# Frontend URL
echo ""
echo "🌐 Frontend Configuration"
read -p "Enter FRONTEND_URL (default: https://ayahuascapuertonarino.com): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-https://ayahuascapuertonarino.com}
fly secrets set FRONTEND_URL="$FRONTEND_URL" --app "$FLY_APP_NAME"
echo "✅ FRONTEND_URL set"

# Admin Password
echo ""
echo "🔐 Admin Configuration"
echo "⚠️  WARNING: Change this from the default password!"
read -p "Enter ADMIN_PASSWORD (default: admin123): " ADMIN_PASS
ADMIN_PASS=${ADMIN_PASS:-admin123}
fly secrets set ADMIN_PASSWORD="$ADMIN_PASS" --app "$FLY_APP_NAME"
if [ "$ADMIN_PASS" = "admin123" ]; then
    echo "⚠️  WARNING: Using default admin password. Please change it immediately!"
fi

echo ""
echo "✅ Production secrets configured successfully!"
echo ""
echo "📋 Summary of secrets set:"
fly secrets list --app "$FLY_APP_NAME"

echo ""
echo "🚀 Ready to deploy:"
echo "   fly deploy --app $FLY_APP_NAME"
echo ""
echo "📖 Next steps:"
echo "1. Update client/.env.production with correct VITE_API_BASE_URL"
echo "2. Test locally: ./run-dev.sh"
echo "3. Deploy: git push origin main (or fly deploy)"
echo "4. Test production: https://$FLY_APP_NAME.fly.dev"