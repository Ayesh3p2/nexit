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
import configuration from './config/configuration';

export const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    LoggerModule.forRoot(),
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.development'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [join(__dirname, '**/*.entity.{ts,js}')],
        synchronize: !isProduction, // Disable in production
        logging: !isProduction ? ['query', 'error'] : ['error'],
        migrations: [join(__dirname, 'migrations/*.{ts,js}')],
        migrationsRun: true,
      }),
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

    // Logging
    LoggerModule.forRoot({
      pinoHttp: {
        level: isProduction ? 'info' : 'debug',
        transport: !isProduction
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      },
    }),

    // Application Modules
    AuthModule,
    UsersModule,
    IncidentsModule,
    IncidentsModule,
    ProblemsModule,
    ChangesModule,
    AssetsModule,
    SaasModule,
    CmdbModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
