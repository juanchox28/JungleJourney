#!/bin/bash

# Production Testing Script for JungleJourney
# This script runs comprehensive tests for production environment

set -e

echo "🧪 JungleJourney Production Testing Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROD_FRONTEND="https://ayahuascapuertonarino.com"
PROD_BACKEND="https://jungle-tours-backend.fly.dev"

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

# Test frontend accessibility
test_frontend_accessibility() {
    echo "🌐 Testing frontend accessibility..."

    # Test homepage
    if curl -s -I "$PROD_FRONTEND/" | head -n 1 | grep -q "200\|301\|302"; then
        print_status "Production frontend homepage accessible"
    else
        print_error "Production frontend homepage not accessible"
        return 1
    fi

    # Test admin page
    if curl -s -I "$PROD_FRONTEND/admin" | head -n 1 | grep -q "200\|301\|302"; then
        print_status "Production admin page accessible"
    else
        print_error "Production admin page not accessible"
        return 1
    fi

    # Test booking page
    if curl -s -I "$PROD_FRONTEND/hotel-booking" | head -n 1 | grep -q "200\|301\|302"; then
        print_status "Production hotel booking page accessible"
    else
        print_error "Production hotel booking page not accessible"
        return 1
    fi

    return 0
}

# Test backend API
test_backend_api() {
    echo "🔗 Testing backend API..."

    # Test version endpoint
    if curl -s "$PROD_BACKEND/api/version" | grep -q "version"; then
        print_status "Production API version endpoint working"
    else
        print_error "Production API version endpoint failed"
        return 1
    fi

    # Test tours endpoint
    if curl -s "$PROD_BACKEND/api/tours" | grep -q "id\|\\[\\]"; then
        print_status "Production tours API endpoint working"
    else
        print_error "Production tours API endpoint failed"
        return 1
    fi

    # Test accommodations endpoint
    if curl -s "$PROD_BACKEND/api/accommodations" | grep -q "id\|\\[\\]"; then
        print_status "Production accommodations API endpoint working"
    else
        print_error "Production accommodations API endpoint failed"
        return 1
    fi

    return 0
}

# Test admin authentication
test_admin_auth() {
    echo "🔐 Testing admin authentication..."

    # Test admin login (should return 401/403 without auth)
    response=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
        "$PROD_BACKEND/api/admin/bookings" \
        -H "Authorization: Bearer admin123")

    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        print_status "Production admin authentication properly protected"
    elif [ "$response" = "200" ]; then
        print_warning "Admin access working (verify this is expected in production)"
    else
        print_error "Production admin endpoint returned unexpected status: $response"
        return 1
    fi

    return 0
}

# Test booking creation (with validation)
test_booking_creation() {
    echo "📝 Testing booking creation endpoint..."

    # Create a test booking payload (using cash payment to avoid real charges)
    booking_data='{
        "guestName": "Production Test User",
        "guestEmail": "test@junglejourney.com",
        "guestCount": 2,
        "checkInDate": "2024-12-25",
        "checkOutDate": "2024-12-27",
        "accommodationId": "test-room",
        "totalPrice": 1000,
        "paymentMethod": "cash"
    }'

    # Test the endpoint
    response=$(curl -s -X POST \
        "$PROD_BACKEND/api/create-accommodation-booking" \
        -H "Content-Type: application/json" \
        -d "$booking_data")

    if echo "$response" | grep -q '"ok":true\|"error"'; then
        print_status "Production booking creation endpoint responding"
    else
        print_error "Production booking creation endpoint not responding properly"
        echo "   Response: $response"
        return 1
    fi

    return 0
}

# Test CORS configuration
test_cors() {
    echo "🔄 Testing CORS configuration..."

    # Test preflight request
    cors_response=$(curl -s -I -X OPTIONS \
        "$PROD_BACKEND/api/tours" \
        -H "Origin: $PROD_FRONTEND" \
        -H "Access-Control-Request-Method: GET")

    if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
        print_status "CORS headers properly configured"
    else
        print_warning "CORS headers not detected (may be okay if handled differently)"
    fi

    return 0
}

# Test SSL/HTTPS
test_ssl() {
    echo "🔒 Testing SSL/HTTPS configuration..."

    # Test HTTPS certificate
    if curl -s -I "$PROD_FRONTEND/" | head -n 1 | grep -q "200\|301\|302"; then
        print_status "HTTPS working on frontend"
    else
        print_error "HTTPS not working on frontend"
        return 1
    fi

    # Test backend HTTPS
    if curl -s -I "$PROD_BACKEND/api/version" | head -n 1 | grep -q "200\|301\|302"; then
        print_status "HTTPS working on backend"
    else
        print_error "HTTPS not working on backend"
        return 1
    fi

    return 0
}

# Test performance (basic)
test_performance() {
    echo "⚡ Testing basic performance..."

    # Test response time for homepage
    start_time=$(date +%s%3N)
    curl -s "$PROD_FRONTEND/" > /dev/null
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))

    if [ $response_time -lt 5000 ]; then
        print_status "Frontend response time: ${response_time}ms"
    else
        print_warning "Frontend response time slow: ${response_time}ms"
    fi

    # Test API response time
    start_time=$(date +%s%3N)
    curl -s "$PROD_BACKEND/api/version" > /dev/null
    end_time=$(date +%s%3N)
    api_time=$((end_time - start_time))

    if [ $api_time -lt 2000 ]; then
        print_status "API response time: ${api_time}ms"
    else
        print_warning "API response time slow: ${api_time}ms"
    fi

    return 0
}

# Main test execution
main() {
    local failed_tests=0

    echo "Starting production testing suite..."
    echo "Frontend: $PROD_FRONTEND"
    echo "Backend: $PROD_BACKEND"
    echo ""

    # Run all tests
    test_ssl || ((failed_tests++))
    test_frontend_accessibility || ((failed_tests++))
    test_backend_api || ((failed_tests++))
    test_admin_auth || ((failed_tests++))
    test_cors || ((failed_tests++))
    test_booking_creation || ((failed_tests++))
    test_performance || ((failed_tests++))

    echo ""
    echo "========================================"

    if [ $failed_tests -eq 0 ]; then
        print_status "All production tests passed! 🎉"
        echo ""
        echo "Production environment is healthy!"
        echo ""
        echo "Manual testing checklist:"
        echo "1. Admin login: $PROD_FRONTEND/admin"
        echo "2. Booking flow: $PROD_FRONTEND/hotel-booking"
        echo "3. Check email confirmations are working"
        echo "4. Test payment flow (use small amounts)"
        exit 0
    else
        print_error "$failed_tests test(s) failed"
        echo ""
        echo "Production issues detected. Check:"
        echo "1. Fly.io logs: fly logs --app your-app-name"
        echo "2. GitHub Actions deployment status"
        echo "3. Environment variables in Fly.io secrets"
        echo "4. Hostinger FTP deployment"
        exit 1
    fi
}

# Run main function
main