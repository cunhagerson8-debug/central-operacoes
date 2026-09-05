# Central de Operações de Marketplaces

Plataforma interna para administrar e monitorar a operação de até 1.500
empresas e seus aparelhos Android dedicados em marketplaces.

## Status
**Fase 1 — Bloco 1 concluído (fundação):** estrutura do monorepo, Docker
Compose, schema completo do banco (Prisma), políticas de Row-Level
Security, e bootstrap da API com `/health` verificando conexão real com o
Postgres.

**Ainda não implementado** (próximos blocos, ver `docs/decisions.md` e o
plano de execução na conversa): Auth, RBAC em runtime, CRUD de
Empresas/Aparelhos, motor de alertas, frontend, testes, agente Android,
integrações de marketplace.

## Documentação
- [`docs/database.md`](docs/database.md) — modelo de dados implementado
- [`docs/decisions.md`](docs/decisions.md) — decisões técnicas e pendências
- [`docs/development.md`](docs/development.md) — como rodar localmente

## Estrutura

```
central-operacoes/
├── apps/
│   ├── web/          # React + TS (ainda não implementado — Bloco 5)
│   └── api/           # NestJS + Prisma (fundação implementada)
├── packages/
│   └── shared-types/  # tipos compartilhados (vazio até haver contratos reais)
├── infra/
│   ├── docker/         # docker-compose.yml
│   └── migrations/      # SQL manual (RLS) complementar ao Prisma
└── docs/
```

## Início rápido
Ver [`docs/development.md`](docs/development.md).
