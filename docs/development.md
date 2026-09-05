# Ambiente de Desenvolvimento — Bloco 1

Este documento cobre exatamente os itens 1–7 do "Critério de Conclusão da
Fase 1": subir Postgres, Redis, API, e rodar as migrations. Login, seed e
o restante dos critérios entram no Bloco 2.

## Pré-requisitos
- Docker + Docker Compose
- Node.js 20+
- (opcional) `psql` no host, para aplicar a migration de RLS

## Passo a passo

```bash
# 1. Subir Postgres e Redis
npm run docker:up

# 2. Instalar dependências do backend
cd apps/api
cp .env.example .env
npm install

# 3. Gerar o client do Prisma
npm run prisma:generate

# 4. Criar as tabelas
npm run prisma:migrate -- --name init

# 5. Aplicar as políticas de Row-Level Security (manual, fora do Prisma)
psql "$DATABASE_URL" -f ../../infra/migrations/002_row_level_security.sql

# 6. Subir a API
npm run start:dev
```

## Como validar que o Bloco 1 está funcionando

```bash
curl http://localhost:3000/health
```

Resposta esperada (200):
```json
{ "status": "ok", "info": { "database": { "status": "up" } } }
```

Se isso responder `ok`, os critérios 1–7 do Bloco 1 estão cumpridos:
Postgres no ar, Redis no ar, API no ar, migrations aplicadas, conexão
banco↔API funcionando de fato — não apenas "arquivo criado".

## ⚠️ O que eu não pude verificar aqui

Este ambiente de execução (onde o código foi gerado) está sem acesso à
rede — não consegui rodar `npm install`, `prisma migrate dev` nem subir os
containers para testar de ponta a ponta. Os arquivos foram revisados
manualmente (sintaxe, consistência entre `schema.prisma` e o SQL de RLS,
nomes de variáveis de ambiente batendo entre `.env.example`,
`docker-compose.yml` e `env.validation.ts`), mas **a validação real só
acontece quando você rodar os passos acima**. Por favor rode e me diga o
resultado — inclusive se algo falhar — antes de eu avançar para o Bloco 2,
conforme a regra de execução que você definiu.
