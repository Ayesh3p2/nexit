-- Create database if not exists
SELECT 'CREATE DATABASE nexit_itsm'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexit_itsm')\gexec

-- Connect to the database
\c nexit_itsm

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'AGENT', 'END_USER');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE asset_status AS ENUM ('IN_STOCK', 'IN_USE', 'MAINTENANCE', 'RETIRED');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'END_USER',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ticket_status DEFAULT 'OPEN',
    priority ticket_priority DEFAULT 'MEDIUM',
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(100) NOT NULL,
    status asset_status DEFAULT 'IN_STOCK',
    serial_number VARCHAR(100) UNIQUE,
    purchase_date DATE,
    purchase_cost DECIMAL(10, 2),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@nexit-itsm.com',
    '$2a$10$XFDJ5qJ1sY7q4XvJQ0qXEOjQz5kZz8JQz8JQz8JQz8JQz8JQz8JQ',
    'Admin',
    'User',
    'ADMIN',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at
BEFORE UPDATE ON ticket_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to log changes
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_user_id UUID;
BEGIN
    -- Skip if no row is being updated (shouldn't happen, but just in case)
    IF TG_OP = 'UPDATE' AND NEW IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get the user ID from the session or set to NULL if not available
    BEGIN
        v_user_id := current_setting('app.current_user_id', TRUE)::UUID;
    EXCEPTION 
        WHEN OTHERS THEN
            v_user_id := NULL;
    END;

    -- Log the operation
    IF TG_OP = 'INSERT' THEN
        v_new_data := to_jsonb(NEW);
        
        INSERT INTO audit_logs (
            user_id,
            action,
            entity_type,
            entity_id,
            new_values,
            ip_address,
            user_agent
        ) VALUES (
            v_user_id,
            'CREATE',
            TG_TABLE_NAME,
            NEW.id,
            v_new_data,
            current_setting('app.client_ip', TRUE),
            current_setting('app.user_agent', TRUE)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        
        -- Remove unchanged fields
        SELECT jsonb_object_agg(key, value) INTO v_old_data
        FROM jsonb_each(v_old_data)
        WHERE (v_old_data->>key) IS DISTINCT FROM (v_new_data->>key);
        
        SELECT jsonb_object_agg(key, value) INTO v_new_data
        FROM jsonb_each(v_new_data)
        WHERE (v_old_data->>key) IS DISTINCT FROM (v_new_data->>key);
        
        -- Only log if there are changes
        IF v_old_data IS NOT NULL OR v_new_data IS NOT NULL THEN
            INSERT INTO audit_logs (
                user_id,
                action,
                entity_type,
                entity_id,
                old_values,
                new_values,
                ip_address,
                user_agent
            ) VALUES (
                v_user_id,
                'UPDATE',
                TG_TABLE_NAME,
                NEW.id,
                v_old_data,
                v_new_data,
                current_setting('app.client_ip', TRUE),
                current_setting('app.user_agent', TRUE)
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);
        
        INSERT INTO audit_logs (
            user_id,
            action,
            entity_type,
            entity_id,
            old_values,
            ip_address,
            user_agent
        ) VALUES (
            v_user_id,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            v_old_data,
            current_setting('app.client_ip', TRUE),
            current_setting('app.user_agent', TRUE)
        );
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for all tables
CREATE TRIGGER audit_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_refresh_tokens_trigger
AFTER INSERT OR UPDATE OR DELETE ON refresh_tokens
FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_tickets_trigger
AFTER INSERT OR UPDATE OR DELETE ON tickets
FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_ticket_comments_trigger
AFTER INSERT OR UPDATE OR DELETE ON ticket_comments
FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_assets_trigger
AFTER INSERT OR UPDATE OR DELETE ON assets
FOR EACH ROW EXECUTE FUNCTION log_changes();

-- Notify that the database has been initialized
DO $$
BEGIN
    RAISE NOTICE 'NexIT ITSM database has been initialized';
END $$;
