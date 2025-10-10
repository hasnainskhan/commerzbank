#!/bin/bash

# Test script to check deployment environment

echo "🔍 Testing deployment environment..."

echo "Current user: $(whoami)"
echo "EUID: $EUID"
echo "UID: $UID"

if [[ $EUID -eq 0 ]]; then
    echo "❌ Running as root - this will cause issues"
    exit 1
else
    echo "✅ Running as regular user"
fi

if command -v sudo &> /dev/null; then
    echo "✅ sudo is available"
else
    echo "❌ sudo is not available"
    exit 1
fi

if command -v node &> /dev/null; then
    echo "✅ Node.js is installed: $(node --version)"
else
    echo "⚠️ Node.js is not installed"
fi

if command -v npm &> /dev/null; then
    echo "✅ npm is installed: $(npm --version)"
else
    echo "⚠️ npm is not installed"
fi

if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client is available"
else
    echo "⚠️ PostgreSQL client is not available"
fi

if command -v nginx &> /dev/null; then
    echo "✅ Nginx is installed"
else
    echo "⚠️ Nginx is not installed"
fi

echo ""
echo "🎯 Environment check complete!"
echo "If you see any ❌ or ⚠️ warnings, the deployment script will install missing components."
echo ""
echo "Ready to deploy? Run: ./deploy.sh"
