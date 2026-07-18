// Genera el "resumen del dia" llamando directo a la API de Claude con fetch.
// Sin SDK a proposito: asi se ve exactamente como es el request HTTP.

const MODELO = 'claude-haiku-4-5-20251001';

// Arma el texto que le pasamos a Claude con los datos ya obtenidos.
function construirPrompt(ctx) {
  const lineas = ctx.indicadores
    .map((i) => `- ${i.nombre}: ${i.valor} ${i.unidad}`)
    .join('\n');
  const feriado = ctx.feriado
    ? `${ctx.feriado.nombre}, en ${ctx.feriado.dias} dias`
    : 'sin datos';

  return `Eres un analista que redacta el resumen del dia para un panel de indicadores de Chile.

Datos de hoy:
${lineas}
Proximo feriado: ${feriado}

Escribe un solo parrafo de 3 a 4 frases, en espanol de Chile, tono informativo y sobrio.
Reglas:
- Usa "tu", nunca "vos".
- No uses guiones largos (em-dash).
- No inventes cifras que no esten en los datos de arriba.
- No uses vinetas ni listas, solo un parrafo corrido.
- Empieza directo con lo mas relevante del dia (por ejemplo el dolar o la UF), sin saludos que dependan de la hora.`;
}

export async function generarResumen(ctx) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[resumen] sin ANTHROPIC_API_KEY: se omite el resumen');
    return null;
  }
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 400,
        messages: [{ role: 'user', content: construirPrompt(ctx) }],
      }),
    });
    if (!r.ok) {
      const detalle = await r.text();
      console.error('[resumen] Claude respondio', r.status, detalle.slice(0, 200));
      return null;
    }
    const data = await r.json();
    const texto = (data.content || []).map((b) => b.text || '').join('').trim();
    return texto ? { texto, modelo: MODELO } : null;
  } catch (e) {
    console.error('[resumen] error llamando a Claude:', e.message);
    return null;
  }
}
