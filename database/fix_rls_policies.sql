-- Script pour désactiver RLS temporairement et permettre les insertions anonymes
-- ⚠️ À UTILISER UNIQUEMENT EN DÉVELOPPEMENT

-- Désactiver RLS sur les tables principales
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE seaweed_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_cycles DISABLE ROW LEVEL SECURITY;

-- Créer des policies permissives pour le mode anonyme (DEV SEULEMENT)
-- Sites
CREATE POLICY "Allow anonymous insert on sites" ON sites
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on sites" ON sites
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on sites" ON sites
  FOR DELETE TO anon
  USING (true);

-- Employees
CREATE POLICY "Allow anonymous insert on employees" ON employees
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on employees" ON employees
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on employees" ON employees
  FOR DELETE TO anon
  USING (true);

-- Farmers
CREATE POLICY "Allow anonymous insert on farmers" ON farmers
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on farmers" ON farmers
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on farmers" ON farmers
  FOR DELETE TO anon
  USING (true);

-- Service Providers
CREATE POLICY "Allow anonymous insert on service_providers" ON service_providers
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on service_providers" ON service_providers
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on service_providers" ON service_providers
  FOR DELETE TO anon
  USING (true);

-- Credit Types
CREATE POLICY "Allow anonymous insert on credit_types" ON credit_types
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on credit_types" ON credit_types
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on credit_types" ON credit_types
  FOR DELETE TO anon
  USING (true);

-- Seaweed Types
CREATE POLICY "Allow anonymous insert on seaweed_types" ON seaweed_types
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on seaweed_types" ON seaweed_types
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on seaweed_types" ON seaweed_types
  FOR DELETE TO anon
  USING (true);

-- Modules
CREATE POLICY "Allow anonymous insert on modules" ON modules
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on modules" ON modules
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on modules" ON modules
  FOR DELETE TO anon
  USING (true);

-- Cultivation Cycles
CREATE POLICY "Allow anonymous insert on cultivation_cycles" ON cultivation_cycles
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on cultivation_cycles" ON cultivation_cycles
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on cultivation_cycles" ON cultivation_cycles
  FOR DELETE TO anon
  USING (true);

-- Réactiver RLS (avec les policies permissives ci-dessus)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE seaweed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_cycles ENABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('sites', 'employees', 'farmers', 'modules', 'seaweed_types');
