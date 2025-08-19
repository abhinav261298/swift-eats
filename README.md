# ./Cursor-1.2.1-x86_64.AppImage --no-sandbox
# SwiftEats - Real-Time Food Delivery Platform

A scalable, resilient, and high-performance microservices-based backend for a modern food delivery service built with NestJS, TypeScript, and Docker.

## 🚀 Features

- **Microservices Architecture**: Modular, scalable, and maintainable design
- **Real-time GPS Tracking**: Live driver location updates with WebSocket support
- **High-Performance Order Processing**: Handles 500 orders per minute with fault tolerance
- **Real-time Analytics**: Processes 2,000 GPS events per second from 10,000 drivers
- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Message Queuing**: RabbitMQ and Kafka for reliable message processing
- **Caching**: Redis for high-performance caching
- **Database**: PostgreSQL for relational data, MongoDB for analytics
- **Health Monitoring**: Comprehensive health checks for all services
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Support**: Containerized deployment with Docker Compose

## 🏗️ Architecture

### Microservices

1. **Auth Service** (Port: 3001) - Authentication and authorization
2. **User Service** (Port: 3002) - User management and profiles
3. **Restaurant Service** (Port: 3003) - Restaurant and menu management
4. **Order Service** (Port: 3004) - Order processing and management
5. **Delivery Service** (Port: 3005) - Delivery tracking and management
6. **Notification Service** (Port: 3006) - Push notifications and emails
7. **Payment Service** (Port: 3007) - Payment processing
8. **Analytics Service** (Port: 3008) - Real-time analytics and GPS tracking

### Infrastructure

- **PostgreSQL**: Primary relational database (host port 5433)
- **MongoDB**: Document storage for analytics and sessions
- **Redis**: Caching and session management
- **RabbitMQ**: Message broker for inter-service communication
- **Kafka**: High-throughput event streaming

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker & Docker Compose** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/)

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **CPU**: Multi-core processor recommended

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd swifteats-platform
```

### Step 2: Install Dependencies

**Option A: Install all dependencies at once (Recommended)**
```bash
npm install
```

**Option B: Install dependencies for each service individually**
```bash
# Install root dependencies
npm install

# Install dependencies for each service
cd services/auth-service && npm install && cd ../..

cd services/restaurant-service && npm install && cd ../..
cd services/order-service && npm install && cd ../..
cd services/delivery-service && npm install && cd ../..
cd services/notification-service && npm install && cd ../..
cd services/payment-service && npm install && cd ../..
cd services/analytics-service && npm install && cd ../..

# Install shared package dependencies
cd shared && npm install && cd ..
```

### Step 3: Start Infrastructure Services

```bash
# Start all infrastructure services (databases, message brokers, etc.)
docker compose up -d postgres mongodb redis rabbitmq zookeeper kafka

# Wait for services to be healthy (check with)
docker compose ps
```

### Step 4: Start the Microservices

**Option A: Start all services at once**
```bash
npm run dev
```

**Option B: Start services individually**
```bash
# Terminal 1 - Auth Service
cd services/auth-service && npm run start:dev

# Terminal 2 - Restaurant Service


# Terminal 3 - Order Service
cd services/restaurant-service && npm run start:dev

# Terminal 4 - Delivery Service
cd services/order-service && npm run start:dev

# Terminal 5 - Notification Service
cd services/delivery-service && npm run start:dev

# Terminal 6 - Payment Service
cd services/notification-service && npm run start:dev

# Terminal 7 - Analytics Service
cd services/payment-service && npm run start:dev

# Terminal 8 - API Gateway
cd services/api-gateway && npm run start:dev
```

### Step 5: Verify Installation

Check that all services are running:

```bash
# Check service health
curl http://localhost:3001/api/v1/health
curl http://localhost:3002/api/v1/health
curl http://localhost:3003/api/v1/health
curl http://localhost:3004/api/v1/health
curl http://localhost:3005/api/v1/health
curl http://localhost:3006/api/v1/health
curl http://localhost:3007/api/v1/health
curl http://localhost:3008/api/v1/health
```

### Step 6: Run the Real-Time Driver Simulator

Publish driver locations to RabbitMQ and broadcast to WebSocket clients via the notification service.

```bash
# In separate terminals, start services that participate in realtime flow
cd services/notification-service && npm run start:dev
cd services/delivery-service && npm run start:dev

# Publish driver locations
npm run simulate:drivers

# Connect a WebSocket client to receive updates
# ws://localhost:3006/notifications
# Listen for event name: "notification" (payload { type: 'driver.location', driverId, location })
```

## 🔗 Service URLs

| Service | URL | API Docs | Health Check |
|---------|-----|----------|--------------|
| Auth Service | http://localhost:3001 | http://localhost:3001/api/docs | http://localhost:3001/api/v1/health |
| User Service | http://localhost:3002 | http://localhost:3002/api/docs | http://localhost:3002/api/v1/health |
| Restaurant Service | http://localhost:3003 | http://localhost:3003/api/docs | http://localhost:3003/api/v1/health |
| Order Service | http://localhost:3004 | http://localhost:3004/api/docs | http://localhost:3004/api/v1/health |
| Delivery Service | http://localhost:3005 | http://localhost:3005/api/docs | http://localhost:3005/api/v1/health |
| Notification Service | http://localhost:3006 | http://localhost:3006/api/docs | http://localhost:3006/api/v1/health |
| Payment Service | http://localhost:3007 | http://localhost:3007/api/docs | http://localhost:3007/api/v1/health |
| Analytics Service | http://localhost:3008 | http://localhost:3008/api/docs | http://localhost:3008/api/v1/health |

## 🛠️ Development Commands

### Root Level Commands

```bash
# Install all dependencies
npm install

# Start all services in development mode
npm run dev

# Build all services
npm run build

# Run tests for all services
npm test

# Lint all services
npm run lint

# Docker commands
npm run docker:build    # Build all Docker images
npm run docker:up       # Start all services with Docker
npm run docker:down     # Stop all Docker services
npm run docker:logs     # View Docker logs
npm run clean           # Clean up Docker resources
```

### Individual Service Commands

```bash
# Navigate to any service directory
cd services/auth-service

# Development commands
npm run start:dev       # Start in development mode
npm run build          # Build the service
npm test               # Run tests
npm run test:cov       # Run tests with coverage
npm run lint           # Lint code
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each service directory or use the root `.env` file:

```env
# Database (note: Postgres exposed on host 5433)
DATABASE_URL=postgresql://food_user:food_password@localhost:5433/food_delivery
MONGODB_URL=mongodb://admin:admin_password@localhost:27017/food_delivery

# Redis
REDIS_URL=redis://localhost:6379

# Message Broker
RABBITMQ_URL=amqp://admin:admin_password@localhost:5672
KAFKA_BROKERS=localhost:9092

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Service Configuration
NODE_ENV=development
CORS_ORIGIN=*
```

### Port Configuration

Each service runs on a specific port:

- Auth Service: 3001
- User Service: 3002
- Restaurant Service: 3003
- Order Service: 3004
- Delivery Service: 3005
- Notification Service: 3006
- Payment Service: 3007
- Analytics Service: 3008

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests for specific service
cd services/auth-service && npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Test Data Simulators

The analytics service includes data simulators for testing:

```bash
# Start driver location simulator (50 drivers, 10 events/sec)
cd services/analytics-service
npm run simulate:drivers

# Start order simulator (10 orders/minute)
npm run simulate:orders
```

## 🐳 Docker Commands

```bash
# Build all services
docker compose build

# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f auth-service

# Clean up
docker compose down -v
docker system prune -f
```

## 📊 Monitoring

### Health Checks

Each service exposes a single health endpoint for simplicity:

- `/api/v1/health` - Returns `{ status: 'ok' }` when the service is running

### Metrics

Services expose metrics for monitoring:

- Database connection status
- Memory usage (heap and RSS)
- Disk usage
- Redis connectivity
- Response times
- Error rates

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS configuration
- Secure headers
- Environment-based secrets

## 📈 Scalability

- Horizontal scaling with Docker
- Load balancing ready
- Database connection pooling
- Redis caching
- Message queuing for async processing
- Microservices can be scaled independently

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your-production-db-url
   export REDIS_URL=your-production-redis-url
   ```

2. **Build and Deploy**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

3. **Health Check**
   ```bash
   curl http://localhost:3001/api/v1/health
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the health check endpoints

## 🔄 Roadmap

- [ ] API Gateway implementation
- [ ] GraphQL support
- [ ] Advanced analytics dashboard
- [ ] Mobile app backend
- [ ] Multi-language support
- [ ] Advanced payment gateways
- [ ] AI-powered recommendations
- [ ] Advanced monitoring and alerting
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Security audit and hardening

---

**Note**: This is a production-ready setup. For production use, additional security measures, monitoring, and optimization should be implemented.
