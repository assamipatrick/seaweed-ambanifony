-- ============================================
-- SIMPLE RLS POLICIES (Pour démarrage rapide)
-- SeaFarm Monitoring Application
-- Version simplifiée sans authentification requise
-- ============================================

-- NOTE: Cette version permet l'accès complet pour le développement
-- Utilisez rls_policies.sql pour la production avec authentification

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
-- PERMISSIVE POLICIES FOR DEVELOPMENT
-- ============================================

-- Allow all operations for authenticated users (development mode)
-- ⚠️ ATTENTION: Remplacez par des politiques plus strictes en production !

-- App Settings
CREATE POLICY "Allow all access to app_settings" ON app_settings FOR ALL USING (true);

-- Roles
CREATE POLICY "Allow all access to roles" ON roles FOR ALL USING (true);

-- Users
CREATE POLICY "Allow all access to users" ON users FOR ALL USING (true);

-- Invitations
CREATE POLICY "Allow all access to invitations" ON invitations FOR ALL USING (true);

-- Configuration Tables
CREATE POLICY "Allow all access to incident_types" ON incident_types FOR ALL USING (true);
CREATE POLICY "Allow all access to incident_severities" ON incident_severities FOR ALL USING (true);
CREATE POLICY "Allow all access to seaweed_types" ON seaweed_types FOR ALL USING (true);
CREATE POLICY "Allow all access to seaweed_price_history" ON seaweed_price_history FOR ALL USING (true);
CREATE POLICY "Allow all access to credit_types" ON credit_types FOR ALL USING (true);

-- Sites and Zones
CREATE POLICY "Allow all access to sites" ON sites FOR ALL USING (true);
CREATE POLICY "Allow all access to zones" ON zones FOR ALL USING (true);

-- Stakeholders
CREATE POLICY "Allow all access to employees" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all access to farmers" ON farmers FOR ALL USING (true);
CREATE POLICY "Allow all access to service_providers" ON service_providers FOR ALL USING (true);

-- Modules
CREATE POLICY "Allow all access to modules" ON modules FOR ALL USING (true);

-- Operations
CREATE POLICY "Allow all access to cutting_operations" ON cutting_operations FOR ALL USING (true);
CREATE POLICY "Allow all access to cultivation_cycles" ON cultivation_cycles FOR ALL USING (true);

-- Inventory
CREATE POLICY "Allow all access to stock_movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Allow all access to farmer_deliveries" ON farmer_deliveries FOR ALL USING (true);
CREATE POLICY "Allow all access to pressing_slips" ON pressing_slips FOR ALL USING (true);
CREATE POLICY "Allow all access to pressed_stock_movements" ON pressed_stock_movements FOR ALL USING (true);
CREATE POLICY "Allow all access to export_documents" ON export_documents FOR ALL USING (true);
CREATE POLICY "Allow all access to export_containers" ON export_containers FOR ALL USING (true);
CREATE POLICY "Allow all access to site_transfers" ON site_transfers FOR ALL USING (true);

-- Financial
CREATE POLICY "Allow all access to farmer_credits" ON farmer_credits FOR ALL USING (true);
CREATE POLICY "Allow all access to repayments" ON repayments FOR ALL USING (true);
CREATE POLICY "Allow all access to monthly_payments" ON monthly_payments FOR ALL USING (true);

-- Monitoring
CREATE POLICY "Allow all access to incidents" ON incidents FOR ALL USING (true);
CREATE POLICY "Allow all access to periodic_tests" ON periodic_tests FOR ALL USING (true);
CREATE POLICY "Allow all access to pest_observations" ON pest_observations FOR ALL USING (true);

-- Communication
CREATE POLICY "Allow all access to message_logs" ON message_logs FOR ALL USING (true);
CREATE POLICY "Allow all access to gallery_photos" ON gallery_photos FOR ALL USING (true);

-- ============================================
-- END OF SIMPLE POLICIES
-- ============================================

-- Note: Pour activer les politiques de sécurité complètes :
-- 1. Supprimez ces politiques simples
-- 2. Exécutez le fichier rls_policies.sql
