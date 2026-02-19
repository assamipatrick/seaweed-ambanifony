-- ============================================
-- SUPABASE REAL-TIME DATABASE SCHEMA
-- SeaFarm Monitoring Application
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING TABLES (if re-running)
-- ============================================
DROP TABLE IF EXISTS gallery_photos CASCADE;
DROP TABLE IF EXISTS message_logs CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS pest_observations CASCADE;
DROP TABLE IF EXISTS periodic_tests CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS monthly_payments CASCADE;
DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS farmer_credits CASCADE;
DROP TABLE IF EXISTS credit_types CASCADE;
DROP TABLE IF EXISTS site_transfers CASCADE;
DROP TABLE IF EXISTS pressed_stock_movements CASCADE;
DROP TABLE IF EXISTS export_containers CASCADE;
DROP TABLE IF EXISTS export_documents CASCADE;
DROP TABLE IF EXISTS pressing_slips CASCADE;
DROP TABLE IF EXISTS farmer_deliveries CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS cultivation_cycles CASCADE;
DROP TABLE IF EXISTS cutting_operations CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS seaweed_price_history CASCADE;
DROP TABLE IF EXISTS seaweed_types CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS incident_severities CASCADE;
DROP TABLE IF EXISTS incident_types CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- ============================================
-- SYSTEM TABLES
-- ============================================

-- App Settings (single row configuration)
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Company Settings
    company_name TEXT NOT NULL DEFAULT 'SeaFarm Company',
    company_logo_url TEXT,
    company_phone TEXT,
    company_email TEXT,
    company_address TEXT,
    company_nif TEXT,
    company_rc TEXT,
    company_stat TEXT,
    company_capital DECIMAL(15, 2) DEFAULT 0,
    
    -- Localization Settings
    country TEXT DEFAULT 'Madagascar',
    currency TEXT DEFAULT 'MGA',
    currency_symbol TEXT DEFAULT 'Ar',
    thousands_separator TEXT DEFAULT ',',
    decimal_separator TEXT DEFAULT '.',
    monetary_decimals INTEGER DEFAULT 2,
    non_monetary_decimals INTEGER DEFAULT 2,
    coordinate_format TEXT DEFAULT 'DD' CHECK (coordinate_format IN ('DD', 'DMS')),
    
    -- Theme and Language
    theme_id TEXT DEFAULT 'modern',
    theme_name TEXT DEFAULT 'Modern',
    theme_class TEXT DEFAULT 'theme-modern',
    theme_font TEXT DEFAULT 'Inter',
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr')),
    
    -- Denominations (stored as JSONB)
    denominations JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO app_settings (id) VALUES (uuid_generate_v4());

-- Roles
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role_id TEXT NOT NULL REFERENCES roles(id),
    phone TEXT,
    organization_id UUID,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invitations
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT UNIQUE NOT NULL,
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    role_id TEXT NOT NULL REFERENCES roles(id),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- ============================================
-- CONFIGURATION TABLES
-- ============================================

-- Incident Types
CREATE TABLE incident_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Severities
CREATE TABLE incident_severities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seaweed Types
CREATE TABLE seaweed_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    scientific_name TEXT,
    description TEXT,
    wet_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    dry_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seaweed Price History
CREATE TABLE seaweed_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    wet_price DECIMAL(15, 2) NOT NULL,
    dry_price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Types
CREATE TABLE credit_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    has_quantity BOOLEAN DEFAULT FALSE,
    unit TEXT,
    has_unit_price BOOLEAN DEFAULT FALSE,
    is_direct_amount BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOCATION TABLES
-- ============================================

-- Sites
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location TEXT,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones (within sites)
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    geo_points TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, name)
);

-- ============================================
-- STAKEHOLDER TABLES
-- ============================================

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    employee_type TEXT NOT NULL CHECK (employee_type IN ('PERMANENT', 'CASUAL')),
    role TEXT NOT NULL,
    category TEXT NOT NULL,
    team TEXT,
    phone TEXT,
    email TEXT,
    hire_date DATE NOT NULL,
    site_id UUID REFERENCES sites(id),
    gross_wage DECIMAL(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    exit_date DATE,
    exit_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farmers
CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE,
    birth_place TEXT,
    id_number TEXT,
    address TEXT,
    site_id UUID NOT NULL REFERENCES sites(id),
    marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
    nationality TEXT,
    parents_info TEXT,
    phone TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    join_date DATE NOT NULL,
    exit_date DATE,
    exit_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Providers
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    join_date DATE NOT NULL,
    exit_date DATE,
    exit_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OPERATIONS TABLES
-- ============================================

-- Modules
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    zone_id UUID NOT NULL REFERENCES zones(id),
    farmer_id UUID REFERENCES farmers(id),
    lines INTEGER DEFAULT 0,
    poles_galvanized INTEGER DEFAULT 0,
    poles_wood INTEGER DEFAULT 0,
    poles_plastic INTEGER DEFAULT 0,
    latitude TEXT,
    longitude TEXT,
    status_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cutting Operations
CREATE TABLE cutting_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    service_provider_id UUID NOT NULL REFERENCES service_providers(id),
    module_cuts JSONB NOT NULL DEFAULT '[]'::jsonb,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    notes TEXT,
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    beneficiary_farmer_id UUID REFERENCES farmers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cultivation Cycles
CREATE TABLE cultivation_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    planting_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PLANTED' CHECK (status IN (
        'CREATED', 'FREE', 'ASSIGNED', 'CUTTING', 'PLANTED', 'GROWING',
        'HARVESTED', 'DRYING', 'BAGGING', 'BAGGED', 'IN_STOCK',
        'EXPORTED', 'MAINTENANCE', 'STORED'
    )),
    initial_weight DECIMAL(15, 3) NOT NULL DEFAULT 0,
    cutting_operation_id UUID REFERENCES cutting_operations(id),
    lines_planted INTEGER,
    planned_duration_days INTEGER,
    projected_harvest_date DATE,
    
    -- Harvest phase
    harvest_date DATE,
    harvested_weight DECIMAL(15, 3),
    lines_harvested INTEGER,
    cuttings_taken_at_harvest_kg DECIMAL(15, 3),
    cuttings_intended_use TEXT,
    
    -- Drying phase
    drying_start_date DATE,
    drying_completion_date DATE,
    actual_dry_weight_kg DECIMAL(15, 3),
    
    -- Bagging phase
    bagging_start_date DATE,
    bagged_date DATE,
    bagged_bags_count INTEGER,
    bagged_weight_kg DECIMAL(15, 3),
    bag_weights DECIMAL(15, 3)[] DEFAULT '{}',
    
    -- Stock and export
    stock_date DATE,
    export_date DATE,
    
    processing_notes TEXT,
    payment_run_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVENTORY TABLES
-- ============================================

-- Stock Movements
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    type TEXT NOT NULL CHECK (type IN (
        'INITIAL_STOCK', 'BAGGING_TRANSFER', 'EXPORT_OUT',
        'FARMER_DELIVERY', 'PRESSING_OUT', 'PRESSING_IN',
        'SITE_TRANSFER_IN', 'SITE_TRANSFER_OUT',
        'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'
    )),
    designation TEXT NOT NULL,
    in_kg DECIMAL(15, 3),
    in_bags INTEGER,
    out_kg DECIMAL(15, 3),
    out_bags INTEGER,
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farmer Deliveries
CREATE TABLE farmer_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slip_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    total_weight_kg DECIMAL(15, 3) NOT NULL,
    total_bags INTEGER NOT NULL,
    bag_weights DECIMAL(15, 3)[] DEFAULT '{}',
    destination TEXT NOT NULL CHECK (destination IN ('SITE_STORAGE', 'PRESSING_WAREHOUSE_BULK')),
    payment_run_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pressing Slips
CREATE TABLE pressing_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slip_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    source_site_id UUID NOT NULL REFERENCES sites(id),
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    consumed_weight_kg DECIMAL(15, 3) NOT NULL,
    consumed_bags INTEGER NOT NULL,
    produced_weight_kg DECIMAL(15, 3) NOT NULL,
    produced_bales_count INTEGER NOT NULL,
    export_doc_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pressed Stock Movements
CREATE TABLE pressed_stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    type TEXT NOT NULL CHECK (type IN (
        'INITIAL_STOCK', 'PRESSING_IN', 'EXPORT_OUT',
        'RETURN_TO_SITE', 'BULK_IN_FROM_SITE', 'PRESSING_CONSUMPTION',
        'FARMER_DELIVERY', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'
    )),
    designation TEXT NOT NULL,
    in_bales INTEGER,
    out_bales INTEGER,
    in_kg DECIMAL(15, 3),
    out_kg DECIMAL(15, 3),
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export Documents
CREATE TABLE export_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_no TEXT UNIQUE NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('COMMERCIAL_INVOICE', 'PACKING_LIST', 'CERTIFICATE_OF_ORIGIN')),
    invoice_no TEXT NOT NULL,
    date DATE NOT NULL,
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    nature TEXT,
    po_no TEXT,
    domiciliation_no TEXT,
    destination_country TEXT NOT NULL,
    city TEXT,
    
    notify_party TEXT,
    notify_party_address TEXT,
    notify_party_email TEXT,
    notify_party_phone TEXT,
    
    debtor TEXT,
    debtor_address TEXT,
    debtor_email TEXT,
    debtor_phone TEXT,
    
    vessel TEXT,
    sea_waybill TEXT,
    voyage_no TEXT,
    currency TEXT NOT NULL CHECK (currency IN ('EUR', 'USD')),
    local_exchange_rate DECIMAL(15, 4) NOT NULL,
    
    pressing_slip_ids UUID[] DEFAULT '{}',
    containers JSONB DEFAULT '[]'::jsonb,
    
    customs_nomenclature TEXT,
    country_of_origin TEXT,
    incoterms TEXT,
    payment_terms TEXT,
    swift_bank TEXT,
    rex_reference TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export Containers (can be separate or embedded in export_documents as JSONB)
CREATE TABLE export_containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_doc_id UUID NOT NULL REFERENCES export_documents(id) ON DELETE CASCADE,
    container_no TEXT NOT NULL,
    seal_no TEXT NOT NULL,
    container_type TEXT NOT NULL CHECK (container_type IN ('20'' GP', '40'' GP', '40'' HC')),
    volume_m3 DECIMAL(10, 2) NOT NULL,
    tare_kg DECIMAL(15, 3) NOT NULL,
    package_weight_kg DECIMAL(15, 3),
    seaweed_weight_kg DECIMAL(15, 3) NOT NULL,
    packages_count INTEGER NOT NULL,
    gross_weight_kg DECIMAL(15, 3) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Transfers
CREATE TABLE site_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    source_site_id UUID NOT NULL REFERENCES sites(id),
    destination_site_id UUID NOT NULL REFERENCES sites(id),
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    manager_id UUID REFERENCES users(id),
    transporter TEXT NOT NULL,
    weight_kg DECIMAL(15, 3) NOT NULL,
    bags INTEGER NOT NULL,
    bag_weights DECIMAL(15, 3)[] DEFAULT '{}',
    status TEXT DEFAULT 'AWAITING_OUTBOUND' CHECK (status IN (
        'AWAITING_OUTBOUND', 'IN_TRANSIT', 'PENDING_RECEPTION', 'COMPLETED', 'CANCELLED'
    )),
    completion_date DATE,
    received_weight_kg DECIMAL(15, 3),
    received_bags INTEGER,
    notes TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    transport TEXT CHECK (transport IN ('Boat', 'Truck')),
    representative TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCIAL TABLES
-- ============================================

-- Farmer Credits
CREATE TABLE farmer_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    credit_type_id UUID NOT NULL REFERENCES credit_types(id),
    quantity DECIMAL(15, 3),
    unit_price DECIMAL(15, 2),
    total_amount DECIMAL(15, 2) NOT NULL,
    related_operation_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repayments
CREATE TABLE repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    amount DECIMAL(15, 2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('cash', 'harvest_deduction')),
    notes TEXT,
    payment_run_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Payments
CREATE TABLE monthly_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    period TEXT NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('FARMER', 'EMPLOYEE', 'SERVICE_PROVIDER')),
    recipient_id UUID NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('cash', 'bank_transfer', 'mobile_money')),
    notes TEXT,
    payment_run_id UUID,
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    transaction_id TEXT,
    mobile_provider TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MONITORING TABLES
-- ============================================

-- Incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    affected_module_ids UUID[] DEFAULT '{}',
    reported_by_id UUID NOT NULL REFERENCES users(id),
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    description TEXT NOT NULL,
    resolution_notes TEXT,
    resolved_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Periodic Tests
CREATE TABLE periodic_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identity TEXT NOT NULL,
    date DATE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    seaweed_type_id UUID NOT NULL REFERENCES seaweed_types(id),
    zone_id UUID NOT NULL REFERENCES zones(id),
    period TEXT NOT NULL CHECK (period IN ('PLANTING', 'PERIOD_1', 'PERIOD_2', 'PERIOD_3', 'PERIOD_4', 'PERIOD_5')),
    weight_kg DECIMAL(15, 3) NOT NULL,
    growth_rate DECIMAL(10, 2),
    temperature DECIMAL(10, 2),
    salinity DECIMAL(10, 2),
    precipitation DECIMAL(10, 2),
    wind_speed DECIMAL(10, 2),
    wind_direction DECIMAL(10, 2),
    wave_height DECIMAL(10, 2),
    weather_data_source TEXT DEFAULT 'manual' CHECK (weather_data_source IN ('auto', 'manual')),
    conductor_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pest Observations
CREATE TABLE pest_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id),
    efa INTEGER DEFAULT 0,
    hydroclathrus INTEGER DEFAULT 0,
    chaetomorpha INTEGER DEFAULT 0,
    enteromorpha INTEGER DEFAULT 0,
    ice_ice INTEGER DEFAULT 0,
    fish_grazing INTEGER DEFAULT 0,
    turtle_grazing INTEGER DEFAULT 0,
    sediment INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMUNICATION TABLES
-- ============================================

-- Message Logs
CREATE TABLE message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_count INTEGER NOT NULL,
    filter_type TEXT NOT NULL CHECK (filter_type IN ('ALL', 'SITE', 'SELECTED')),
    filter_value TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('SMS', 'WHATSAPP')),
    content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SENT', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Photos
CREATE TABLE gallery_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    url TEXT NOT NULL,
    comment TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Sites and Zones
CREATE INDEX idx_sites_code ON sites(code);
CREATE INDEX idx_zones_site_id ON zones(site_id);

-- Stakeholders
CREATE INDEX idx_employees_site_id ON employees(site_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_farmers_site_id ON farmers(site_id);
CREATE INDEX idx_farmers_status ON farmers(status);
CREATE INDEX idx_service_providers_status ON service_providers(status);

-- Modules and Cycles
CREATE INDEX idx_modules_site_id ON modules(site_id);
CREATE INDEX idx_modules_zone_id ON modules(zone_id);
CREATE INDEX idx_modules_farmer_id ON modules(farmer_id);
CREATE INDEX idx_cultivation_cycles_module_id ON cultivation_cycles(module_id);
CREATE INDEX idx_cultivation_cycles_status ON cultivation_cycles(status);
CREATE INDEX idx_cultivation_cycles_seaweed_type_id ON cultivation_cycles(seaweed_type_id);

-- Inventory
CREATE INDEX idx_stock_movements_site_id ON stock_movements(site_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(date);
CREATE INDEX idx_farmer_deliveries_site_id ON farmer_deliveries(site_id);
CREATE INDEX idx_farmer_deliveries_farmer_id ON farmer_deliveries(farmer_id);
CREATE INDEX idx_site_transfers_source_site_id ON site_transfers(source_site_id);
CREATE INDEX idx_site_transfers_destination_site_id ON site_transfers(destination_site_id);
CREATE INDEX idx_site_transfers_status ON site_transfers(status);

-- Financial
CREATE INDEX idx_farmer_credits_farmer_id ON farmer_credits(farmer_id);
CREATE INDEX idx_farmer_credits_date ON farmer_credits(date);
CREATE INDEX idx_repayments_farmer_id ON repayments(farmer_id);
CREATE INDEX idx_monthly_payments_recipient_id ON monthly_payments(recipient_id);
CREATE INDEX idx_monthly_payments_date ON monthly_payments(date);

-- Monitoring
CREATE INDEX idx_incidents_site_id ON incidents(site_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_periodic_tests_site_id ON periodic_tests(site_id);
CREATE INDEX idx_pest_observations_site_id ON pest_observations(site_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all relevant tables
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seaweed_types_updated_at BEFORE UPDATE ON seaweed_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_types_updated_at BEFORE UPDATE ON credit_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cultivation_cycles_updated_at BEFORE UPDATE ON cultivation_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cutting_operations_updated_at BEFORE UPDATE ON cutting_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_deliveries_updated_at BEFORE UPDATE ON farmer_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pressing_slips_updated_at BEFORE UPDATE ON pressing_slips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_export_documents_updated_at BEFORE UPDATE ON export_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_transfers_updated_at BEFORE UPDATE ON site_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_credits_updated_at BEFORE UPDATE ON farmer_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repayments_updated_at BEFORE UPDATE ON repayments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_payments_updated_at BEFORE UPDATE ON monthly_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_periodic_tests_updated_at BEFORE UPDATE ON periodic_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pest_observations_updated_at BEFORE UPDATE ON pest_observations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_photos_updated_at BEFORE UPDATE ON gallery_photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- END OF SCHEMA
-- ============================================
