
-- Update handle_new_user to also save CRP from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, crp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'crp', '')
  );
  RETURN NEW;
END;
$$;

-- Auto-create organization for new users
CREATE OR REPLACE FUNCTION public.handle_auto_create_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  org_name text;
  org_slug text;
BEGIN
  -- Only create org if user doesn't already have one
  IF NOT EXISTS (SELECT 1 FROM public.organization_memberships WHERE user_id = NEW.id AND status = 'active') THEN
    org_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    org_slug := lower(replace(replace(org_name, ' ', '-'), '.', '-')) || '-' || substr(NEW.id::text, 1, 8);
    
    INSERT INTO public.organizations (name, slug, owner_user_id)
    VALUES (org_name, org_slug, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger (after handle_new_user so profile exists first)
DROP TRIGGER IF EXISTS on_auth_user_created_org ON auth.users;
CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auto_create_org();
