// Metadatos de presentacion por indicador: etiqueta corta, periodicidad,
// tipo de unidad y cuantos decimales mostrar.
export const META = {
  uf:             { label: 'UF',              tag: 'diaria',         unidad: 'peso', dec: 2 },
  dolar:          { label: 'Dólar observado', tag: 'diario',         unidad: 'peso', dec: 2 },
  euro:           { label: 'Euro',            tag: 'diario',         unidad: 'peso', dec: 2 },
  libra_cobre:    { label: 'Cobre',           tag: 'libra · diario', unidad: 'usd',  dec: 2 },
  bitcoin:        { label: 'Bitcoin',         tag: 'diario',         unidad: 'usd',  dec: 0 },
  utm:            { label: 'UTM',             tag: 'mensual',        unidad: 'peso', dec: 0 },
  ipc:            { label: 'IPC',             tag: 'mensual',        unidad: 'pct',  dec: 1 },
  tpm:            { label: 'TPM',             tag: 'política',       unidad: 'pct',  dec: 2 },
  tasa_desempleo: { label: 'Desempleo',       tag: 'trimestral',     unidad: 'pct',  dec: 2 },
};

const nf = (dec) =>
  new Intl.NumberFormat('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec });

// Devuelve {prefijo, texto, sufijo} listos para pintar el valor.
export function formatoValor(codigo, valor) {
  const m = META[codigo] || { unidad: 'peso', dec: 2 };
  if (valor == null) return { prefijo: '', texto: '--', sufijo: '' };
  const texto = nf(m.dec).format(valor);
  if (m.unidad === 'usd') return { prefijo: 'US$', texto, sufijo: '' };
  if (m.unidad === 'pct') return { prefijo: '', texto, sufijo: '%' };
  return { prefijo: '$', texto, sufijo: '' };
}

// Chip de variacion diaria: direccion (up/down/flat) y texto con flecha.
export function formatoVariacion(pct) {
  if (pct == null) return null;
  const signo = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
  const flecha = pct > 0 ? '▲' : pct < 0 ? '▼' : '■';
  const abs = nf(2).format(Math.abs(pct));
  return { signo, texto: `${flecha} ${abs}%` };
}

// Severidad de un sismo por magnitud, para el color del chip.
export function severidadSismo(mag) {
  const m = Number(mag);
  if (!isFinite(m) || m < 4) return 'low';
  if (m < 5.5) return 'mid';
  return 'high';
}

// Capitaliza solo la primera letra, sin tocar el resto.
export function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Fecha en formato largo chileno. Para fechas puras (YYYY-MM-DD) fijamos
// mediodia UTC para que la zona horaria no corra el dia.
export function fechaLarga(iso, tz = 'America/Santiago') {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00Z` : iso);
  return cap(d.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz,
  }));
}

// "hoy 05:12", "ayer 22:03" o "15-08 09:20" para un sismo.
export function cuandoSismo(fecha, hora) {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
  const ayer = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', {
    timeZone: 'America/Santiago',
  });
  if (fecha === hoy) return `hoy ${hora}`;
  if (fecha === ayer) return `ayer ${hora}`;
  const p = String(fecha).split('-');
  return p.length === 3 ? `${p[2]}-${p[1]} ${hora}` : `${fecha} ${hora}`;
}
