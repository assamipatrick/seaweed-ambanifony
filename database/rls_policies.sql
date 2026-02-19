-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- SeaFarm Monitoring Application
-- Fixed version for Supabase
-- ============================================

-- Enable RLS on all tables
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_severities ENABLE ROW LEVEL SECURITY;
ALTER TABLE seaweed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE seaweed_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutting_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pressing_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE pressed_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR RLS (in public schema)
-- ============================================

-- Function to get current user's ID from Supabase auth
CREATE OR REPLACE FUNCTION public.get_current_user_id() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS TEXT AS $$
  SELECT role_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND permission_name = ANY(r.permissions)
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to get user's site (if site manager)
CREATE OR REPLACE FUNCTION public.get_user_site() RETURNS UUID AS $$
  SELECT s.id
  FROM public.sites s
  WHERE s.manager_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================
-- APP SETTINGS POLICIES (Public read, Admin write)
-- ============================================
CREATE POLICY "Everyone can read app settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Admin can update app settings" ON app_settings FOR UPDATE USING (public.has_permission('SETTINGS_GENERAL_MANAGE'));

-- ============================================
-- ROLES POLICIES
-- ============================================
CREATE POLICY "Everyone can read roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Admin can manage roles" ON roles FOR ALL USING (public.has_permission('ROLES_MANAGE'));

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (id = auth.uid() OR public.has_permission('USERS_VIEW'));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can manage users" ON users FOR ALL USING (public.has_permission('USERS_VIEW'));

-- ============================================
-- INVITATIONS POLICIES
-- ============================================
CREATE POLICY "Admin can view invitations" ON invitations FOR SELECT USING (public.has_permission('USERS_INVITE'));
CREATE POLICY "Admin can create invitations" ON invitations FOR INSERT WITH CHECK (public.has_permission('USERS_INVITE'));
CREATE POLICY "Admin can update invitations" ON invitations FOR UPDATE USING (public.has_permission('USERS_INVITE'));

-- ============================================
-- CONFIGURATION TABLES POLICIES
-- ============================================
CREATE POLICY "Everyone can read incident types" ON incident_types FOR SELECT USING (true);
CREATE POLICY "Admin can manage incident types" ON incident_types FOR ALL USING (public.has_permission('SETTINGS_GENERAL_MANAGE'));

CREATE POLICY "Everyone can read incident severities" ON incident_severities FOR SELECT USING (true);
CREATE POLICY "Admin can manage incident severities" ON incident_severities FOR ALL USING (public.has_permission('SETTINGS_GENERAL_MANAGE'));

CREATE POLICY "Everyone can read seaweed types" ON seaweed_types FOR SELECT USING (true);
CREATE POLICY "Admin can manage seaweed types" ON seaweed_types FOR ALL USING (public.has_permission('SETTINGS_GENERAL_MANAGE'));

CREATE POLICY "Everyone can read seaweed price history" ON seaweed_price_history FOR SELECT USING (true);
CREATE POLICY "Admin can manage seaweed price history" ON seaweed_price_history FOR ALL USING (public.has_permission('SETTINGS_GENERAL_MANAGE'));

CREATE POLICY "Everyone can read credit types" ON credit_types FOR SELECT USING (true);
CREATE POLICY "Admin can manage credit types" ON credit_types FOR ALL USING (public.has_permission('SETTINGS_GENERAL_MANAGE'));

-- ============================================
-- SITES AND ZONES POLICIES
-- ============================================
CREATE POLICY "Everyone can read sites" ON sites FOR SELECT USING (public.has_permission('SITES_VIEW'));
CREATE POLICY "Admin can manage sites" ON sites FOR ALL USING (public.has_permission('SITES_MANAGE'));

CREATE POLICY "Everyone can read zones" ON zones FOR SELECT USING (public.has_permission('SITES_VIEW'));
CREATE POLICY "Admin can manage zones" ON zones FOR ALL USING (public.has_permission('SITES_MANAGE'));

-- ============================================
-- STAKEHOLDERS POLICIES
-- ============================================
CREATE POLICY "Authorized users can read employees" ON employees FOR SELECT USING (public.has_permission('STAKEHOLDERS_VIEW'));
CREATE POLICY "Admin can manage employees" ON employees FOR ALL USING (public.has_permission('EMPLOYEES_MANAGE'));

CREATE POLICY "Authorized users can read farmers" ON farmers FOR SELECT USING (public.has_permission('STAKEHOLDERS_VIEW'));
CREATE POLICY "Admin can manage farmers" ON farmers FOR ALL USING (public.has_permission('FARMERS_MANAGE'));

CREATE POLICY "Authorized users can read service providers" ON service_providers FOR SELECT USING (public.has_permission('STAKEHOLDERS_VIEW'));
CREATE POLICY "Admin can manage service providers" ON service_providers FOR ALL USING (public.has_permission('EMPLOYEES_MANAGE'));

-- ============================================
-- MODULES POLICIES
-- ============================================
CREATE POLICY "Authorized users can read modules" ON modules FOR SELECT USING (public.has_permission('MODULES_VIEW'));
CREATE POLICY "Admin can manage modules" ON modules FOR ALL USING (public.has_permission('MODULES_MANAGE'));

-- ============================================
-- OPERATIONS POLICIES
-- ============================================
CREATE POLICY "Authorized users can read cutting operations" ON cutting_operations 
  FOR SELECT USING (public.has_permission('OPERATIONS_VIEW'));
CREATE POLICY "Operations staff can manage cutting operations" ON cutting_operations 
  FOR ALL USING (public.has_permission('OPERATIONS_VIEW'));

CREATE POLICY "Authorized users can read cultivation cycles" ON cultivation_cycles 
  FOR SELECT USING (public.has_permission('CYCLES_VIEW'));
CREATE POLICY "Operations staff can manage cycles" ON cultivation_cycles 
  FOR ALL USING (public.has_permission('CYCLES_MANAGE'));

-- ============================================
-- INVENTORY POLICIES
-- ============================================
CREATE POLICY "Authorized users can read stock movements" ON stock_movements 
  FOR SELECT USING (public.has_permission('INVENTORY_VIEW'));
CREATE POLICY "Inventory managers can create stock movements" ON stock_movements 
  FOR INSERT WITH CHECK (public.has_permission('INVENTORY_MANAGE_ON_SITE'));

CREATE POLICY "Authorized users can read farmer deliveries" ON farmer_deliveries 
  FOR SELECT USING (public.has_permission('INVENTORY_VIEW'));
CREATE POLICY "Inventory managers can manage farmer deliveries" ON farmer_deliveries 
  FOR ALL USING (public.has_permission('INVENTORY_MANAGE_ON_SITE'));

CREATE POLICY "Authorized users can read pressing slips" ON pressing_slips 
  FOR SELECT USING (public.has_permission('INVENTORY_VIEW'));
CREATE POLICY "Inventory managers can manage pressing slips" ON pressing_slips 
  FOR ALL USING (public.has_permission('INVENTORY_MANAGE_ON_SITE'));

CREATE POLICY "Authorized users can read pressed stock movements" ON pressed_stock_movements 
  FOR SELECT USING (public.has_permission('INVENTORY_VIEW'));
CREATE POLICY "Inventory managers can create pressed stock movements" ON pressed_stock_movements 
  FOR INSERT WITH CHECK (public.has_permission('INVENTORY_MANAGE_ON_SITE'));

CREATE POLICY "Authorized users can read export documents" ON export_documents 
  FOR SELECT USING (public.has_permission('INVENTORY_VIEW'));
CREATE POLICY "Export managers can manage export documents" ON export_documents 
  FOR ALL USING (public.has_permission('EXPORTS_MANAGE'));

CREATE POLICY "Authorized users can read export containers" ON export_containers 
  FOR SELECT USING (public.has_permission('INVENTORY_VIEW'));
CREATE POLICY "Export managers can manage export containers" ON export_containers 
  FOR ALL USING (public.has_permission('EXPORTS_MANAGE'));

CREATE POLICY "Authorized users can read site transfers" ON site_transfers 
  FOR SELECT USING (public.has_permission('INVENTORY_VIEW'));
CREATE POLICY "Inventory managers can manage site transfers" ON site_transfers 
  FOR ALL USING (public.has_permission('INVENTORY_MANAGE_ON_SITE'));

-- ============================================
-- FINANCIAL POLICIES
-- ============================================
CREATE POLICY "Authorized users can read farmer credits" ON farmer_credits 
  FOR SELECT USING (public.has_permission('CREDITS_VIEW'));
CREATE POLICY "Credit managers can manage farmer credits" ON farmer_credits 
  FOR ALL USING (public.has_permission('CREDITS_MANAGE'));

CREATE POLICY "Authorized users can read repayments" ON repayments 
  FOR SELECT USING (public.has_permission('PAYMENTS_VIEW'));
CREATE POLICY "Payment managers can manage repayments" ON repayments 
  FOR ALL USING (public.has_permission('PAYMENTS_MANAGE'));

CREATE POLICY "Authorized users can read monthly payments" ON monthly_payments 
  FOR SELECT USING (public.has_permission('PAYROLL_VIEW'));
CREATE POLICY "Payment managers can manage monthly payments" ON monthly_payments 
  FOR ALL USING (public.has_permission('PAYROLL_MANAGE'));

-- ============================================
-- MONITORING POLICIES
-- ============================================
CREATE POLICY "Authorized users can read incidents" ON incidents 
  FOR SELECT USING (public.has_permission('MONITORING_VIEW'));
CREATE POLICY "Managers can manage incidents" ON incidents 
  FOR ALL USING (public.has_permission('INCIDENTS_MANAGE'));

CREATE POLICY "Authorized users can read periodic tests" ON periodic_tests 
  FOR SELECT USING (public.has_permission('MONITORING_VIEW'));
CREATE POLICY "Everyone can create periodic tests" ON periodic_tests 
  FOR INSERT WITH CHECK (public.has_permission('MONITORING_VIEW'));
CREATE POLICY "Conductor can update own tests" ON periodic_tests 
  FOR UPDATE USING (conductor_id = auth.uid() OR public.has_permission('INCIDENTS_MANAGE'));

CREATE POLICY "Authorized users can read pest observations" ON pest_observations 
  FOR SELECT USING (public.has_permission('MONITORING_VIEW'));
CREATE POLICY "Everyone can create pest observations" ON pest_observations 
  FOR INSERT WITH CHECK (public.has_permission('MONITORING_VIEW'));

-- ============================================
-- COMMUNICATION POLICIES
-- ============================================
CREATE POLICY "Authorized users can read message logs" ON message_logs 
  FOR SELECT USING (public.has_permission('DASHBOARD_VIEW'));
CREATE POLICY "Users can create message logs" ON message_logs 
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ============================================
-- GALLERY POLICIES
-- ============================================
CREATE POLICY "Authorized users can read gallery photos" ON gallery_photos 
  FOR SELECT USING (public.has_permission('GALLERY_VIEW'));
CREATE POLICY "Gallery managers can manage photos" ON gallery_photos 
  FOR ALL USING (public.has_permission('GALLERY_MANAGE'));

-- ============================================
-- BYPASS RLS FOR SERVICE ROLE (for server-side operations)
-- ============================================
-- Note: Service role automatically bypasses RLS in Supabase
-- This is for administrative operations and data migrations

-- ============================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_site() TO authenticated;
