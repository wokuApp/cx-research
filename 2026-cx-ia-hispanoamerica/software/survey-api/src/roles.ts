import type {Pool} from 'pg';
export async function provisionRoles(pool:Pool,passwords:{api:string;mail:string}):Promise<void> {
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    for(const [role,password] of [['research_api',passwords.api],['research_mail',passwords.mail]]) {
      if(password.length<12||password.length>128)throw new Error('Invalid runtime password length');
      const exists=await client.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[role]);
      // The identifiers are constants; the literal uses the driver's escaping, never raw interpolation.
      const literal=client.escapeLiteral(password);
      await client.query(`${exists.rowCount?'ALTER':'CREATE'} ROLE ${role} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD ${literal} CONNECTION LIMIT 12`);
      await client.query(`ALTER ROLE ${role} SET search_path = research, pg_catalog`);
      await client.query(`ALTER ROLE ${role} SET statement_timeout = '6000ms'`);
      await client.query(`ALTER ROLE ${role} SET idle_in_transaction_session_timeout = '10000ms'`);
      await client.query(`GRANT USAGE ON SCHEMA research TO ${role}`);
      await client.query(`REVOKE ALL ON ALL TABLES IN SCHEMA research FROM ${role}`);
    }
    await client.query(`
      GRANT SELECT ON research.study_state, research.contacts, research.responses, research.verification_tokens, research.mail_outbox, research.rate_limits TO research_api;
      GRANT INSERT ON research.contacts, research.responses, research.verification_tokens, research.mail_outbox, research.rate_limits TO research_api;
      GRANT UPDATE (completed,pilot_completed,updated_at) ON research.study_state TO research_api;
      GRANT UPDATE (verified_at,last_mail_at) ON research.contacts TO research_api;
      GRANT UPDATE (used_at) ON research.verification_tokens TO research_api;
      GRANT UPDATE (state,token_ciphertext,completed_at) ON research.mail_outbox TO research_api;
      GRANT UPDATE ON research.rate_limits TO research_api;
      GRANT SELECT ON research.contacts, research.verification_tokens, research.mail_outbox TO research_mail;
      GRANT UPDATE ON research.mail_outbox TO research_mail;
      GRANT SELECT,DELETE ON research.rate_limits TO research_mail;
    `);
    await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
}
