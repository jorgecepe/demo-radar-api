import Sparkline from './components/Sparkline';
import ThemeToggle from './components/ThemeToggle';
import { META, cap, formatoValor, formatoVariacion, severidadSismo, fechaLarga, cuandoSismo } from './lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://radar-api.luminaconsulting.ai';

// Traemos el panel desde la API del VPS. revalidate: 600 activa ISR: Vercel
// sirve una version cacheada y la refresca en segundo plano cada 10 minutos,
// asi el visitante nunca espera la llamada al VPS.
async function getData() {
  const res = await fetch(`${API}/api/dashboard`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`API respondio ${res.status}`);
  return res.json();
}

function RadarLogo() {
  return (
    <svg className="radar" viewBox="0 0 40 40" aria-hidden="true">
      <circle className="ring" cx="20" cy="20" r="17.5" />
      <circle className="ring" cx="20" cy="20" r="11.5" />
      <circle className="ring" cx="20" cy="20" r="5.5" />
      <line className="grid-l" x1="20" y1="2.5" x2="20" y2="37.5" />
      <line className="grid-l" x1="2.5" y1="20" x2="37.5" y2="20" />
      <g className="sweep">
        <line x1="20" y1="20" x2="20" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle className="blip" cx="28.5" cy="13.5" r="2.1" />
    </svg>
  );
}

export default async function Page() {
  let data = null;
  try {
    data = await getData();
  } catch (e) {
    data = null;
  }

  const hoy = cap(new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago',
  }));
  const actualizado = data?.actualizado
    ? new Date(data.actualizado).toLocaleTimeString('es-CL', {
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago',
      })
    : null;

  return (
    <div className="page">
      <header className="top">
        <div className="brand">
          <RadarLogo />
          <div>
            <h1>Radar Chile</h1>
            <span className="sub">Indicadores del país</span>
          </div>
        </div>
        <div className="top-right">
          <span className="date num">{hoy}</span>
          {actualizado && (
            <span className="stamp"><span className="dot" />Actualizado {actualizado}</span>
          )}
          <ThemeToggle />
        </div>
      </header>

      {!data ? (
        <section className="brief">
          <div className="eyebrow">Sin conexión</div>
          <p>No pudimos cargar los datos en este momento. Se reintenta solo en unos minutos.</p>
        </section>
      ) : (
        <>
          <section className="brief" aria-label="Resumen del día">
            <div className="eyebrow">
              Resumen del día <span className="by">· escrito por Claude</span>
            </div>
            <p>{data.resumen || 'El resumen del día se está generando. Vuelve en unos minutos.'}</p>
          </section>

          <div className="sec-label">Indicadores</div>
          <section className="grid-ind" aria-label="Indicadores económicos">
            {data.indicadores.map((ind) => {
              const m = META[ind.codigo] || {};
              const val = formatoValor(ind.codigo, ind.valor);
              const varia = formatoVariacion(ind.variacionPct);
              return (
                <article className="ind" key={ind.codigo}>
                  <div className="ind-head">
                    <span className="ind-name">{m.label || ind.nombre}</span>
                    <span className="ind-tag">{m.tag}</span>
                  </div>
                  <div className="ind-value num">
                    {val.prefijo && <span className="unit">{val.prefijo}</span>}
                    {val.texto}
                    {val.sufijo && <span className="unit" style={{ marginLeft: 2 }}>{val.sufijo}</span>}
                  </div>
                  <div className="ind-foot">
                    {varia ? (
                      <span className={`chg ${varia.signo} num`}>{varia.texto}</span>
                    ) : (
                      <span className="chg flat">{m.tag}</span>
                    )}
                    {ind.fecha_dato && <span className="chg-abs num">{ind.fecha_dato}</span>}
                  </div>
                  {Array.isArray(ind.valores) && <Sparkline valores={ind.valores} />}
                </article>
              );
            })}
          </section>

          <div className="row2">
            <div className="panel" aria-label="Próximo feriado">
              <h2>Próximo feriado</h2>
              {data.feriado ? (
                <div className="holy">
                  <span className="big">{data.feriado.nombre}</span>
                  <span className="cd num">en {data.feriado.dias} días</span>
                  <span className="when num">{fechaLarga(data.feriado.fecha)}</span>
                  <span className="kind">{data.feriado.extra || data.feriado.tipo}</span>
                </div>
              ) : (
                <p className="chg-abs">Sin datos de feriados.</p>
              )}
            </div>

            <div className="panel" aria-label="Últimos sismos">
              <h2>Últimos sismos</h2>
              <div className="quakes">
                {(data.sismos || []).map((s, i) => (
                  <div className="q" key={i}>
                    <span className={`mag ${severidadSismo(s.magnitud)} num`}>
                      {Number(s.magnitud).toFixed(1).replace('.', ',')}
                    </span>
                    <span>
                      <span className="place">{s.lugar}</span>
                      <span className="meta num">{s.profundidad} de profundidad</span>
                    </span>
                    <span className="time">{cuandoSismo(s.fecha, s.hora)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <footer>
        <span className="src">Fuentes: <b>mindicador.cl</b> · <b>api.boostr.cl</b></span>
        <span className="preview-flag">Datos en vivo · resumen por Claude</span>
      </footer>
    </div>
  );
}
