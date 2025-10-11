#!/bin/bash

echo "📱 Mobile Responsiveness Test for Commerzbank App"
echo "=================================================="
echo ""

# Test 1: Check if server is running
echo "1. Testing server availability..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Server is running on http://localhost:3001"
else
    echo "❌ Server is not running"
    exit 1
fi

# Test 2: Check viewport meta tag
echo ""
echo "2. Checking mobile viewport configuration..."
viewport=$(curl -s http://localhost:3001 | grep -o 'viewport[^>]*')
if [[ $viewport == *"width=device-width"* ]]; then
    echo "✅ Viewport meta tag is properly configured"
    echo "   $viewport"
else
    echo "❌ Viewport meta tag is missing or incorrect"
fi

# Test 3: Test API endpoints
echo ""
echo "3. Testing API endpoints..."
echo "   Testing /api/health..."
if curl -s http://localhost:3001/api/health | grep -q "OK"; then
    echo "   ✅ Health endpoint working"
else
    echo "   ❌ Health endpoint failed"
fi

echo "   Testing /api/info..."
response=$(curl -s -X POST http://localhost:3001/api/info \
    -H "Content-Type: application/json" \
    -d '{"xname1":"Mobile","xname2":"Test","xdob":"01.01.1990","xtel":"123456","sessionId":"mobile-test-session"}')
if echo "$response" | grep -q "success"; then
    echo "   ✅ Info endpoint working"
else
    echo "   ❌ Info endpoint failed"
fi

# Test 4: Check CSS for mobile styles
echo ""
echo "4. Checking for mobile CSS..."
css_url=$(curl -s http://localhost:3001 | grep -o 'href="[^"]*\.css"' | head -1 | sed 's/href="//;s/"//')
if [ ! -z "$css_url" ]; then
    echo "   ✅ CSS file found: $css_url"
    # Check if CSS contains mobile-friendly styles
    if curl -s "http://localhost:3001$css_url" | grep -q "@media"; then
        echo "   ✅ CSS contains media queries for responsive design"
    else
        echo "   ⚠️  CSS may not contain responsive media queries"
    fi
else
    echo "   ❌ No CSS file found"
fi

echo ""
echo "🌐 Access URLs:"
echo "   Local: http://localhost:3001"
echo "   Network: http://192.168.18.73:3001"
echo ""
echo "📱 Mobile Testing Instructions:"
echo "   1. Open browser developer tools (F12)"
echo "   2. Click mobile device icon (📱)"
echo "   3. Select iPhone/Samsung device"
echo "   4. Test all pages and functionality"
echo ""
echo "📲 Real Device Testing:"
echo "   1. Connect phone to same WiFi"
echo "   2. Open browser on phone"
echo "   3. Go to: http://192.168.18.73:3001"
echo "   4. Test complete user flow"
echo ""
echo "✅ Mobile test completed!"

