#!/bin/bash

# Portfolio Website Deployment Script
# Usage: ./deploy.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-development}
AWS_REGION="us-east-1"
S3_BUCKET="jackvanzeeland-portfolio"
CLOUDFRONT_DISTRIBUTION_ID="E2LPQ1BMRDTQER"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    log_info "Dependencies check passed."
}

# Build the project
build_project() {
    log_info "Building the project..."
    
    # Clean previous build
    if [ -d "dist" ]; then
        rm -rf dist
        log_info "Cleaned previous build."
    fi
    
    # Install dependencies
    npm ci
    
    # Build the project
    npm run build
    
    if [ ! -d "dist" ]; then
        log_error "Build failed - dist directory not found."
        exit 1
    fi
    
    log_info "Build completed successfully."
}

# Test the build
test_project() {
    log_info "Running tests..."
    
    if npm run test 2>/dev/null; then
        log_info "All tests passed."
    else
        log_warn "Tests failed or no tests configured. Continuing with deployment..."
    fi
}

# Deploy to S3
deploy_to_s3() {
    log_info "Deploying to S3 bucket: $S3_BUCKET"
    
    # Check if bucket exists
    if ! aws s3 ls "$S3_BUCKET" &> /dev/null; then
        log_error "S3 bucket $S3_BUCKET does not exist or you don't have access to it."
        exit 1
    fi
    
    # Sync files to S3
    aws s3 sync ./dist/ "s3://$S3_BUCKET/" --delete --exclude "*.DS_Store" --exclude "Thumbs.db"
    
    # Ensure index.html is properly uploaded
    aws s3 cp ./dist/index.html "s3://$S3_BUCKET/"
    
    log_info "Files synced to S3 successfully."
}

# Invalidate CloudFront cache
invalidate_cloudfront() {
    if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        log_warn "CloudFront Distribution ID not set. Skipping cache invalidation."
        return
    fi
    
    log_info "Invalidating CloudFront cache for distribution: $CLOUDFRONT_DISTRIBUTION_ID"
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    log_info "Invalidation created with ID: $INVALIDATION_ID"
    
    # Wait for invalidation to complete (optional)
    log_info "Waiting for invalidation to complete..."
    aws cloudfront wait invalidation-completed \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --id "$INVALIDATION_ID"
    
    log_info "CloudFront cache invalidated successfully."
}

# Display deployment summary
show_summary() {
    log_info "Deployment Summary:"
    echo "  Environment: $ENVIRONMENT"
    echo "  S3 Bucket: $S3_BUCKET"
    echo "  Region: $AWS_REGION"
    
    if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        echo "  CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
    fi
    
    echo "  Build Size: $(du -sh dist | cut -f1)"
    echo "  Files Deployed: $(find dist -type f | wc -l)"
    
    log_info "Deployment completed successfully!"
    log_info "Website should be available at: https://$(aws s3api get-bucket-location --bucket $S3_BUCKET --query 'LocationConstraint' --output text || echo 'us-east-1').s3-website-$AWS_REGION.amazonaws.com"
}

# Main execution
main() {
    log_info "Starting portfolio website deployment for environment: $ENVIRONMENT"
    
    check_dependencies
    build_project
    test_project
    deploy_to_s3
    invalidate_cloudfront
    show_summary
}

# Handle script interruption
trap 'log_error "Deployment interrupted."; exit 1' INT

# Run main function
main "$@"