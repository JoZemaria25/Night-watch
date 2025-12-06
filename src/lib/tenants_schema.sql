-- 1. Create the Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT CHECK (status IN ('Active', 'Past', 'Evicted')) DEFAULT 'Active',
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 3. Create Public Access Policy (for MVP simplicity)
CREATE POLICY "Allow public access to tenants"
ON tenants FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Seed Data (Dummy Tenants)
-- Note: We need valid property IDs. This assumes properties exist. 
-- If running manually, replace 'uuid-placeholder' with actual IDs from your properties table.
-- For this script, we'll try to insert into the first available property if possible, 
-- or just rely on the user to add them via UI if this fails.

DO $$
DECLARE
    first_property_id UUID;
BEGIN
    SELECT id INTO first_property_id FROM properties LIMIT 1;
    
    IF first_property_id IS NOT NULL THEN
        INSERT INTO tenants (full_name, email, phone, status, property_id)
        VALUES 
        ('John Doe', 'john@example.com', '+1234567890', 'Active', first_property_id),
        ('Jane Smith', 'jane@example.com', '+0987654321', 'Active', first_property_id);
    END IF;
END $$;
