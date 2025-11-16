-- Create card_templates table for storing membership card templates
CREATE TABLE public.card_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_url TEXT NOT NULL,
  field_positions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.card_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON public.card_templates
  FOR ALL
  USING (has_role(auth.uid(), 'master_admin'));

-- Everyone can view active templates
CREATE POLICY "Everyone can view active templates"
  ON public.card_templates
  FOR SELECT
  USING (is_active = true);