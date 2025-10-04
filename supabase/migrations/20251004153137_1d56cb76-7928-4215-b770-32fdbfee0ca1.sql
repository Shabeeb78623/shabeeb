-- Create enum types
CREATE TYPE public.app_role AS ENUM ('user', 'mandalam_admin', 'master_admin');
CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'rejected', 'renewal_pending');
CREATE TYPE public.change_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  emirates_id TEXT,
  passport_number TEXT,
  mandalam TEXT NOT NULL,
  emirate TEXT NOT NULL,
  registration_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  status public.user_status DEFAULT 'pending',
  profile_photo_url TEXT,
  payment_proof_url TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_amount DECIMAL(10,2),
  payment_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  mandalam_access TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create benefits table
CREATE TABLE public.benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_benefits table (benefit usage tracking)
CREATE TABLE public.user_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  benefit_id UUID REFERENCES public.benefits(id) ON DELETE CASCADE NOT NULL,
  benefit_type TEXT NOT NULL,
  remarks TEXT,
  amount_paid DECIMAL(10,2),
  used_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create registration_questions table
CREATE TABLE public.registration_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  field_type TEXT NOT NULL,
  options JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  depends_on UUID REFERENCES public.registration_questions(id),
  depends_on_value TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_templates table
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_recipients table
CREATE TABLE public.payment_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account_details TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create year_configs table
CREATE TABLE public.year_configs (
  year INTEGER PRIMARY KEY,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create change_requests table
CREATE TABLE public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  status public.change_request_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.year_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

CREATE POLICY "Anyone can insert their profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Only master admin can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

-- RLS Policies for benefits
CREATE POLICY "Everyone can view active benefits"
  ON public.benefits FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage benefits"
  ON public.benefits FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'));

-- RLS Policies for user_benefits
CREATE POLICY "Users can view their benefit usage"
  ON public.user_benefits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all benefit usage"
  ON public.user_benefits FOR SELECT
  USING (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

CREATE POLICY "Admins can insert benefit usage"
  ON public.user_benefits FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

-- RLS Policies for registration_questions
CREATE POLICY "Everyone can view active questions"
  ON public.registration_questions FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage questions"
  ON public.registration_questions FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'));

-- RLS Policies for message_templates
CREATE POLICY "Admins can view templates"
  ON public.message_templates FOR SELECT
  USING (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

CREATE POLICY "Admins can manage templates"
  ON public.message_templates FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

-- RLS Policies for payment_recipients
CREATE POLICY "Everyone can view active recipients"
  ON public.payment_recipients FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage recipients"
  ON public.payment_recipients FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'));

-- RLS Policies for year_configs
CREATE POLICY "Everyone can view year configs"
  ON public.year_configs FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage year configs"
  ON public.year_configs FOR ALL
  USING (public.has_role(auth.uid(), 'master_admin'));

-- RLS Policies for change_requests
CREATE POLICY "Users can view their change requests"
  ON public.change_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create change requests"
  ON public.change_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all change requests"
  ON public.change_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

CREATE POLICY "Admins can update change requests"
  ON public.change_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'master_admin') OR public.has_role(auth.uid(), 'mandalam_admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default year config
INSERT INTO public.year_configs (year, is_active) VALUES (2025, TRUE);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_benefits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.change_requests;