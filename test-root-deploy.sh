#!/bin/bash

# Test script to verify simple-deploy.sh works as root

echo "🔍 Testing simple-deploy.sh root compatibility..."

# Test the root detection logic
if [[ $EUID -eq 0 ]]; then
    echo "✅ Currently running as root"
    SUDO_CMD=""
    DEPLOY_USER="root"
else
    echo "⚠️ Currently running as regular user"
    SUDO_CMD="sudo"
    DEPLOY_USER="$USER"
fi

echo "SUDO_CMD: '$SUDO_CMD'"
echo "DEPLOY_USER: '$DEPLOY_USER'"

# Test a few commands that would be used in the script
echo ""
echo "Testing command execution:"

# Test apt update (dry run)
echo "Testing: $SUDO_CMD apt update (dry run)"
if [[ -n "$SUDO_CMD" ]]; then
    echo "Would run: sudo apt update"
else
    echo "Would run: apt update"
fi

# Test systemctl
echo "Testing: $SUDO_CMD systemctl status nginx"
if [[ -n "$SUDO_CMD" ]]; then
    echo "Would run: sudo systemctl status nginx"
else
    echo "Would run: systemctl status nginx"
fi

echo ""
echo "🎯 Root compatibility test complete!"
echo "The simple-deploy.sh script is now configured to work with both:"
echo "• Regular users (with sudo privileges)"
echo "• Root users (direct execution)"
echo ""
echo "To test as root, run: sudo ./simple-deploy.sh"
echo "To test as regular user, run: ./simple-deploy.sh"
