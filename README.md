# API Aberta — PRR / PT2030 Connector

PRR (Plano de Recuperação e Resiliência) and PT2030 project data from transparencia.gov.pt.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health check |
| GET | /meta | Service metadata |
| GET | /docs | Swagger documentation |
| GET | /prr/components | List all PRR components and investments |
| GET | /prr/projects | Search PRR projects |
| GET | /prr/summary | PRR summary with component list |
| GET | /pt2030/summary | PT2030 summary |

## Quick Start

npm install
npm start

## Environment

PORT: 3014

## Data Sources

- PRR: https://transparencia.gov.pt
- PT2030: https://prr2030.pt, https://portugalglobal.pt/PT2030

## PRR Components

C01: Serviço Nacional de Saúde
C02: Habitação
C03: Respostas sociais
C04: Cultura
C05: Investimento e inovação
C06: Qualificações e competências
C07: Infraestruturas
C08: Florestas
C09: Gestão hídrica

## License

MIT
