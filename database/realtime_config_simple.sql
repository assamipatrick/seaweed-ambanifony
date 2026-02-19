-- ============================================
-- REAL-TIME DATABASE CONFIGURATION (SIMPLE)
-- SeaFarm Monitoring Application
-- Version simplifiée sans politiques RLS complexes
-- ============================================

-- ============================================
-- ENABLE REAL-TIME REPLICATION
-- ============================================

-- Enable real-time for operational tables
ALTER PUBLICATION supabase_realtime ADD TABLE modules;
ALTER PUBLICATION supabase_realtime ADD TABLE cultivation_cycles;
ALTER PUBLICATION supabase_realtime ADD TABLE cutting_operations;

-- Enable real-time for inventory tables
ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE farmer_deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE site_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE pressed_stock_movements;

-- Enable real-time for financial tables
ALTER PUBLICATION supabase_realtime ADD TABLE farmer_credits;
ALTER PUBLICATION supabase_realtime ADD TABLE repayments;
ALTER PUBLICATION supabase_realtime ADD TABLE monthly_payments;

-- Enable real-time for monitoring tables
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE periodic_tests;
ALTER PUBLICATION supabase_realtime ADD TABLE pest_observations;

-- Enable real-time for stakeholder tables
ALTER PUBLICATION supabase_realtime ADD TABLE farmers;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE service_providers;

-- Enable real-time for communication
ALTER PUBLICATION supabase_realtime ADD TABLE message_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE gallery_photos;

-- Enable real-time for sites and zones
ALTER PUBLICATION supabase_realtime ADD TABLE sites;
ALTER PUBLICATION supabase_realtime ADD TABLE zones;

-- Enable real-time for configuration tables (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE seaweed_types;
ALTER PUBLICATION supabase_realtime ADD TABLE credit_types;
ALTER PUBLICATION supabase_realtime ADD TABLE roles;

-- ============================================
-- REAL-TIME NOTIFICATION TRIGGERS
-- ============================================

-- Function to notify on important changes
CREATE OR REPLACE FUNCTION notify_realtime_change()
RETURNS TRIGGER AS $$
DECLARE
  payload TEXT;
BEGIN
  payload := json_build_object(
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'record', row_to_json(NEW),
    'old_record', row_to_json(OLD),
    'timestamp', NOW()
  )::TEXT;
  
  PERFORM pg_notify('realtime_changes', payload);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply notification triggers to critical tables
CREATE TRIGGER realtime_notify_modules
  AFTER INSERT OR UPDATE OR DELETE ON modules
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_change();

CREATE TRIGGER realtime_notify_cultivation_cycles
  AFTER INSERT OR UPDATE OR DELETE ON cultivation_cycles
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_change();

CREATE TRIGGER realtime_notify_incidents
  AFTER INSERT OR UPDATE OR DELETE ON incidents
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_change();

CREATE TRIGGER realtime_notify_site_transfers
  AFTER INSERT OR UPDATE OR DELETE ON site_transfers
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_change();

-- ============================================
-- REAL-TIME PRESENCE TRACKING (SIMPLE)
-- ============================================

-- Table to track online users (for collaborative features)
CREATE TABLE IF NOT EXISTS user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    current_page TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on presence table
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Simple policies for presence (permissive for development)
CREATE POLICY "Allow all access to user_presence" ON user_presence FOR ALL USING (true);

-- Auto-cleanup stale presence (older than 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  UPDATE user_presence
  SET status = 'offline'
  WHERE last_seen < NOW() - INTERVAL '5 minutes'
  AND status != 'offline';
END;
$$ LANGUAGE plpgsql;

-- Enable real-time for presence
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- ============================================
-- PERFORMANCE OPTIMIZATION FOR REAL-TIME
-- ============================================

-- Index for efficient presence queries
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status, last_seen);

-- Partial indexes for active records only (better performance)
CREATE INDEX IF NOT EXISTS idx_active_cultivation_cycles ON cultivation_cycles(status, planting_date) 
  WHERE status IN ('PLANTED', 'GROWING');

CREATE INDEX IF NOT EXISTS idx_active_incidents ON incidents(status, date) 
  WHERE status IN ('OPEN', 'IN_PROGRESS');

CREATE INDEX IF NOT EXISTS idx_active_site_transfers ON site_transfers(status, date) 
  WHERE status IN ('AWAITING_OUTBOUND', 'IN_TRANSIT', 'PENDING_RECEPTION');

-- ============================================
-- COMMENTS AND DOCUMENTATION
-- ============================================

COMMENT ON TABLE user_presence IS 'Tracks online/offline status of users for real-time collaboration';
COMMENT ON FUNCTION notify_realtime_change() IS 'Sends PostgreSQL notifications for real-time changes';
COMMENT ON FUNCTION cleanup_stale_presence() IS 'Removes stale user presence records (call periodically)';

-- ============================================
-- END OF REAL-TIME CONFIGURATION (SIMPLE)
-- ============================================

-- Note: Cette version utilise des politiques permissives (USING true)
-- Pour la production, utilisez realtime_config.sql avec auth.uid()
