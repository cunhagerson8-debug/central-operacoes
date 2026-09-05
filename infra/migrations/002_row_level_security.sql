-- =============================================================================
-- Row-Level Security — Central de Operações de Marketplaces
--
-- QUANDO RODAR: depois de `npx prisma migrate dev` (que cria as tabelas).
-- Este arquivo NÃO é gerenciado pelo Prisma; aplique manualmente:
--   psql "$DATABASE_URL" -f infra/migrations/002_row_level_security.sql
--
-- COMO FUNCIONA:
-- O backend, dentro de cada transação, executa:
--   SET LOCAL app.current_user_id = '<uuid-do-usuario>';
--   SET LOCAL app.is_super_admin = 'true' | 'false';
-- As policies abaixo leem essas variáveis de sessão para decidir quais
-- linhas cada usuário pode enxergar.
--
-- IMPORTANTE: RLS aqui é uma SEGUNDA camada de defesa. A primeira é o RBAC
-- de aplicação (guards do NestJS) — a query nem deveria ser disparada para
-- uma empresa fora do escopo. RLS garante que, mesmo com um bug de
-- aplicação, o banco não devolve dados fora do escopo do usuário.
-- =============================================================================

-- Helper: usuário é super admin?
CREATE OR REPLACE FUNCTION app_is_super_admin() RETURNS boolean AS $$
  SELECT COALESCE(current_setting('app.is_super_admin', true), 'false')::boolean;
$$ LANGUAGE sql STABLE;

-- Helper: id do usuário atual (pode ser null para jobs internos do sistema)
CREATE OR REPLACE FUNCTION app_current_user_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- -----------------------------------------------------------------------------
-- companies
-- -----------------------------------------------------------------------------
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_select ON companies
  FOR SELECT
  USING (
    app_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM user_company_access uca
      WHERE uca.company_id = companies.id
        AND uca.user_id = app_current_user_id()
    )
  );

CREATE POLICY companies_modify ON companies
  FOR ALL
  USING (
    app_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM user_company_access uca
      WHERE uca.company_id = companies.id
        AND uca.user_id = app_current_user_id()
        AND uca.access_level = 'MANAGE'
    )
  );

-- -----------------------------------------------------------------------------
-- devices (escopo herdado da empresa)
-- -----------------------------------------------------------------------------
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY devices_select ON devices
  FOR SELECT
  USING (
    app_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM user_company_access uca
      WHERE uca.company_id = devices.company_id
        AND uca.user_id = app_current_user_id()
    )
  );

CREATE POLICY devices_modify ON devices
  FOR ALL
  USING (
    app_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM user_company_access uca
      WHERE uca.company_id = devices.company_id
        AND uca.user_id = app_current_user_id()
        AND uca.access_level = 'MANAGE'
    )
  );

-- -----------------------------------------------------------------------------
-- alerts (escopo por empresa, quando aplicável; alertas sem empresa —
-- ex. futuros alertas de infraestrutura — só super admin vê)
-- -----------------------------------------------------------------------------
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_select ON alerts
  FOR SELECT
  USING (
    app_is_super_admin()
    OR (
      company_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM user_company_access uca
        WHERE uca.company_id = alerts.company_id
          AND uca.user_id = app_current_user_id()
      )
    )
  );

-- -----------------------------------------------------------------------------
-- audit_logs (leitura restrita por empresa; escrita sempre via aplicação)
-- -----------------------------------------------------------------------------
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT
  USING (
    app_is_super_admin()
    OR (
      company_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM user_company_access uca
        WHERE uca.company_id = audit_logs.company_id
          AND uca.user_id = app_current_user_id()
      )
    )
  );

-- NOTA: internal_users, roles, permissions, alert_rules, device_required_apps
-- são tabelas de administração global — não recebem RLS por empresa (o
-- controle de quem pode geri-las é feito por RBAC de permissão, ex. `user.edit`).
