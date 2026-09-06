import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { HoldersModule } from './holders/holders.module';
import { DriversModule } from './drivers/drivers.module';
import { DevicesModule } from './devices/devices.module';
import { SmsModule } from './sms/sms.module';
import { MarketplacesModule } from './marketplaces/marketplaces.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env'],
    }),
    // Rate limiting global (item 17 da Fase 1: proteção básica desde o dia 1).
    // Limites por rota (ex. login mais restrito) entram no módulo de Auth (Bloco 2).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    HoldersModule,
    DriversModule,
    DevicesModule,
    SmsModule,
    MarketplacesModule,
    RolesModule,
    // Próximos módulos (Bloco 2 em diante): AuthModule, UsersModule,
    // RolesModule, PermissionsModule, CompaniesModule, HoldersModule,
    // DevicesModule, AlertsModule, AuditModule.
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
