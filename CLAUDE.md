# Sistema de Gerenciamento de Estoque — MVP

Academic project (5º período, Laboratório de Engenharia de Software). Full spec in
`../documents/relatorio_gerenciamento_estoque.typ` (requirements/user stories/BDD) and
`../documents/documento_arquitetura.typ` (architecture). This file defines the **MVP scope** —
a deliberate subset of the full spec for the first build phase.

## Stack

- **Backend:** Python 3.11 + FastAPI, SQLAlchemy 2.0 + Alembic, Pydantic v2, Pytest+HTTPX
- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite (no shadcn/ui, no Zustand, no React Query —
  plain fetch/useState for MVP)
- **DB:** PostgreSQL
- **Infra:** Docker Compose — backend + frontend + postgres only (no redis/celery)
- **Layout:** backend `Router → Service → Repository → Model`, modules per domain (produtos, estoque,
  movimentacoes, usuarios)

## MVP scope (in)

Maps to user stories in `relatorio_gerenciamento_estoque.typ` §6:

- **HU001** — Cadastro de produto (código único, unidade de medida, status ativo/inativo)
- **HU002** (simplified) — Produto has boolean flags `controla_lote` / `controla_validade` /
  `controla_serie`. **No enforcement** on entrada — flags exist for future use, not yet validated.
- **HU003** — Estoque mínimo por produto (numeric, non-negative; flag/sinaliza when saldo ≤ mínimo)
- **HU004** — Cadastro de depósitos e localizações (localização pertence a um depósito)
- **HU005/HU006** — Consulta de saldo por depósito e por localização
- **HU007** — Entrada manual de estoque (motivo/documento obrigatório, atualiza saldo)
- **HU010** — Atualização automática de saldo na entrada (mesma transação)
- **HU011** — Saída manual de estoque (motivo obrigatório)
- **HU016** — Bloqueio de saída sem saldo disponível (no negative stock)

## MVP scope (out — post-MVP)

- **HU008/HU009** — Entrada via pedido de compra, lote/validade/série enforcement
- **HU012–HU015** — Pedido de venda, reserva, separação disponível/reservado, expedição
  (no `pedido_compra`/`pedido_venda` entities in MVP)
- **HU017/HU018** — Transferências (entre depósitos e internas)
- **HU019–HU021** — Rastreabilidade por lote, FEFO, alertas de vencimento
- **HU022–HU025** — Inventário, ajustes com aprovação, auditoria formal
- Full RBAC (Admin/Estoquista/Gerente) — MVP uses **single auth, no roles**
- Redis/Celery (vencimento alerts, async jobs)

## Concurrency (MVP)

`SELECT FOR UPDATE` on saldo rows during entrada/saída — basic pessimistic lock, no optimistic
versioning. Documented debt: full RNF016-020 strategy deferred post-MVP.

## Data model (MVP tables)

`produtos`, `depositos`, `localizacoes`, `usuarios`, `saldos_estoque`, `movimentacoes`
(append-only, source of truth for saldo recalculation). Soft delete via `ativo` flag on produtos.

## Prototype reference

`prototype/` has a static HTML high-fidelity prototype (login, dashboard, produtos, entradas,
saídas) — use as UI/UX reference for the React frontend. See `prototype/README.md`.
