import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { ProblemsModule } from './modules/problems/problems.module';
import { ChangesModule } from './modules/changes/changes.module';
import { AssetsModule } from './modules/assets/assets.module';
import { SaasModule } from './modules/saas/saas.module';
import { CmdbModule } from './modules/cmdb/cmdb.module';
import { HealthModule } from './modules/health/health.module';
import configuration from './config/configuration';

export const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.development'],
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'nexit_itsm',
      entities: [join(__dirname, '**/*.entity.{ts,js}')],
      synchronize: !isProduction, // Disable in production
      logging: !isProduction ? ['query', 'error'] : ['error'],
      migrations: [join(__dirname, 'migrations/*.{ts,js}')],
      migrationsRun: true,
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: !isProduction,
      introspection: !isProduction,
      context: ({ req, res }: { req: import('express').Request, res: import('express').Response }) => ({ req, res }),
    }),

    // Application Modules
    AuthModule,
    UsersModule,
    IncidentsModule,
    ProblemsModule,
    ChangesModule,
    AssetsModule,
    SaasModule,
    CmdbModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
