# Banco de Dados — Fase 1

Fonte de verdade: `apps/api/prisma/schema.prisma`.
RLS (segunda camada de defesa, complementar ao RBAC de aplicação): `infra/migrations/002_row_level_security.sql`.

## Tabelas implementadas nesta fase

| Domínio | Tabelas |
|---|---|
| Identidade | `internal_users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`, `user_company_access` |
| Empresas | `holders`, `companies`, `company_change_history` |
| Aparelhos | `devices`, `device_current_status`, `device_status_history`, `device_required_apps`, `device_app_status`, `device_events` |
| Alertas | `alert_rules`, `alerts` |
| Auditoria | `audit_logs` |

Marketplace/pedidos/produtos/estoque **não** foram incluídos nesta fase (conforme item 24 da Fase 1 — "não implementar integrações externas ainda"). Os modelos completos já estão desenhados no documento da Fase 0, para quando entrarem.

## Decisões de schema relevantes

- **`device.company_id` é obrigatório, não nulo** — hoje a regra de negócio é "1 empresa → 1 aparelho", mas o schema já modela 1:N (uma empresa pode ter N devices). A restrição "1 aparelho por empresa" é de aplicação, não do banco, exatamente para não exigir migração quando isso mudar.
- **`imei` é opcional** (`String?`) em `devices` — nunca é chave, nunca é obrigatório. O identificador primário do aparelho é sempre `device.id` (UUID interno). Ver `docs/decisions.md` para o motivo (restrições de permissão do Android 10+).
- **`device_status_history` não está particionada nesta migration inicial do Prisma** — Prisma não gerencia particionamento nativamente. Antes de ir para produção com volume real, aplicar particionamento por mês via migration SQL manual adicional (mesma técnica usada para RLS), convertendo a tabela para `PARTITION BY RANGE (recorded_at)`. Registrado como pendência técnica.
- **Enums vs. tabelas**: papéis, permissões e regras de marketplace são **tabelas** (para adicionar sem migração); estados como `DeviceStatus`, `AlertSeverity` são **enums do Postgres** (via Prisma) porque são um conjunto fechado e estável, definido no domínio do sistema — não algo que um operador cadastra.

## Como rodar as migrations

```bash
cd apps/api
cp .env.example .env   # ajuste DATABASE_URL se necessário
npm install
npx prisma migrate dev --name init   # cria as tabelas a partir do schema.prisma
psql "$DATABASE_URL" -f ../../infra/migrations/002_row_level_security.sql
```
