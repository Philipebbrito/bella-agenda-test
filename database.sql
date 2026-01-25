
-- BellaAgenda Database Schema (Supabase / PostgreSQL)

-- 1. Tabela de Salões (Configurações e Dados do Negócio)
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) NOT NULL, -- Vinculado ao Auth do Supabase
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    owner_email TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    plan TEXT DEFAULT 'MONTHLY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Serviços (Catálogo)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Agendamentos
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    remaining_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) DEFAULT 1.00,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Configurações de Fornecedor
CREATE TABLE vendor_settings (
    salon_id UUID PRIMARY KEY REFERENCES salons(id) ON DELETE CASCADE,
    mercado_pago_token TEXT,
    pix_enabled BOOLEAN DEFAULT TRUE,
    availability JSONB NOT NULL -- Horários salvos em formato JSON
);

-- ROW LEVEL SECURITY (RLS)

-- Ativar RLS nas tabelas
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para 'salons'
CREATE POLICY "Public can view approved salons" ON salons FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Owners can view their own salon" ON salons FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own salon" ON salons FOR UPDATE USING (auth.uid() = owner_id);

-- Políticas para 'services'
CREATE POLICY "Public can view services of approved salons" ON services FOR SELECT 
USING (EXISTS (SELECT 1 FROM salons WHERE salons.id = services.salon_id AND salons.status = 'APPROVED'));
CREATE POLICY "Owners can manage their own services" ON services ALL USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = services.salon_id AND salons.owner_id = auth.uid())
);

-- Políticas para 'appointments'
CREATE POLICY "Public can create appointments" ON appointments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Owners can manage their appointments" ON appointments ALL USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = appointments.salon_id AND salons.owner_id = auth.uid())
);

-- Políticas para 'vendor_settings'
CREATE POLICY "Owners can manage their settings" ON vendor_settings ALL USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = vendor_settings.salon_id AND salons.owner_id = auth.uid())
);

-- Índices de Performance
CREATE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_appointments_salon_date ON appointments(salon_id, scheduled_at);
