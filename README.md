# Sistema de Gerenciamento de Estoque — MVP

Stack: FastAPI + SQLAlchemy/Alembic + PostgreSQL (backend), React + TypeScript + Vite + Tailwind (frontend).
Veja `CLAUDE.md` para o escopo do MVP.

## Executando com Docker Compose (recomendado)

1. Crie o arquivo de variáveis de ambiente do backend:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Edite `backend/.env` e defina um `JWT_SECRET_KEY` real (ex: `openssl rand -hex 32`).

2. Inicie tudo:

   ```bash
   docker compose up -d
   ```

   Isso inicia:
   - `db` — PostgreSQL em `localhost:5433`
   - `backend` — FastAPI em `http://localhost:8000`
   - `frontend` — servidor de desenvolvimento Vite em `http://localhost:5173`

3. Aplique as migrações do banco de dados (apenas na primeira execução):

   ```bash
   docker compose exec backend alembic upgrade head
   ```

4. Abra `http://localhost:5173` no navegador.

5. Cadastre um usuário antes de fazer login:

   ```bash
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"nome":"Admin","email":"admin@estoque.com","senha":"123456"}'
   ```

## Executando manualmente (sem Docker)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edite DATABASE_URL e JWT_SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Requer uma instância PostgreSQL em execução compatível com `DATABASE_URL` no `.env`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # ajuste VITE_API_BASE_URL se o backend não estiver em localhost:8000
npm run dev
```

Abra `http://localhost:5173`.

## Comandos úteis

```bash
docker compose logs -f backend       # acompanhar logs do backend
docker compose exec backend alembic revision --autogenerate -m "msg"  # nova migração
docker compose down                  # parar tudo
docker compose down -v               # parar e apagar o volume do banco de dados
```
