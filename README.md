# connector-pt2030

PRR and Portugal 2030 European Funds Projects API Connector for API Aberta.

## Overview

Provides a REST API for accessing PRR (Plano de Recuperação e Resiliência) and PT2030 (Portugal 2030) European funds projects data.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/meta` | Service metadata |
| GET | `/pt2030/projects` | List projects (supports filtering) |
| GET | `/pt2030/projects/:id` | Get project by ID |
| GET | `/pt2030/stats` | Aggregate statistics |

## Query Parameters (GET /pt2030/projects)

| Param | Description |
|-------|-------------|
| `page` | Page number (default: 1) |
| `limit` | Results per page (default: 20, max: 100) |
| `status` | Filter by status (e.g. approved, in_progress) |
| `fund_type` | Filter by fund type (PRR or PT2030) |
| `component` | Filter by component name |
| `search` | Full-text search on name, beneficiary, description |

## Running

```bash
npm install
npm start          # production (PM2)
npm run dev        # development with watch
```

Requires `.env` file with `PORT` variable (defaults to 3014).

## Data Source

Currently running with demo data. Awaiting official data source from dados.gov.pt API.

Official sources:
- https://dados.gov.pt (Estrutura de Missão Recuperar Portugal)
- https://transparencia.gov.pt/pt/fundos-europeus/prr/
- https://prr2030.pt
