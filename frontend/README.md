# nexit

# NexIT - Next-Gen ITSM Platform

NexIT is a cutting-edge IT Service Management platform designed to revolutionize IT operations with AI-powered automation and comprehensive service management capabilities. Built with modern technologies and best practices, NexIT offers a unified platform for IT service delivery, asset management, and operational intelligence.

## Key Features

- **Core ITSM**: Incident, Problem, Change, and Request Management
- **Asset Management**: Comprehensive IT asset lifecycle management
- **SaaS Management**: License optimization and vendor management
- **CMDB**: Configuration Management Database with relationship mapping
- **AI & Automation**: Intelligent ticket routing, predictive analytics
- **Advanced Analytics**: Real-time dashboards and custom reporting

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Next.js 13+ (App Router)
- Tailwind CSS
- Apollo Client
- React Query
- Jest & React Testing Library

### Backend
- Node.js 18+
- Express.js
- GraphQL (Apollo Server)
- TypeORM
- JWT Authentication
- Redis for caching

### Database
- PostgreSQL 14+
- Redis
- Elasticsearch

### Infrastructure
- Docker
- Kubernetes
- AWS/Azure
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm (recommended) or npm
- PostgreSQL 14+
- Redis
- Elasticsearch 8.x

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/nexit-itsm.git
   cd nexit-itsm
   ```

2. Install dependencies:
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the environment variables in .env
   ```

4. Start development services:
   ```bash
   # Start database and other services
   docker-compose up -d
   
   # Run database migrations
   pnpm db:migrate
   
   # Start development servers
   pnpm dev
   ```

## Project Structure

```
nexit-itsm/
├── backend/              # Backend services
│   ├── src/
│   │   ├── modules/     # Business logic modules
│   │   ├── common/      # Shared utilities and middleware
│   │   ├── config/      # Configuration files
│   │   └── index.ts     # Application entry point
│   └── package.json
│
├── frontend/             # Frontend application
│   ├── src/
│   │   ├── app/         # Next.js app directory
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # Utility functions
│   │   └── styles/      # Global styles
│   └── package.json
│
├── infra/               # Infrastructure as Code
│   ├── kubernetes/      # K8s manifests
│   └── terraform/       # Terraform configurations
│
└── docs/                # Documentation
    ├── api/             # API documentation
    ├── architecture/    # System architecture
    └── user-guides/     # User documentation
```

## Development Workflow

1. Create a new branch for your feature/bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. Push your changes and create a pull request

## Testing

Run the test suite:
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test-file.spec.ts
```

## Deployment

### Production Build
```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

### Docker
```bash
# Build the Docker image
docker build -t nexit-itsm .

# Run the container
docker run -p 3000:3000 nexit-itsm
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact support@nexit-itsm.com or open an issue in our GitHub repository.
>>>>>>> 4604524 (Initial commit: Project setup with user management module)
