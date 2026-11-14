import type {Pool} from 'pg';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function migrate(pool: Pool): Promise<void> {
  const sql=await readFile(new URL('./migrations/001.sql',import.meta.url),'utf8');
  const checksum=createHash('sha256').update(sql).digest('hex');
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('research-migrations'))");
    await client.query('CREATE SCHEMA IF NOT EXISTS research');
    await client.query('CREATE TABLE IF NOT EXISTS research.schema_migrations (version integer PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const existing=await client.query('SELECT checksum FROM research.schema_migrations WHERE version=1');
    if(existing.rowCount && existing.rows[0].checksum!==checksum) throw new Error('Applied migration checksum changed');
    if(!existing.rowCount) {await client.query(sql); await client.query('INSERT INTO research.schema_migrations(version,checksum) VALUES(1,$1)',[checksum]);}
    await client.query("INSERT INTO research.study_state(id,instrument_version) VALUES('ia-cx-2026','0.6') ON CONFLICT DO NOTHING");
    await client.query('COMMIT');
  } catch(error) {await client.query('ROLLBACK');throw error;}
  finally {client.release();}
}
