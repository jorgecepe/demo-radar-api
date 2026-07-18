# Radar Chile

Monitor de los indicadores de Chile (UF, dólar, euro, UTM, cobre, IPC, TPM, desempleo, Bitcoin), el próximo feriado y los últimos sismos, con un **resumen del día escrito por Claude** en lenguaje natural.

Proyecto de aprendizaje para practicar el flujo completo **GitHub → Vercel → VPS** usando Claude Code dentro de Claude Desktop.

## Arquitectura

- **Frontend (Vercel):** dashboard en Next.js + Tailwind. Consume la API del VPS.
- **Backend (VPS Hetzner):** API Express + Postgres + un cron cada 6 h que consulta las fuentes, guarda el histórico y genera el resumen del día con la API de Claude. Aislado en su propio `docker compose`.
- **Exposición:** solo la API sale a internet, en `https://radar-api.luminaconsulting.ai` (vía Caddy). La base de datos nunca se expone.

Detalle completo en [docs/arquitectura.md](docs/arquitectura.md).

## Fuentes de datos

- [mindicador.cl](https://mindicador.cl): indicadores económicos.
- [api.boostr.cl](https://api.boostr.cl): feriados y sismos.

## Estructura

- `docs/`: arquitectura y diseño (incluye el mockup de la Fase 1).
- `api/`: backend para el VPS (Fase 2).
- `web/`: frontend Next.js para Vercel (Fase 3).

## Estado

En construcción.

- [x] Fase 0: setup, DNS, arquitectura.
- [x] Fase 1: diseño del dashboard (ver `docs/design/radar-chile-mockup.html`).
- [ ] Fase 2: backend en el VPS.
- [ ] Fase 3: frontend + despliegue en Vercel.
