#!/bin/bash

# Food Delivery Platform Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Food Delivery Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js version: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "npm version: $(npm --version)"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker"
        exit 1
    fi
    
    print_success "Docker version: $(docker --version)"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose"
        exit 1
    fi
    
    print_success "Docker Compose version: $(docker-compose --version)"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install shared library dependencies
    cd shared
    npm install
    npm run build
    cd ..
    
    # Install service dependencies
    for service in services/*; do
        if [ -d "$service" ]; then
            print_status "Installing dependencies for $(basename $service)..."
            cd "$service"
            npm install
            cd ../..
        fi
    done
    
    print_success "All dependencies installed"
}

# Start infrastructure
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    # Start databases and message brokers
    docker-compose up -d postgres mongodb redis rabbitmq kafka zookeeper
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Infrastructure services started successfully"
    else
        print_error "Failed to start infrastructure services"
        exit 1
    fi
}

# Build services
build_services() {
    print_status "Building services..."
    
    # Build shared library
    cd shared
    npm run build
    cd ..
    
    # Build all services
    for service in services/*; do
        if [ -d "$service" ]; then
            print_status "Building $(basename $service)..."
            cd "$service"
            npm run build
            cd ../..
        fi
    done
    
    print_success "All services built successfully"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Create .env files for each service
    for service in services/*; do
        if [ -d "$service" ]; then
            SERVICE_NAME=$(basename $service)
            ENV_FILE="$service/.env"
            
            if [ ! -f "$ENV_FILE" ]; then
                cat > "$ENV_FILE" << EOF
# $SERVICE_NAME Environment Configuration
NODE_ENV=development
PORT=$(echo $SERVICE_NAME | grep -oE '[0-9]+' | head -n1)

# Database
DATABASE_URL=postgresql://food_user:food_password@localhost:5433/food_delivery
MONGODB_URL=mongodb://admin:admin_password@localhost:27017/food_delivery

# Redis
REDIS_URL=redis://localhost:6379

# Message Broker
RABBITMQ_URL=amqp://admin:admin_password@localhost:5672

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*
EOF
                print_success "Created .env file for $SERVICE_NAME"
            else
                print_warning ".env file already exists for $SERVICE_NAME"
            fi
        fi
    done
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Wait a bit more for services to be fully ready
    sleep 10
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U food_user -d food_delivery > /dev/null 2>&1; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL is not ready"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is ready"
    else
        print_error "Redis is not ready"
    fi
    
    # Check RabbitMQ
    if docker-compose exec -T rabbitmq rabbitmq-diagnostics ping > /dev/null 2>&1; then
        print_success "RabbitMQ is ready"
    else
        print_error "RabbitMQ is not ready"
    fi
}

# Main setup function
main() {
    echo "🍕 Food Delivery Platform Setup"
    echo "================================"
    
    check_prerequisites
    install_dependencies
    create_env_files
    start_infrastructure
    build_services
    run_health_checks
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start the services: npm run dev"
    echo "2. Access API documentation: http://localhost:3001/api/docs"
    echo "3. Check health status: http://localhost:3001/health"
    echo ""
    echo "Services will be available at:"
    echo "- Auth Service: http://localhost:3001"
    echo "- User Service: http://localhost:3002"
    echo "- Restaurant Service: http://localhost:3003"
    echo "- Order Service: http://localhost:3004"
    echo "- Delivery Service: http://localhost:3005"
    echo "- Notification Service: http://localhost:3006"
    echo "- Payment Service: http://localhost:3007"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
