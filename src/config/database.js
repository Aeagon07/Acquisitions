import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (process.env.NEON_LOCAL === 'true') {
  const neonLocalHost = process.env.NEON_LOCAL_HOST || 'neon-local';
  const neonLocalPort = process.env.NEON_LOCAL_PORT || '5432';

  neonConfig.fetchEndpoint =
    process.env.NEON_LOCAL_FETCH_ENDPOINT ||
    `http://${neonLocalHost}:${neonLocalPort}/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(databaseUrl);

const db = drizzle(sql);

export { db, sql };
export default { db, sql };
