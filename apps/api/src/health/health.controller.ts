import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

/**
 * GET /health — usado por Docker/orquestrador para saber se a API está
 * realmente operante (não só "processo rodando", mas "banco acessível").
 * Critério de conclusão do Bloco 1: este endpoint precisa responder 200
 * com o Postgres real do docker-compose no ar.
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<{ status: string; info: HealthIndicatorResult }> {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma as any),
    ]) as unknown as Promise<{ status: string; info: HealthIndicatorResult }>;
  }
}
