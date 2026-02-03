#!/bin/bash

# Kingsbal API Vercel Deployment Verification Script
# Run this script to verify all routes are working

API_URL="${1:-http://localhost:5000}"
TOKEN=""

echo "🔍 Kingsbal API Route Verification"
echo "=================================="
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local expected_status=$3
  local data=$4
  
  echo -n "Testing: $method $endpoint ... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$data" 2>/dev/null)
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" == "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
    ((FAILED++))
  fi
}

# ===== PUBLIC HEALTH CHECKS =====
echo "📊 PUBLIC HEALTH CHECKS"
echo "---------------------"
test_endpoint "GET" "/" "200"
test_endpoint "GET" "/health" "200"
test_endpoint "GET" "/api/status" "200"
echo ""

# ===== PUBLIC ENDPOINTS =====
echo "🌐 PUBLIC ENDPOINTS"
echo "------------------"
test_endpoint "GET" "/api/public/nursing-questions" "200"
test_endpoint "GET" "/api/questions/all" "200"
test_endpoint "GET" "/api/questions/test" "200"
test_endpoint "GET" "/api/curriculum/topics" "200"
test_endpoint "GET" "/api/curriculum/category/Clinical" "200"
echo ""

# ===== AUTHENTICATION =====
echo "🔐 AUTHENTICATION"
echo "---------------"

# Test login to get token
echo -n "Testing: POST /api/auth/login ... "
login_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@kingsbal.com","password":"password123"}' 2>/dev/null)

http_code=$(echo "$login_response" | tail -n1)
body=$(echo "$login_response" | sed '$d')

if [ "$http_code" == "200" ]; then
  TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  if [ -z "$TOKEN" ]; then
    TOKEN=$(echo "$body" | grep -o 'Bearer [^ "]*' | awk '{print $2}')
  fi
  echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code, Token: ${TOKEN:0:10}...)"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (Expected 200, got $http_code)"
  ((FAILED++))
fi
echo ""

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠ WARNING:${NC} Could not obtain token. Skipping protected endpoints."
  echo "Please check /api/auth/login response."
else
  # ===== PROTECTED ENDPOINTS =====
  echo "🔒 PROTECTED ENDPOINTS"
  echo "--------------------"
  test_endpoint "GET" "/api/auth/me" "200"
  test_endpoint "GET" "/api/auth/test" "200"
  test_endpoint "GET" "/api/users/profile" "200"
  test_endpoint "GET" "/api/users/exam-history" "200"
  test_endpoint "GET" "/api/payments/test" "200"
  test_endpoint "GET" "/api/exams/test" "200"
  test_endpoint "GET" "/api/admin/test" "200"
  
  # Test with data
  echo ""
  echo "📨 POST ENDPOINTS"
  echo "---------------"
  test_endpoint "POST" "/api/exams/cbt/start" "200" '{"topic_id":"anatomy","limit":10}'
  test_endpoint "POST" "/api/payments/initiate" "200" '{"amount":5000}'
  echo ""
fi

# ===== SUMMARY =====
echo "📈 TEST SUMMARY"
echo "==============="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed.${NC}"
  exit 1
fi
