# Arquitectura de Radar Chile

## Objetivo

Mostrar de un vistazo el estado de los indicadores de Chile más un resumen del día en lenguaje natural escrito por Claude. El proyecto sirve además como caso de aprendizaje del flujo GitHub → Vercel → VPS.

## Componentes

### Frontend (Vercel)

- Next.js + Tailwind.
- Renderiza el dashboard y consume la API del VPS.
- Se despliega automáticamente en cada push a la rama principal de GitHub.

### Backend (VPS Hetzner)

Todo aislado en su propio `docker compose`, con red interna de Docker:

- **Postgres:** guarda el histórico de indicadores (lo que permite las mini-tendencias). Bindeado solo a la red interna, nunca a internet.
- **API Express:** expone los endpoints `/indicadores`, `/resumen`, `/sismos`, `/feriados`.
- **Cron (cada 6 h):** consulta las fuentes públicas, guarda un snapshot en Postgres y genera el resumen del día llamando a la API de Claude. La clave de Anthropic vive como variable de entorno en el VPS, nunca en el frontend.

## Exposición y red

- Solo la API sale a internet, en `https://radar-api.luminaconsulting.ai`.
- Se agrega un bloque nuevo al Caddy del host (patrón `sub.luminaconsulting.ai { reverse_proxy localhost:PUERTO }`), con respaldo previo del Caddyfile, `caddy validate` y `systemctl reload caddy`.
- El registro DNS `radar-api` apunta a `77.42.27.205` (sin proxy Cloudflare, para que Caddy emita el certificado).

## Fuentes de datos

- `mindicador.cl`: UF, dólar, euro, UTM, cobre, IPC, IMACEC, TPM, desempleo, Bitcoin.
- `api.boostr.cl`: feriados y sismos.

## Flujo de datos

1. El cron del VPS consulta las fuentes cada 6 h.
2. Guarda los valores en Postgres (histórico) y genera el resumen con Claude.
3. La API expone los últimos valores, el histórico y el resumen en JSON.
4. Vercel (Next.js) consume la API y renderiza el dashboard.
5. El usuario final ve el radar en su navegador.

## Salvaguardas en el VPS (producción compartida)

- El VPS aloja producción viva (Evolution/WhatsApp, n8n, SofíaBot, Home Assistant y otros).
- No se tocan, reinician ni reusan puertos de contenedores ajenos.
- Todo lo del proyecto vive bajo `/home/jcepeda/` y corre con `sudo docker`.
- Al tocar Caddy se respalda antes y se valida la configuración antes de recargar.
