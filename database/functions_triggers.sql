-- ============================================
-- BUSINESS LOGIC FUNCTIONS AND TRIGGERS
-- SeaFarm Monitoring Application
-- ============================================

-- ============================================
-- STOCK CALCULATION FUNCTIONS
-- ============================================

-- Function to calculate current stock for a site and seaweed type
CREATE OR REPLACE FUNCTION calculate_site_stock(
  p_site_id UUID,
  p_seaweed_type_id UUID
)
RETURNS TABLE(
  total_kg DECIMAL(15, 3),
  total_bags INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(COALESCE(in_kg, 0) - COALESCE(out_kg, 0)), 0) as total_kg,
    COALESCE(SUM(COALESCE(in_bags, 0) - COALESCE(out_bags, 0)), 0)::INTEGER as total_bags
  FROM stock_movements
  WHERE site_id = p_site_id
    AND seaweed_type_id = p_seaweed_type_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to calculate pressed stock
CREATE OR REPLACE FUNCTION calculate_pressed_stock(
  p_site_id UUID,
  p_seaweed_type_id UUID
)
RETURNS TABLE(
  total_bales INTEGER,
  total_kg DECIMAL(15, 3)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(COALESCE(in_bales, 0) - COALESCE(out_bales, 0)), 0)::INTEGER as total_bales,
    COALESCE(SUM(COALESCE(in_kg, 0) - COALESCE(out_kg, 0)), 0) as total_kg
  FROM pressed_stock_movements
  WHERE site_id = p_site_id
    AND seaweed_type_id = p_seaweed_type_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FARMER BALANCE CALCULATION
-- ============================================

-- Function to calculate farmer's credit balance
CREATE OR REPLACE FUNCTION calculate_farmer_balance(p_farmer_id UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
  total_credits DECIMAL(15, 2);
  total_repayments DECIMAL(15, 2);
BEGIN
  -- Calculate total credits
  SELECT COALESCE(SUM(total_amount), 0)
  INTO total_credits
  FROM farmer_credits
  WHERE farmer_id = p_farmer_id;
  
  -- Calculate total repayments
  SELECT COALESCE(SUM(amount), 0)
  INTO total_repayments
  FROM repayments
  WHERE farmer_id = p_farmer_id;
  
  RETURN total_credits - total_repayments;
END;
$$ LANGUAGE plpgsql STABLE;

-- View for farmer balances
CREATE OR REPLACE VIEW farmer_balances AS
SELECT 
  f.id as farmer_id,
  f.first_name,
  f.last_name,
  f.code,
  f.site_id,
  COALESCE(SUM(fc.total_amount), 0) as total_credits,
  COALESCE(SUM(r.amount), 0) as total_repayments,
  COALESCE(SUM(fc.total_amount), 0) - COALESCE(SUM(r.amount), 0) as balance
FROM farmers f
LEFT JOIN farmer_credits fc ON f.id = fc.farmer_id
LEFT JOIN repayments r ON f.id = r.farmer_id
WHERE f.status = 'ACTIVE'
GROUP BY f.id, f.first_name, f.last_name, f.code, f.site_id;

-- ============================================
-- MODULE STATUS MANAGEMENT
-- ============================================

-- Function to get current module status
CREATE OR REPLACE FUNCTION get_module_status(p_module_id UUID)
RETURNS TEXT AS $$
DECLARE
  latest_status TEXT;
BEGIN
  SELECT 
    (status_history->-1->>'status')::TEXT
  INTO latest_status
  FROM modules
  WHERE id = p_module_id;
  
  RETURN COALESCE(latest_status, 'CREATED');
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to add status to module history
CREATE OR REPLACE FUNCTION add_module_status(
  p_module_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE modules
  SET 
    status_history = status_history || 
      jsonb_build_object(
        'status', p_status,
        'date', NOW(),
        'notes', p_notes
      ),
    updated_at = NOW()
  WHERE id = p_module_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTOMATIC STOCK MOVEMENT TRIGGERS
-- ============================================

-- Trigger: Create stock movement when cultivation cycle is bagged
CREATE OR REPLACE FUNCTION create_stock_from_bagging()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create stock movement when status changes to BAGGED
  IF NEW.status = 'BAGGED' AND (OLD.status IS NULL OR OLD.status != 'BAGGED') THEN
    INSERT INTO stock_movements (
      date,
      site_id,
      seaweed_type_id,
      type,
      designation,
      in_kg,
      in_bags,
      related_id
    )
    SELECT
      NEW.bagged_date,
      m.site_id,
      NEW.seaweed_type_id,
      'BAGGING_TRANSFER',
      'Transfer from bagging - Cycle ' || NEW.id::TEXT,
      NEW.bagged_weight_kg,
      NEW.bagged_bags_count,
      NEW.id
    FROM modules m
    WHERE m.id = NEW.module_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_stock_from_bagging
  AFTER INSERT OR UPDATE ON cultivation_cycles
  FOR EACH ROW
  EXECUTE FUNCTION create_stock_from_bagging();

-- Trigger: Create stock movements for farmer deliveries
CREATE OR REPLACE FUNCTION create_stock_from_farmer_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.destination = 'SITE_STORAGE' THEN
    -- Add to site stock
    INSERT INTO stock_movements (
      date,
      site_id,
      seaweed_type_id,
      type,
      designation,
      in_kg,
      in_bags,
      related_id
    ) VALUES (
      NEW.date,
      NEW.site_id,
      NEW.seaweed_type_id,
      'FARMER_DELIVERY',
      'Farmer delivery - ' || NEW.slip_no,
      NEW.total_weight_kg,
      NEW.total_bags,
      NEW.id
    );
  ELSIF NEW.destination = 'PRESSING_WAREHOUSE_BULK' THEN
    -- Add to pressed stock (as bulk)
    INSERT INTO pressed_stock_movements (
      date,
      site_id,
      seaweed_type_id,
      type,
      designation,
      in_kg,
      related_id
    ) VALUES (
      NEW.date,
      NEW.site_id,
      NEW.seaweed_type_id,
      'FARMER_DELIVERY',
      'Farmer delivery (bulk) - ' || NEW.slip_no,
      NEW.total_weight_kg,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_stock_from_farmer_delivery
  AFTER INSERT ON farmer_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION create_stock_from_farmer_delivery();

-- Trigger: Handle pressing slip stock movements
CREATE OR REPLACE FUNCTION handle_pressing_slip_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove from site stock (consumption)
  INSERT INTO stock_movements (
    date,
    site_id,
    seaweed_type_id,
    type,
    designation,
    out_kg,
    out_bags,
    related_id
  ) VALUES (
    NEW.date,
    NEW.source_site_id,
    NEW.seaweed_type_id,
    'PRESSING_OUT',
    'Pressing - ' || NEW.slip_no,
    NEW.consumed_weight_kg,
    NEW.consumed_bags,
    NEW.id
  );
  
  -- Add to pressed stock
  INSERT INTO pressed_stock_movements (
    date,
    site_id,
    seaweed_type_id,
    type,
    designation,
    in_bales,
    in_kg,
    related_id
  ) VALUES (
    NEW.date,
    NEW.source_site_id,
    NEW.seaweed_type_id,
    'PRESSING_IN',
    'Pressing - ' || NEW.slip_no,
    NEW.produced_bales_count,
    NEW.produced_weight_kg,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_pressing_slip_stock
  AFTER INSERT ON pressing_slips
  FOR EACH ROW
  EXECUTE FUNCTION handle_pressing_slip_stock();

-- ============================================
-- SITE TRANSFER STATUS MANAGEMENT
-- ============================================

-- Function to update site transfer status with history
CREATE OR REPLACE FUNCTION update_site_transfer_status(
  p_transfer_id UUID,
  p_new_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE site_transfers
  SET 
    status = p_new_status,
    history = history || 
      jsonb_build_object(
        'status', p_new_status,
        'date', NOW(),
        'notes', p_notes
      ),
    updated_at = NOW()
  WHERE id = p_transfer_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Create stock movements when site transfer is completed
CREATE OR REPLACE FUNCTION handle_site_transfer_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
    -- Remove from source site
    INSERT INTO stock_movements (
      date,
      site_id,
      seaweed_type_id,
      type,
      designation,
      out_kg,
      out_bags,
      related_id
    ) VALUES (
      NEW.date,
      NEW.source_site_id,
      NEW.seaweed_type_id,
      'SITE_TRANSFER_OUT',
      'Transfer to ' || (SELECT name FROM sites WHERE id = NEW.destination_site_id),
      NEW.weight_kg,
      NEW.bags,
      NEW.id
    );
    
    -- Add to destination site
    INSERT INTO stock_movements (
      date,
      site_id,
      seaweed_type_id,
      type,
      designation,
      in_kg,
      in_bags,
      related_id
    ) VALUES (
      NEW.completion_date,
      NEW.destination_site_id,
      NEW.seaweed_type_id,
      'SITE_TRANSFER_IN',
      'Transfer from ' || (SELECT name FROM sites WHERE id = NEW.source_site_id),
      COALESCE(NEW.received_weight_kg, NEW.weight_kg),
      COALESCE(NEW.received_bags, NEW.bags),
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_site_transfer_completion
  AFTER UPDATE ON site_transfers
  FOR EACH ROW
  EXECUTE FUNCTION handle_site_transfer_completion();

-- ============================================
-- CODE GENERATION FUNCTIONS
-- ============================================

-- Function to generate next employee code
CREATE OR REPLACE FUNCTION generate_employee_code()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(code FROM '[0-9]+')::INTEGER), 0) + 1
  INTO next_number
  FROM employees
  WHERE code ~ '^EMP[0-9]+$';
  
  new_code := 'EMP' || LPAD(next_number::TEXT, 4, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next farmer code
CREATE OR REPLACE FUNCTION generate_farmer_code()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(code FROM '[0-9]+')::INTEGER), 0) + 1
  INTO next_number
  FROM farmers
  WHERE code ~ '^FRM[0-9]+$';
  
  new_code := 'FRM' || LPAD(next_number::TEXT, 4, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next module code
CREATE OR REPLACE FUNCTION generate_module_code(p_site_code TEXT)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(code FROM '[0-9]+')::INTEGER), 0) + 1
  INTO next_number
  FROM modules
  WHERE code LIKE p_site_code || '-%';
  
  new_code := p_site_code || '-' || LPAD(next_number::TEXT, 3, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- REPORTING VIEWS
-- ============================================

-- View: Active cultivation cycles with details
CREATE OR REPLACE VIEW active_cycles_view AS
SELECT 
  cc.id,
  cc.planting_date,
  cc.status,
  cc.harvested_weight,
  m.code as module_code,
  s.name as site_name,
  z.name as zone_name,
  st.name as seaweed_type,
  f.first_name || ' ' || f.last_name as farmer_name,
  EXTRACT(DAY FROM NOW() - cc.planting_date) as days_since_planting
FROM cultivation_cycles cc
JOIN modules m ON cc.module_id = m.id
JOIN sites s ON m.site_id = s.id
JOIN zones z ON m.zone_id = z.id
JOIN seaweed_types st ON cc.seaweed_type_id = st.id
LEFT JOIN farmers f ON m.farmer_id = f.id
WHERE cc.status IN ('PLANTED', 'GROWING', 'HARVESTED', 'DRYING', 'BAGGING');

-- View: Stock levels by site
CREATE OR REPLACE VIEW stock_levels_view AS
SELECT 
  s.id as site_id,
  s.name as site_name,
  st.id as seaweed_type_id,
  st.name as seaweed_type,
  COALESCE(SUM(COALESCE(sm.in_kg, 0) - COALESCE(sm.out_kg, 0)), 0) as total_kg,
  COALESCE(SUM(COALESCE(sm.in_bags, 0) - COALESCE(sm.out_bags, 0)), 0) as total_bags
FROM sites s
CROSS JOIN seaweed_types st
LEFT JOIN stock_movements sm ON s.id = sm.site_id AND st.id = sm.seaweed_type_id
GROUP BY s.id, s.name, st.id, st.name;

-- ============================================
-- VALIDATION FUNCTIONS
-- ============================================

-- Function to validate stock availability before transfer
CREATE OR REPLACE FUNCTION validate_stock_availability(
  p_site_id UUID,
  p_seaweed_type_id UUID,
  p_required_kg DECIMAL(15, 3),
  p_required_bags INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  available_kg DECIMAL(15, 3);
  available_bags INTEGER;
BEGIN
  SELECT total_kg, total_bags
  INTO available_kg, available_bags
  FROM calculate_site_stock(p_site_id, p_seaweed_type_id);
  
  RETURN available_kg >= p_required_kg AND available_bags >= p_required_bags;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION calculate_site_stock IS 'Calculates current stock levels for a site and seaweed type';
COMMENT ON FUNCTION calculate_pressed_stock IS 'Calculates pressed/baled stock levels';
COMMENT ON FUNCTION calculate_farmer_balance IS 'Calculates farmer credit balance (credits - repayments)';
COMMENT ON FUNCTION add_module_status IS 'Adds a new status entry to module status history';
COMMENT ON VIEW farmer_balances IS 'View showing credit balances for all active farmers';
COMMENT ON VIEW active_cycles_view IS 'View showing all active cultivation cycles with related details';
COMMENT ON VIEW stock_levels_view IS 'View showing stock levels for all sites and seaweed types';

-- ============================================
-- END OF BUSINESS LOGIC
-- ============================================
