// Mini-tendencia. Se renderiza en el servidor (sin JS de cliente) a partir
// de la serie de valores. viewBox fijo que el CSS estira al ancho de la card.
export default function Sparkline({ valores }) {
  if (!Array.isArray(valores) || valores.length < 2) return null;

  const W = 200;
  const H = 34;
  const P = 3;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rng = max - min || 1;

  const pts = valores.map((v, i) => {
    const x = P + (i * (W - 2 * P)) / (valores.length - 1);
    const y = H - P - ((v - min) / rng) * (H - 2 * P);
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
  });

  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `${P},${H - P} ${line} ${W - P},${H - P}`;
  const last = pts[pts.length - 1];

  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <polygon className="spark-area" points={area} />
      <polyline className="spark-line" points={line} vectorEffect="non-scaling-stroke" />
      <circle className="spark-dot" cx={last[0]} cy={last[1]} r="2.4" />
    </svg>
  );
}
