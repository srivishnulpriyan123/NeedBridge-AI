import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 5433,
  database: process.env.DB_NAME || 'needbridge_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

export const query = (text, params) => pool.query(text, params);

export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version()');
    return {
      connected: true,
      time: res.rows[0].current_time,
      database: res.rows[0].db_name,
      version: res.rows[0].version
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message
    };
  }
};

export default {
  query,
  pool,
  testConnection
};

