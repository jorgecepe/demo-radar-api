// Acceso a las fuentes de datos publicas: mindicador.cl y api.boostr.cl.
// Node 20 trae fetch global, asi que no hace falta ninguna libreria HTTP.

const UA = { 'User-Agent': 'RadarChile/1.0 (proyecto de aprendizaje)' };

// Codigos de mindicador que mostramos, y cuales llevan mini-tendencia (serie).
export const INDICADORES = [
  { codigo: 'uf', serie: true },
  { codigo: 'dolar', serie: true },
  { codigo: 'euro', serie: true },
  { codigo: 'libra_cobre', serie: true },
  { codigo: 'bitcoin', serie: true },
  { codigo: 'utm', serie: false },
  { codigo: 'ipc', serie: false },
  { codigo: 'tpm', serie: false },
  { codigo: 'tasa_desempleo', serie: false },
];

// Trae el valor actual de todos los indicadores que nos interesan.
export async function fetchIndicadores() {
  const r = await fetch('https://mindicador.cl/api', { headers: UA });
  if (!r.ok) throw new Error(`mindicador respondio ${r.status}`);
  const data = await r.json();
  // Cada indicador viene como una propiedad con {codigo, nombre, unidad_medida, fecha, valor}.
  const salida = [];
  for (const { codigo } of INDICADORES) {
    const ind = data[codigo];
    if (!ind) continue;
    salida.push({
      codigo,
      nombre: ind.nombre,
      unidad: ind.unidad_medida,
      valor: ind.valor,
      fecha_dato: (ind.fecha || '').slice(0, 10) || null,
    });
  }
  return salida;
}

// Trae la serie historica de un indicador, para el sparkline y la variacion.
export async function fetchSerie(codigo, n = 14) {
  const r = await fetch(`https://mindicador.cl/api/${codigo}`, { headers: UA });
  if (!r.ok) throw new Error(`serie ${codigo} respondio ${r.status}`);
  const data = await r.json();
  // La serie llega del mas reciente al mas antiguo; tomamos n y la damos vuelta.
  const serie = (data.serie || []).slice(0, n).reverse();
  const valores = serie.map((p) => p.valor);
  const actual = valores.at(-1) ?? null;
  const previo = valores.at(-2) ?? null;
  let variacion = null;
  let variacionPct = null;
  if (actual != null && previo != null && previo !== 0) {
    variacion = actual - previo;
    variacionPct = (variacion / previo) * 100;
  }
  return { valores, variacion, variacionPct };
}

// Ultimos sismos (fuente: sismologia.cl a traves de boostr).
export async function fetchSismos(n = 5) {
  const r = await fetch('https://api.boostr.cl/earthquakes/recent.json', { headers: UA });
  if (!r.ok) throw new Error(`sismos respondio ${r.status}`);
  const data = await r.json();
  return (data.data || []).slice(0, n).map((s) => ({
    magnitud: parseFloat(s.magnitude),
    lugar: s.place,
    profundidad: s.depth,
    fecha: s.date,
    hora: (s.hour || '').slice(0, 5),
  }));
}

// Proximo feriado a partir de hoy.
export async function fetchProximoFeriado() {
  const r = await fetch('https://api.boostr.cl/holidays.json', { headers: UA });
  if (!r.ok) throw new Error(`feriados respondio ${r.status}`);
  const data = await r.json();
  const hoy = new Date().toISOString().slice(0, 10);
  const futuros = (data.data || [])
    .filter((f) => f.date >= hoy)
    .sort((a, b) => a.date.localeCompare(b.date));
  const f = futuros[0];
  if (!f) return null;
  const dias = Math.round((new Date(f.date) - new Date(hoy)) / 86400000);
  return { fecha: f.date, nombre: f.title, tipo: f.type, extra: f.extra, dias };
}
