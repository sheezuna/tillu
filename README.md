# Tillu AI POS System

Next-Generation Human-Centered AI POS System for Food & Takeaways (UK)

## Overview

Tillu is a comprehensive multi-branch AI-enhanced POS system designed specifically for food and takeaway businesses in the UK. The system empowers staff with intelligent, human-centric tools while improving operational efficiency and customer experience.

## System Architecture

### Technology Stack
- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Node.js, NestJS, TypeScript
- **Database**: PostgreSQL, Redis (cache + pub/sub)
- **AI/ML**: Python (scikit-learn, PyTorch, Hugging Face Transformers)
- **Cloud**: AWS/GCP
- **Messaging**: Twilio (SMS), SendGrid (Email)

### Monorepo Structure
```
tillu-pos-system/
├── apps/
│   ├── api-gateway/          # NestJS API Gateway
│   ├── pos-terminal/         # Smart POS Terminal (Next.js PWA)
│   ├── customer-pwa/         # Customer Ordering App (Next.js PWA)
│   ├── manager-dashboard/    # Manager Analytics Dashboard (Next.js)
│   └── kitchen-display/      # Kitchen Command Center (Next.js)
├── packages/
│   ├── shared/              # Shared types and utilities
│   └── ui/                  # Shared UI components
└── turbo.json              # Turborepo configuration
```

## Core Modules

### 1. Smart POS Terminal
- Responsive Next.js PWA interface
- Fuzzy search for fast item lookup
- AI prompts for upselling and combos
- Voice input via Web Speech API
- Offline support with local caching
- Order management: hold, split, merge

### 2. Multi-Branch Smart Routing
- AI routing based on location, inventory, and queue
- Real-time kitchen workload balancing
- Manual override capabilities
- Failure alerts and fallbacks

### 3. Kitchen Command Center
- Prioritized preparation queue with color-coded urgency
- Real-time timers and delay alerts
- Load balancing and auto-reassignment
- Chef capacity tracking

### 4. Predictive Stock Manager
- Real-time inventory aggregation
- AI-powered depletion predictions
- Automated reorder alerts
- Stock substitution suggestions

### 5. Staff AI Assistant
- Natural language queries via chat/voice
- Sales, inventory, and customer insights
- Training recommendations
- Contextual data highlighting

### 6. Smart Offers & Loyalty
- AI-detected flash deals based on inventory
- Loyalty points and gamification
- Hyperlocal offers by postcode
- Customer identification via phone/QR

### 7. Manager Dashboard
- Real-time branch overview
- AI-powered forecasting
- Customizable analytics
- Daily summary reports

### 8. AI Marketing & SMS
- Automated customer segmentation (RFM)
- Campaign generation and scheduling
- A/B testing with feedback loops
- SMS/Email integration

### 9. Customer Website/PWA
- Branch-aware menu with real-time stock
- Personalized recommendations
- QR-based instant reorder
- Multiple order types support

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Python 3.9+ (for AI services)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tillu-pos-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/api-gateway/.env.example apps/api-gateway/.env
# Edit the .env file with your configuration
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- API Gateway: http://localhost:8000
- POS Terminal: http://localhost:3000
- Customer PWA: http://localhost:3001
- Manager Dashboard: http://localhost:3002
- Kitchen Display: http://localhost:3003

### API Documentation
Once the API Gateway is running, visit http://localhost:8000/api/docs for Swagger documentation.

## Features

### Performance
- Order routing and kitchen updates respond within 200ms
- Offline POS sync resolves conflicts within 1 minute
- Support for 50+ branches and thousands of concurrent users

### Security
- Full GDPR compliance with encrypted personal data
- Role-based access control (RBAC) with audit trails
- JWT authentication with HTTPS
- Secure API endpoints with rate limiting

### Availability
- 99.9% uptime for cloud components
- POS terminals functional offline with local sync
- Real-time WebSocket updates
- Automated failover and recovery

## User Roles

- **Manager**: Full access across all branches, analytics, staff management
- **Kitchen Staff**: Kitchen command center, order queue management
- **Cashier**: POS terminal, discounts, loyalty management
- **Delivery Staff**: Order tracking and status updates
- **Marketing Team**: Campaign management and customer communication

## Development

### Scripts
- `npm run dev` - Start all development servers
- `npm run build` - Build all applications
- `npm run lint` - Run linting across all packages
- `npm run test` - Run test suites

### Contributing
1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Deployment

The system is designed for cloud deployment with:
- Containerized microservices
- Auto-scaling capabilities
- CI/CD pipelines
- Monitoring and logging
- Database migrations
- Environment-specific configurations

## License

Copyright © 2025 Tillu AI POS System. All rights reserved.
