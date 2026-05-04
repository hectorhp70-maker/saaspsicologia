
-- Revoke anon access to security definer functions
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_role(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, org_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_organization() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- Fix overly permissive RLS on legacy pacientes table
DROP POLICY IF EXISTS "Allow public delete access to pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Allow public insert access to pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Allow public read access to pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Allow public update access to pacientes" ON public.pacientes;

CREATE POLICY "Authenticated users can read pacientes" ON public.pacientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert pacientes" ON public.pacientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update pacientes" ON public.pacientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete pacientes" ON public.pacientes FOR DELETE TO authenticated USING (true);
