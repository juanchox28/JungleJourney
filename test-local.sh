#!/bin/bash

# Local Testing Script for JungleJourney
# This script runs comprehensive tests for local development

set -e

echo "🧪 JungleJourney Local Testing Suite"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if server is running
check_server() {
    echo "🔍 Checking if development server is running..."
    if curl -s http://localhost:5000/api/version > /dev/null 2>&1; then
        print_status "Server is running on port 5000"
        return 0
    else
        print_error "Server is not running on port 5000"
        echo "   Start it with: ./run-dev.sh"
        return 1
    fi
}

# Test API endpoints
test_api_endpoints() {
    echo "🔗 Testing API endpoints..."

    # Test version endpoint
    if curl -s http://localhost:5000/api/version | grep -q "version"; then
        print_status "API version endpoint working"
    else
        print_error "API version endpoint failed"
        return 1
    fi

    # Test tours endpoint
    if curl -s http://localhost:5000/api/tours | grep -q "id"; then
        print_status "Tours API endpoint working"
    else
        print_error "Tours API endpoint failed"
        return 1
    fi

    # Test accommodations endpoint
    if curl -s http://localhost:5000/api/accommodations | grep -q "id"; then
        print_status "Accommodations API endpoint working"
    else
        print_error "Accommodations API endpoint failed"
        return 1
    fi

    return 0
}

# Test admin access
test_admin_access() {
    echo "🔐 Testing admin access..."

    # Test admin login (this will fail without proper auth, but should return 401/403)
    response=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
        http://localhost:5000/api/admin/bookings \
        -H "Authorization: Bearer admin123")

    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        print_status "Admin authentication properly protected"
    elif [ "$response" = "200" ]; then
        print_status "Admin access working (check if this is expected)"
    else
        print_error "Admin endpoint returned unexpected status: $response"
        return 1
    fi

    return 0
}

# Test frontend accessibility
test_frontend() {
    echo "🌐 Testing frontend accessibility..."

    # Test homepage
    if curl -s -I http://localhost:5000/ | head -n 1 | grep -q "200\|301\|302"; then
        print_status "Frontend homepage accessible"
    else
        print_error "Frontend homepage not accessible"
        return 1
    fi

    # Test admin page (should load, even if login required)
    if curl -s -I http://localhost:5000/admin | head -n 1 | grep -q "200\|301\|302"; then
        print_status "Admin page accessible"
    else
        print_error "Admin page not accessible"
        return 1
    fi

    # Test booking page
    if curl -s -I http://localhost:5000/hotel-booking | head -n 1 | grep -q "200\|301\|302"; then
        print_status "Hotel booking page accessible"
    else
        print_error "Hotel booking page not accessible"
        return 1
    fi

    return 0
}

# Test booking creation (mock test)
test_booking_creation() {
    echo "📝 Testing booking creation endpoint..."

    # Create a test booking payload
    booking_data='{
        "guestName": "Test User",
        "guestEmail": "test@example.com",
        "guestCount": 2,
        "checkInDate": "2024-12-25",
        "checkOutDate": "2024-12-27",
        "accommodationId": "test-room",
        "totalPrice": 100000,
        "paymentMethod": "cash"
    }'

    # Test the endpoint (should return proper response or validation error)
    response=$(curl -s -X POST \
        http://localhost:5000/api/create-accommodation-booking \
        -H "Content-Type: application/json" \
        -d "$booking_data")

    if echo "$response" | grep -q "ok\|error"; then
        print_status "Booking creation endpoint responding"
    else
        print_error "Booking creation endpoint not responding properly"
        echo "   Response: $response"
        return 1
    fi

    return 0
}

# Test environment variables
test_env_vars() {
    echo "🔧 Testing environment variables..."

    # Check if .env.development exists
    if [ -f "server/.env.development" ]; then
        print_status "server/.env.development exists"
    else
        print_error "server/.env.development missing"
        return 1
    fi

    if [ -f "client/.env.development" ]; then
        print_status "client/.env.development exists"
    else
        print_error "client/.env.development missing"
        return 1
    fi

    return 0
}

# Main test execution
main() {
    local failed_tests=0

    echo "Starting local testing suite..."
    echo ""

    # Run all tests
    test_env_vars || ((failed_tests++))
    check_server || ((failed_tests++))
    test_api_endpoints || ((failed_tests++))
    test_admin_access || ((failed_tests++))
    test_frontend || ((failed_tests++))
    test_booking_creation || ((failed_tests++))

    echo ""
    echo "===================================="

    if [ $failed_tests -eq 0 ]; then
        print_status "All tests passed! 🎉"
        echo ""
        echo "Next steps:"
        echo "1. Test admin login manually: http://localhost:5000/admin (password: admin123)"
        echo "2. Test booking flow: http://localhost:5000/hotel-booking"
        echo "3. Run: npm run dev:debug for verbose logging"
        exit 0
    else
        print_error "$failed_tests test(s) failed"
        echo ""
        echo "Troubleshooting:"
        echo "1. Ensure server is running: ./run-dev.sh"
        echo "2. Check environment files exist and are valid"
        echo "3. Review server logs for errors"
        echo "4. Check CORS settings in server/index.ts"
        exit 1
    fi
}

# Run main function
main