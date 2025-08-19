# SwiftEats Project Structure

This document explains the structure of the SwiftEats food delivery platform and the purpose of each folder and key module.

## 📁 Root Directory Structure

```
swifteats-platform/
├── services/                    # Microservices
│   ├── auth-service/           # Authentication & Authorization

│   ├── restaurant-service/     # Restaurant & Menu Management
│   ├── order-service/          # Order Processing
│   ├── delivery-service/       # Delivery Management
│   ├── notification-service/   # Notifications
│   ├── payment-service/        # Payment Processing
│   └── analytics-service/      # Real-time Analytics & GPS Tracking
├── shared/                     # Shared Library
├── infrastructure/             # Infrastructure Configuration
├── docker/                     # Docker configurations
├── scripts/                    # Utility scripts
├── docker-compose.yml          # Docker Compose configuration
├── package.json                # Root package.json
└── README.md                   # Project documentation
```

## 🏗️ Microservices Architecture

### 1. Auth Service (`services/auth-service/`)

**Purpose**: Handles authentication, authorization, and user sessions.

**Key Components**:
- `src/controllers/auth.controller.ts` - Authentication endpoints
- `src/controllers/user.controller.ts` - User management endpoints
- `src/services/auth.service.ts` - Authentication business logic
- `src/guards/` - JWT and local authentication guards
- `src/strategies/` - Passport authentication strategies
- `src/entities/user.entity.ts` - User data model

**Port**: 3001



**Purpose**: Manages user profiles, preferences, and account information.

**Key Components**:
- `src/controllers/user.controller.ts` - User profile endpoints
- `src/services/user.service.ts` - User management business logic
- `src/entities/user.entity.ts` - User profile data model
- `src/repositories/user.repository.ts` - Data access layer



### 3. Restaurant Service (`services/restaurant-service/`)

**Purpose**: Manages restaurants, menus, and menu items.

**Key Components**:
- `src/controllers/restaurant.controller.ts` - Restaurant endpoints
- `src/controllers/menu.controller.ts` - Menu management endpoints
- `src/services/restaurant.service.ts` - Restaurant business logic
- `src/entities/` - Restaurant and menu data models
- `src/repositories/` - Data access layer

**Port**: 3003

### 4. Order Service (`services/order-service/`)

**Purpose**: Handles order processing, status management, and order lifecycle.

**Key Components**:
- `src/controllers/order.controller.ts` - Order endpoints
- `src/services/order.service.ts` - Order processing logic
- `src/entities/` - Order and order item data models
- `src/repositories/` - Data access layer
- `src/processors/` - Order processing workflows

**Port**: 3004

### 5. Delivery Service (`services/delivery-service/`)

**Purpose**: Manages delivery tracking, driver assignment, and delivery optimization.

**Key Components**:
- `src/controllers/delivery.controller.ts` - Delivery endpoints
- `src/services/delivery.service.ts` - Delivery management logic
- `src/entities/` - Delivery data models
- `src/repositories/` - Data access layer
- `src/optimizers/` - Delivery route optimization

**Port**: 3005

### 6. Notification Service (`services/notification-service/`)

**Purpose**: Handles push notifications, emails, and SMS communications.

**Key Components**:
- `src/controllers/notification.controller.ts` - Notification endpoints
- `src/services/notification.service.ts` - Notification logic
- `src/providers/` - Email, SMS, and push notification providers
- `src/templates/` - Notification templates
- `src/entities/` - Notification data models

**Port**: 3006

### 7. Payment Service (`services/payment-service/`)

**Purpose**: Processes payments, handles payment gateways, and manages transactions.

**Key Components**:
- `src/controllers/payment.controller.ts` - Payment endpoints
- `src/services/payment.service.ts` - Payment processing logic
- `src/providers/` - Payment gateway integrations
- `src/entities/` - Payment and transaction data models
- `src/repositories/` - Data access layer

**Port**: 3007

### 8. Analytics Service (`services/analytics-service/`)

**Purpose**: Real-time analytics, GPS tracking, and performance monitoring.

**Key Components**:
- `src/controllers/analytics.controller.ts` - Analytics endpoints
- `src/gateways/analytics.gateway.ts` - WebSocket gateway for real-time data
- `src/services/analytics.service.ts` - Analytics processing logic
- `src/services/realtime.service.ts` - Real-time data processing
- `src/simulators/` - Data simulators for testing
- `src/entities/` - Analytics data models

**Port**: 3008

## 📦 Shared Library (`shared/`)

**Purpose**: Contains shared utilities, interfaces, and constants used across all services.

**Key Components**:
- `src/common/` - Common utilities and classes
- `src/constants/` - Shared constants and enums
- `src/interfaces/` - Shared TypeScript interfaces
- `src/utils/` - Utility functions
- `package.json` - Shared dependencies

## 🏗️ Infrastructure (`infrastructure/`)

**Purpose**: Configuration files for external services and databases.

**Key Components**:
- `postgres/init.sql` - PostgreSQL database initialization
- `mongodb/init.js` - MongoDB database initialization
- `redis/redis.conf` - Redis configuration

## 🐳 Docker Configuration (`docker/`)

**Purpose**: Docker-related configurations and scripts.

**Key Components**:
- Dockerfiles for each service
- Docker configuration files
- Build scripts

## 📜 Scripts (`scripts/`)

**Purpose**: Utility scripts for development, deployment, and maintenance.

**Key Components**:
- `setup-services.sh` - Service setup script
- `deploy.sh` - Deployment scripts
- `test.sh` - Testing scripts

## 🔧 Configuration Files

### Root Level Files

- `package.json` - Root dependencies and scripts
- `docker-compose.yml` - Multi-service Docker orchestration
- `.gitignore` - Git ignore patterns
- `README.md` - Project documentation

### Service Level Files

Each service contains:
- `package.json` - Service-specific dependencies
- `tsconfig.json` - TypeScript configuration
- `nest-cli.json` - NestJS CLI configuration
- `Dockerfile` - Service containerization
- `src/main.ts` - Service entry point
- `src/app.module.ts` - Service module configuration

## 📊 Data Flow Architecture

### Request Flow
1. **Client Request** → API Gateway (future)
2. **Authentication** → Auth Service
3. **Business Logic** → Appropriate Microservice
4. **Data Access** → Database/Redis
5. **Response** → Client

### Event Flow
1. **Event Generation** → Source Service
2. **Event Publishing** → Message Broker (RabbitMQ/Kafka)
3. **Event Processing** → Consumer Services
4. **State Update** → Database/Cache

### Real-time Flow
1. **GPS Data** → Analytics Service
2. **WebSocket Broadcast** → Connected Clients
3. **Data Processing** → Real-time Analytics
4. **Storage** → MongoDB

## 🔒 Security Architecture

### Authentication Flow
1. **Login Request** → Auth Service
2. **Credential Validation** → Database
3. **JWT Generation** → Auth Service
4. **Token Response** → Client

### Authorization Flow
1. **API Request** → Service
2. **Token Validation** → JWT Guard
3. **Permission Check** → Authorization Service
4. **Request Processing** → Business Logic

## 📈 Scalability Considerations

### Horizontal Scaling
- Each service can be scaled independently
- Stateless design for easy replication
- Load balancer ready

### Database Scaling
- PostgreSQL for transactional data
- MongoDB for analytics and logs
- Redis for caching and sessions

### Message Broker Scaling
- RabbitMQ for reliable messaging
- Kafka for high-throughput events
- Multiple consumers for parallel processing

## 🧪 Testing Strategy

### Unit Tests
- Located in `src/**/*.spec.ts`
- Test individual components
- Mock external dependencies

### Integration Tests
- Located in `test/` directories
- Test service interactions
- Use test databases

### E2E Tests
- Test complete workflows
- Use real service instances
- Validate business requirements

## 📊 Monitoring and Observability

### Health Checks
- `/api/v1/health` - Comprehensive health check
- `/api/v1/health/ready` - Readiness check
- `/api/v1/health/live` - Liveness check

### Metrics
- Database connection status
- Memory usage
- Response times
- Error rates

### Logging
- Structured logging
- Request tracing
- Error tracking

## 🚀 Deployment Architecture

### Development
- Local Docker Compose
- Hot reloading
- Debug mode

### Production
- Container orchestration
- Load balancing
- Auto-scaling
- Monitoring and alerting

This architecture ensures scalability, maintainability, and high performance while meeting the business requirements for real-time food delivery operations.
