import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Database Configuration
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'nexit_itsm',
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600,
  },
  
  // Elasticsearch Configuration
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
  
  // Frontend URL for CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASSWORD || 'password',
    },
    from: process.env.EMAIL_FROM || 'NexIT <noreply@nexit-itsm.com>',
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(','),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  
  // Rate Limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60, // 1 minute
    limit: parseInt(process.env.RATE_LIMIT, 10) || 100, // 100 requests per IP per minute
  },
  
  // Feature Flags
  features: {
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    enableTwoFactorAuth: process.env.ENABLE_TWO_FACTOR_AUTH === 'true',
    enableAuditLog: process.env.ENABLE_AUDIT_LOG === 'true',
  },
}));
