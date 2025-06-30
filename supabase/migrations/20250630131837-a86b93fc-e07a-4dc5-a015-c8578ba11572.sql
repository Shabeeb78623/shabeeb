
-- Create a table for dynamic registration questions
CREATE TABLE public.registration_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_key TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'select', 'checkbox', 'textarea')),
  options JSONB,
  required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for dynamic benefits
CREATE TABLE public.benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_type TEXT NOT NULL,
  benefit_name TEXT NOT NULL,
  description TEXT,
  amount_limit DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for payment recipients
CREATE TABLE public.payment_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for message templates
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  variables JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for year configurations
CREATE TABLE public.year_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT false,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create a table for bulk imports
CREATE TABLE public.bulk_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  import_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add new columns to existing tables (assuming they exist)
-- Note: These will be added to your existing user management tables

-- Insert default registration questions
INSERT INTO public.registration_questions (question_key, question_text, field_type, order_index) VALUES
('full_name', 'Full Name', 'text', 1),
('mobile_no', 'Mobile Number', 'text', 2),
('whatsapp', 'WhatsApp Number', 'text', 3),
('email', 'Email Address', 'text', 4),
('emirates_id', 'Emirates ID', 'text', 5),
('emirate', 'Emirate', 'select', 6),
('mandalam', 'Mandalam', 'select', 7),
('nominee', 'Nominee Name', 'text', 8),
('relation', 'Relation with Nominee', 'select', 9),
('address_uae', 'Address in UAE', 'textarea', 10),
('address_india', 'Address in India', 'textarea', 11),
('kmcc_member', 'KMCC Member', 'checkbox', 12),
('pratheeksha_member', 'Pratheeksha Member', 'checkbox', 13),
('recommended_by', 'Recommended By', 'text', 14);

-- Insert default benefits
INSERT INTO public.benefits (benefit_type, benefit_name, description, amount_limit) VALUES
('hospital', 'Hospital Benefit', 'Medical treatment support', 5000.00),
('death', 'Death Benefit', 'Support for family in case of death', 10000.00),
('gulf_returnee', 'Gulf Returnee Benefit', 'Support for returning members', 3000.00),
('cancer', 'Cancer Treatment Benefit', 'Cancer treatment support', 15000.00);

-- Insert default payment recipients
INSERT INTO public.payment_recipients (name, contact_info) VALUES
('Cash Payment', 'Direct cash payment'),
('Bank Transfer', 'Bank account transfer'),
('Online Payment', 'Digital payment methods');

-- Insert default message templates
INSERT INTO public.message_templates (template_name, subject, message_content, variables) VALUES
('payment_reminder', 'Payment Reminder', 'Dear {{name}}, your payment for {{year}} is pending. Please complete your payment. Mandalam: {{mandalam}}', '["name", "year", "mandalam"]'),
('registration_approved', 'Registration Approved', 'Dear {{name}}, your registration has been approved. Welcome to {{mandalam}} mandalam!', '["name", "mandalam"]'),
('new_year_notification', 'New Year Registration', 'Dear {{name}}, registration for {{year}} is now open. Please re-register to continue your membership.', '["name", "year"]');

-- Set up Row Level Security
ALTER TABLE public.registration_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.year_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_imports ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin access to registration_questions" ON public.registration_questions FOR ALL USING (true);
CREATE POLICY "Admin access to benefits" ON public.benefits FOR ALL USING (true);
CREATE POLICY "Admin access to payment_recipients" ON public.payment_recipients FOR ALL USING (true);
CREATE POLICY "Admin access to message_templates" ON public.message_templates FOR ALL USING (true);
CREATE POLICY "Admin access to year_configs" ON public.year_configs FOR ALL USING (true);
CREATE POLICY "Admin access to bulk_imports" ON public.bulk_imports FOR ALL USING (true);
