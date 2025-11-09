#!/bin/bash

# Script để test các Dashboard APIs
# Chạy: bash test-dashboard-apis.sh

echo "🧪 Testing Dashboard APIs..."
echo "================================"
echo ""

BASE_URL="http://localhost:4000/api/dashboard"

# Test API 1: Stats
echo "📊 Test 1: GET /api/dashboard/stats"
echo "-----------------------------------"
curl -s "$BASE_URL/stats" | jq '.'
echo ""
echo ""

# Test API 2: Inventory Stats
echo "📦 Test 2: GET /api/dashboard/inventory-stats"
echo "-----------------------------------"
curl -s "$BASE_URL/inventory-stats" | jq '.'
echo ""
echo ""

# Test API 3: Service Stats
echo "🚗 Test 3: GET /api/dashboard/service-stats"
echo "-----------------------------------"
curl -s "$BASE_URL/service-stats" | jq '.'
echo ""
echo ""

# Test Cache
echo "⚡ Test 4: Cache Performance"
echo "-----------------------------------"
echo "First call (Cache MISS):"
time curl -s "$BASE_URL/stats" > /dev/null
echo ""
echo "Second call (Cache HIT):"
time curl -s "$BASE_URL/stats" > /dev/null
echo ""
echo ""

echo "✅ All tests completed!"
echo "================================"

