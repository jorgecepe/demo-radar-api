// El cron que mantiene los datos frescos. Corre cada 6 horas.
import cron from 'node-cron';
import { fetchIndicadores, fetchProximoFeriado } from './sources.js';
import { generarResumen } from './resumen.js';
import { guardarSnapshot, guardarResumen } from './db.js';

// Un ciclo completo: captura indicadores, los guarda y genera el resumen.
export async function ejecutarCiclo() {
  console.log('[cron] ejecutando ciclo de actualizacion...');
  const indicadores = await fetchIndicadores();
  await guardarSnapshot(indicadores);

  const feriado = await fetchProximoFeriado().catch(() => null);
  const res = await generarResumen({ indicadores, feriado });
  if (res) {
    await guardarResumen(res.texto, res.modelo);
    console.log('[cron] resumen generado y guardado');
  }
  console.log(`[cron] ciclo listo: ${indicadores.length} indicadores capturados`);
}

// Programa el ciclo cada 6 horas y corre uno al arrancar si no hay resumen aun.
export function programarCron() {
  cron.schedule('0 */6 * * *', () => {
    ejecutarCiclo().catch((e) => console.error('[cron] fallo el ciclo:', e.message));
  });

  // Al arrancar ejecutamos un ciclo siempre, para tener datos y resumen frescos.
  // Asi, reiniciar el contenedor equivale a forzar una actualizacion del radar.
  ejecutarCiclo().catch((e) => console.error('[cron] error en el arranque:', e.message));
}
