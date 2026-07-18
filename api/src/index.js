// Punto de entrada: monta la API Express y arranca el cron.
import express from 'express';
import cors from 'cors';
import { initSchema, ultimoResumen } from './db.js';
import {
  INDICADORES,
  fetchIndicadores,
  fetchSerie,
  fetchSismos,
  fetchProximoFeriado,
} from './sources.js';
import { programarCron } from './cron.js';

const app = express();
// API publica de datos: permitimos cualquier origen (el frontend vive en Vercel).
app.use(cors());

// --- Cache simple en memoria para no golpear las fuentes en cada visita ---
const cache = new Map();
async function cached(clave, ttlMs, fn) {
  const hit = cache.get(clave);
  if (hit && hit.expira > Date.now()) return hit.valor;
  const valor = await fn();
  cache.set(clave, { valor, expira: Date.now() + ttlMs });
  return valor;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, servicio: 'radar-chile-api', hora: new Date().toISOString() });
});

// Endpoint principal que consume el frontend: todo el panel en una sola respuesta.
app.get('/api/dashboard', async (req, res) => {
  try {
    const data = await cached('dashboard', 10 * 60 * 1000, async () => {
      const base = await fetchIndicadores();
      // A los indicadores marcados con serie les adjuntamos tendencia y variacion.
      const indicadores = await Promise.all(
        base.map(async (ind) => {
          const cfg = INDICADORES.find((c) => c.codigo === ind.codigo);
          if (cfg?.serie) {
            const s = await fetchSerie(ind.codigo).catch(() => null);
            return { ...ind, ...(s || {}) };
          }
          return ind;
        })
      );
      const [sismos, feriado] = await Promise.all([
        fetchSismos().catch(() => []),
        fetchProximoFeriado().catch(() => null),
      ]);
      return { indicadores, sismos, feriado, actualizado: new Date().toISOString() };
    });

    const resumen = await ultimoResumen();
    res.json({
      ...data,
      resumen: resumen?.texto || null,
      resumen_at: resumen?.creado_at || null,
    });
  } catch (e) {
    console.error('[api] /dashboard fallo:', e.message);
    res.status(502).json({ error: 'no se pudieron obtener los datos', detalle: e.message });
  }
});

const PORT = process.env.PORT || 3000;

// Inicializamos la base, arrancamos el cron y recien ahi escuchamos.
initSchema()
  .then(() => {
    programarCron();
    app.listen(PORT, () => console.log(`[api] Radar Chile escuchando en :${PORT}`));
  })
  .catch((e) => {
    console.error('[api] no se pudo inicializar la base:', e.message);
    process.exit(1);
  });
