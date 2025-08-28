#!/bin/bash

# SIS API Test Runner
# This script runs the complete API test suite using Newman

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="Development"
COLLECTION="SIS_API_Collection.json"
VERBOSE=false
GENERATE_REPORT=true

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment to test (Development|Production)"
    echo "  -c, --collection FILE    Collection file to run"
    echo "  -v, --verbose           Enable verbose output"
    echo "  -r, --no-report         Skip report generation"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                      # Run with default settings"
    echo "  $0 -e Production                       # Run against production"
    echo "  $0 -c Student_Management.json          # Run specific collection"
    echo "  $0 -e Development -v                   # Run with verbose output"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -c|--collection)
            COLLECTION="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -r|--no-report)
            GENERATE_REPORT=false
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "Development" && "$ENVIRONMENT" != "Production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Must be either 'Development' or 'Production'"
    exit 1
fi

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    print_error "Newman is not installed. Please install it first:"
    print_error "npm install -g newman"
    print_error "npm install -g newman-reporter-html"
    exit 1
fi

# Create reports directory if it doesn't exist
mkdir -p reports
mkdir -p logs

# Set up file paths
ENVIRONMENT_FILE="environments/${ENVIRONMENT}.postman_environment.json"
COLLECTION_FILE="collections/${COLLECTION}"

# Check if files exist
if [[ ! -f "$COLLECTION_FILE" && ! -f "$COLLECTION" ]]; then
    print_error "Collection file not found: $COLLECTION"
    exit 1
fi

if [[ ! -f "$ENVIRONMENT_FILE" ]]; then
    print_error "Environment file not found: $ENVIRONMENT_FILE"
    exit 1
fi

# Use main collection if specific collection file not found in collections directory
if [[ ! -f "$COLLECTION_FILE" ]]; then
    COLLECTION_FILE="$COLLECTION"
fi

print_status "Starting SIS API Tests"
print_status "Collection: $COLLECTION_FILE"
print_status "Environment: $ENVIRONMENT_FILE"

# Build Newman command
NEWMAN_CMD="newman run \"$COLLECTION_FILE\""
NEWMAN_CMD="$NEWMAN_CMD -e \"$ENVIRONMENT_FILE\""

# Add reporters
if [[ "$GENERATE_REPORT" == true ]]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    REPORT_FILE="reports/api-test-report-${TIMESTAMP}.html"
    JSON_REPORT="reports/api-test-results-${TIMESTAMP}.json"
    
    NEWMAN_CMD="$NEWMAN_CMD --reporters cli,html,json"
    NEWMAN_CMD="$NEWMAN_CMD --reporter-html-export \"$REPORT_FILE\""
    NEWMAN_CMD="$NEWMAN_CMD --reporter-json-export \"$JSON_REPORT\""
    
    print_status "Report will be generated: $REPORT_FILE"
else
    NEWMAN_CMD="$NEWMAN_CMD --reporters cli"
fi

# Add verbose flag if requested
if [[ "$VERBOSE" == true ]]; then
    NEWMAN_CMD="$NEWMAN_CMD --verbose"
fi

# Add global variables
NEWMAN_CMD="$NEWMAN_CMD --global-var \"test_run_id=$(date +%s)\""
NEWMAN_CMD="$NEWMAN_CMD --global-var \"environment=$ENVIRONMENT\""

# Set timeout values
NEWMAN_CMD="$NEWMAN_CMD --timeout-request 30000"
NEWMAN_CMD="$NEWMAN_CMD --timeout-script 5000"

# Log file
LOG_FILE="logs/test-run-$(date +"%Y%m%d_%H%M%S").log"

print_status "Running tests..."

# Execute Newman command and capture output
if eval "$NEWMAN_CMD" 2>&1 | tee "$LOG_FILE"; then
    print_status "Tests completed successfully!"
    
    if [[ "$GENERATE_REPORT" == true ]]; then
        print_status "Test report generated: $REPORT_FILE"
        print_status "JSON results: $JSON_REPORT"
        
        # Try to open report in browser (if running in desktop environment)
        if command -v xdg-open &> /dev/null; then
            print_status "Opening report in browser..."
            xdg-open "$REPORT_FILE" &
        elif command -v open &> /dev/null; then
            print_status "Opening report in browser..."
            open "$REPORT_FILE" &
        fi
    fi
    
    print_status "Log file: $LOG_FILE"
    exit 0
else
    print_error "Tests failed!"
    print_error "Check log file for details: $LOG_FILE"
    exit 1
fi