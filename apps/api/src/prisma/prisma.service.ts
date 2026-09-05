import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Camada única de acesso ao Postgres.
 *
 * `withUserContext` é o ponto central da estratégia de RLS (ver
 * infra/migrations/002_row_level_security.sql): toda operação que deve
 * respeitar o escopo de um usuário passa por aqui, que abre uma transação
 * e seta as variáveis de sessão que as policies do banco leem.
 *
 * Rotas/jobs de sistema (sem usuário, ex. motor de alertas) usam
 * `withSystemContext`, que roda como super admin lógico — a autorização
 * dessas rotinas é garantida pelo próprio código, não pelo RLS.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async withUserContext<T>(
    params: { userId: string; isSuperAdmin: boolean },
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.$executeRaw`SELECT set_config('app.current_user_id', ${params.userId}, true)`;
      await tx.$executeRaw`SELECT set_config('app.is_super_admin', ${String(params.isSuperAdmin)}, true)`;
      return fn(tx);
    });
  }

  async withSystemContext<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.$executeRaw`SELECT set_config('app.is_super_admin', 'true', true)`;
      return fn(tx);
    });
  }
}