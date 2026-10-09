"""Integration checks against ORIGINAL continuum2 SQL on local PostgreSQL only."""
import json,re,unittest
from pathlib import Path
import psycopg
DSN='host=127.0.0.1 port=55432 dbname=postgres user=localtest'
SOURCE=Path(__file__).resolve().parents[1]/'sources/continuum2/packages/coordinator/migrations/0001_continuum_initial.sql'
class OriginalSQLTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.c=psycopg.connect(DSN,autocommit=True,options="-c client_encoding=UTF8");cls.c.execute('DROP SCHEMA IF EXISTS prototype_check CASCADE;CREATE SCHEMA prototype_check;SET search_path=prototype_check,public');cls.c.execute(SOURCE.read_text())
  cls.c.execute("INSERT INTO principals(principal_id,tenant_id,display_name,owner_user_id,status) VALUES('pA','tenantA','A','ownerA','ACTIVE'),('pB','tenantB','B','ownerB','ACTIVE')")
  cls.c.execute('DROP ROLE IF EXISTS prototype_runtime;CREATE ROLE prototype_runtime NOSUPERUSER NOBYPASSRLS;GRANT USAGE ON SCHEMA prototype_check TO prototype_runtime;GRANT SELECT,INSERT ON ALL TABLES IN SCHEMA prototype_check TO prototype_runtime')
 @classmethod
 def tearDownClass(cls):cls.c.execute('RESET ROLE;DROP SCHEMA prototype_check CASCADE;DROP ROLE prototype_runtime');cls.c.close()
 def test_original_set_local_placeholder_is_syntax_error(self):
  with self.assertRaises(psycopg.errors.SyntaxError):self.c.execute('SET LOCAL app.current_tenant = %s',('tenantA',))
 def test_original_revoke_parameter_number_is_invalid(self):
  self.c.execute("PREPARE broken_revoke(text) AS UPDATE authority_grants SET status='REVOKED',version=version+1 WHERE authority_id=$2 AND status='ACTIVE' RETURNING *")
  with self.assertRaises(psycopg.Error):self.c.execute("EXECUTE broken_revoke('g')")
 def test_owner_bypasses_unforced_rls(self):
  self.c.execute("SELECT set_config('app.current_tenant','tenantA',false)");rows=self.c.execute('SELECT tenant_id FROM principals ORDER BY tenant_id').fetchall();self.assertEqual(len(rows),2)
 def test_normal_role_can_select_other_tenant_by_changing_guc(self):
  try:
   self.c.execute('SET ROLE prototype_runtime');self.c.execute("SELECT set_config('app.current_tenant','tenantA',false)");self.assertEqual(self.c.execute('SELECT tenant_id FROM principals').fetchall(),[('tenantA',)])
   self.c.execute("SELECT set_config('app.current_tenant','tenantB',false)");self.assertEqual(self.c.execute('SELECT tenant_id FROM principals').fetchall(),[('tenantB',)])
  finally:self.c.execute('RESET ROLE')
 def test_cross_tenant_reference_not_rejected_by_original_fk(self):
  self.c.execute("INSERT INTO tasks(task_id,tenant_id,principal_id,status) VALUES('crossTenant','tenantA','pB','READY')");self.assertEqual(self.c.execute("SELECT principal_id FROM tasks WHERE task_id='crossTenant'").fetchone()[0],'pB')
if __name__=='__main__':unittest.main(verbosity=2)
