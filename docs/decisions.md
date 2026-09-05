# Decisões Técnicas — Fase 1

## ORM/Migrations: Prisma
Schema único como fonte de verdade, migrations versionadas automaticamente,
type-safety no backend. RLS não é modelável em Prisma — resolvido com uma
migration SQL manual complementar (`infra/migrations/`), aplicada depois das
migrations do Prisma.

## Identificação do aparelho: `device.id` (UUID interno), nunca IMEI
A partir do Android 10, a leitura do IMEI real exige a permissão
`READ_PRIVILEGED_PHONE_STATE`, que só apps do sistema/MDM conseguem obter —
um app comum instalado via APK/Play Store normalmente **não consegue ler o
IMEI**. Por isso:
- `devices.imei` é opcional e complementar, nunca chave.
- O identificador principal é gerado pela própria Central no momento da
  ativação do aparelho (`device.id`), e o agente Android armazena esse UUID
  localmente — não depende de nenhuma permissão sensível do Android.
- **Pendente de validação**: se o agente será distribuído como MDM (Android
  Enterprise/Device Owner), que aí sim permite mais telemetria nativa, ou
  como app comum — isso muda o que é tecnicamente possível monitorar no
  Bloco do Agente Android (fora do escopo desta fase).

## RLS: segunda camada, não a primeira
A autorização "de verdade" acontece nos guards do NestJS (RBAC +
`user_company_access`) antes mesmo da query ser montada. RLS garante que,
mesmo que um bug de aplicação monte uma query sem o filtro correto, o
Postgres ainda assim não devolve linhas fora do escopo do usuário. As duas
camadas são independentes de propósito.

## Rate limiting global desde o main.ts
Aplicado via `@nestjs/throttler` como guard global (100 req/min por IP como
ponto de partida). Rotas sensíveis (login) recebem um limite mais agressivo
próprio quando o módulo de Auth for implementado (Bloco 2) — não faz sentido
aplicar o limite de login a todas as rotas.

## Pendências desta fase (não resolvidas ainda, listadas para não serem esquecidas)
- Particionamento de `device_status_history` por mês (ver `docs/database.md`).
- Definição final: MDM (Device Owner) vs. app comum para o agente Android.
- Validação jurídica dos pontos de LGPD levantados no documento da Fase 0.
- Confirmação de qual programa de integração Magalu será usado.
