// Capa de acceso a Postgres. Un solo pool reutilizable para toda la app.
import pg from 'pg';

const { Pool } = pg;

// La URL de conexion viene del entorno (la define docker-compose).
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Crea las tablas si no existen. Se llama una vez al arrancar.
export async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS indicadores (
      id          SERIAL PRIMARY KEY,
      captura_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      codigo      TEXT NOT NULL,
      nombre      TEXT,
      unidad      TEXT,
      valor       DOUBLE PRECISION,
      fecha_dato  DATE
    );
    CREATE INDEX IF NOT EXISTS idx_ind_codigo_captura
      ON indicadores (codigo, captura_at DESC);

    CREATE TABLE IF NOT EXISTS resumenes (
      id         SERIAL PRIMARY KEY,
      creado_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      fecha      DATE NOT NULL,
      texto      TEXT NOT NULL,
      modelo     TEXT
    );
  `);
}

// Guarda un snapshot de todos los indicadores de una captura.
export async function guardarSnapshot(indicadores) {
  for (const it of indicadores) {
    await pool.query(
      `INSERT INTO indicadores (codigo, nombre, unidad, valor, fecha_dato)
       VALUES ($1, $2, $3, $4, $5)`,
      [it.codigo, it.nombre, it.unidad, it.valor, it.fecha_dato]
    );
  }
}

// Guarda el resumen del dia generado por Claude.
export async function guardarResumen(texto, modelo) {
  await pool.query(
    `INSERT INTO resumenes (fecha, texto, modelo) VALUES (CURRENT_DATE, $1, $2)`,
    [texto, modelo]
  );
}

// Devuelve el resumen mas reciente (o null si aun no hay).
export async function ultimoResumen() {
  const { rows } = await pool.query(
    `SELECT texto, creado_at, modelo FROM resumenes ORDER BY creado_at DESC LIMIT 1`
  );
  return rows[0] || null;
}
