-- ============================================
-- SEED DATA FOR INITIAL SETUP
-- SeaFarm Monitoring Application
-- ============================================

-- ============================================
-- DEFAULT ROLES
-- ============================================

INSERT INTO roles (id, name, permissions, is_default) VALUES
('SITE_MANAGER', 'Site Manager (Admin)', ARRAY[
    'DASHBOARD_VIEW', 'OPERATIONS_VIEW', 'INVENTORY_VIEW', 'STAKEHOLDERS_VIEW',
    'MONITORING_VIEW', 'REPORTS_VIEW', 'SETTINGS_VIEW', 'USERS_VIEW',
    'ROLES_VIEW', 'SITES_VIEW', 'MODULES_VIEW', 'SITES_MANAGE',
    'MODULES_MANAGE', 'EMPLOYEES_MANAGE', 'FARMERS_MANAGE', 'INCIDENTS_MANAGE',
    'SETTINGS_GENERAL_MANAGE', 'ROLES_MANAGE', 'USERS_INVITE', 'PAYMENTS_MANAGE',
    'CREDITS_MANAGE', 'PAYROLL_MANAGE', 'INVENTORY_MANAGE_ON_SITE',
    'EXPORTS_MANAGE', 'GALLERY_VIEW', 'GALLERY_MANAGE'
], true),

('OPERATIONS_LEAD', 'Operations Lead', ARRAY[
    'DASHBOARD_VIEW', 'OPERATIONS_VIEW', 'FARM_MAP_VIEW',
    'OPERATIONAL_CALENDAR_VIEW', 'CYCLES_VIEW', 'CYCLES_MANAGE',
    'HARVESTING_VIEW', 'HARVESTING_MANAGE', 'DRYING_VIEW', 'DRYING_MANAGE',
    'BAGGING_VIEW', 'BAGGING_MANAGE', 'MODULES_VIEW', 'SITES_VIEW', 'GALLERY_VIEW'
], true),

('ACCOUNTANT', 'Accountant', ARRAY[
    'DASHBOARD_VIEW', 'STAKEHOLDERS_VIEW', 'PAYMENTS_VIEW', 'PAYMENTS_MANAGE',
    'CREDITS_VIEW', 'CREDITS_MANAGE', 'PAYROLL_VIEW', 'PAYROLL_MANAGE', 'REPORTS_VIEW'
], true),

('FIELD_SUPERVISOR', 'Field Supervisor', ARRAY[
    'DASHBOARD_VIEW', 'OPERATIONS_VIEW', 'FARM_MAP_VIEW',
    'CYCLES_VIEW', 'MODULES_VIEW', 'SITES_VIEW', 'MONITORING_VIEW'
], true),

('WAREHOUSE_MANAGER', 'Warehouse Manager', ARRAY[
    'DASHBOARD_VIEW', 'INVENTORY_VIEW', 'INVENTORY_MANAGE_ON_SITE',
    'REPORTS_VIEW'
], true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  permissions = EXCLUDED.permissions;

-- ============================================
-- DEFAULT ADMIN USER
-- ============================================
-- Password: 'password' (hashed with bcrypt)
-- Note: In production, change this password immediately!

INSERT INTO users (id, email, password_hash, first_name, last_name, role_id)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
  'admin@seafarm.com',
  '$2a$10$rJK3K1fg8xrC.7ULpTQbA.VZhDqcCqBqJX5kqN.W6SQU8Q0dEHrLe', -- 'password'
  'Admin',
  'User',
  'SITE_MANAGER'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- DEFAULT INCIDENT TYPES
-- ============================================

INSERT INTO incident_types (id, name, is_default) VALUES
('ENVIRONMENTAL', 'Environmental', true),
('EQUIPMENT_FAILURE', 'Equipment Failure', true),
('PEST_DISEASE', 'Pest/Disease', true),
('SECURITY', 'Security', true),
('WEATHER', 'Weather', true),
('THEFT', 'Theft', true),
('OTHER', 'Other', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- ============================================
-- DEFAULT INCIDENT SEVERITIES
-- ============================================

INSERT INTO incident_severities (id, name, is_default) VALUES
('LOW', 'Low', true),
('MEDIUM', 'Medium', true),
('HIGH', 'High', true),
('CRITICAL', 'Critical', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- ============================================
-- DEFAULT SEAWEED TYPES
-- ============================================

INSERT INTO seaweed_types (id, name, scientific_name, description, wet_price, dry_price)
VALUES 
(
  'e1a1b2c3-d4e5-4f6a-b7c8-d9e0f1a2b3c4'::UUID,
  'Cottonii',
  'Kappaphycus alvarezii',
  'Red seaweed species commonly cultivated for carrageenan production',
  800.00,
  5000.00
),
(
  'f2b2c3d4-e5f6-5a7b-c8d9-e0f1a2b3c4d5'::UUID,
  'Spinosum',
  'Eucheuma denticulatum',
  'Red seaweed species rich in carrageenan',
  750.00,
  4800.00
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  scientific_name = EXCLUDED.scientific_name,
  description = EXCLUDED.description,
  wet_price = EXCLUDED.wet_price,
  dry_price = EXCLUDED.dry_price;

-- ============================================
-- DEFAULT CREDIT TYPES
-- ============================================

INSERT INTO credit_types (id, name, has_quantity, unit, has_unit_price, is_direct_amount)
VALUES
(
  'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f'::UUID,
  'Rice',
  true,
  'Kg',
  true,
  false
),
(
  'd2e3f4a5-b6c7-5d8e-9f0a-1b2c3d4e5f6a'::UUID,
  'Cash Advance',
  false,
  NULL,
  false,
  true
),
(
  'e3f4a5b6-c7d8-6e9f-0a1b-2c3d4e5f6a7b'::UUID,
  'Tools',
  false,
  NULL,
  false,
  true
),
(
  'f4a5b6c7-d8e9-7f0a-1b2c-3d4e5f6a7b8c'::UUID,
  'Fuel',
  true,
  'Liters',
  true,
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  has_quantity = EXCLUDED.has_quantity,
  unit = EXCLUDED.unit,
  has_unit_price = EXCLUDED.has_unit_price,
  is_direct_amount = EXCLUDED.is_direct_amount;

-- ============================================
-- SAMPLE SITE (Optional - comment out if not needed)
-- ============================================

INSERT INTO sites (id, name, code, location, manager_id)
VALUES (
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::UUID,
  'Main Farm Site',
  'MFS',
  'Coastal Region',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID
)
ON CONFLICT (code) DO NOTHING;

-- Sample zone for the site
INSERT INTO zones (id, site_id, name, geo_points)
VALUES (
  'b2c3d4e5-f6a7-5b8c-9d0e-1f2a3b4c5d6e'::UUID,
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::UUID,
  'Zone A',
  ARRAY['14.2351,-50.0234', '14.2389,-50.0198', '14.2402,-50.0267', '14.2365,-50.0303']
)
ON CONFLICT (site_id, name) DO NOTHING;

-- ============================================
-- HELPFUL ADMINISTRATIVE QUERIES
-- ============================================

-- View all users with their roles
-- SELECT u.email, u.first_name, u.last_name, r.name as role_name
-- FROM users u
-- JOIN roles r ON u.role_id = r.id;

-- View all sites with their managers
-- SELECT s.name, s.code, u.first_name || ' ' || u.last_name as manager_name
-- FROM sites s
-- LEFT JOIN users u ON s.manager_id = u.id;

-- Check stock levels
-- SELECT * FROM stock_levels_view;

-- Check active cultivation cycles
-- SELECT * FROM active_cycles_view;

-- Check farmer balances
-- SELECT * FROM farmer_balances WHERE balance != 0;

-- ============================================
-- END OF SEED DATA
-- ============================================
