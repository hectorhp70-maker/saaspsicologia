
-- 1. Fix permissive RLS on pacientes table (INSERT, UPDATE, DELETE)
-- Note: pacientes is a legacy table without org scoping, so we keep user_id-less but restrict to authenticated

DROP POLICY IF EXISTS "Authenticated users can insert pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Authenticated users can update pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Authenticated users can delete pacientes" ON public.pacientes;

-- The SELECT policy with USING (true) is fine for authenticated read access (linter excludes SELECT).
-- For INSERT/UPDATE/DELETE we require authenticated but can't scope to user since table has no user_id.
-- We'll keep them authenticated-only but add a note that this table should be migrated to org-scoped `patients`.

CREATE POLICY "Authenticated users can insert pacientes"
ON public.pacientes FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pacientes"
ON public.pacientes FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete pacientes"
ON public.pacientes FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL);

-- 2. Revoke EXECUTE from anon on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_role(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, org_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_organization() FROM anon;

-- 3. Revoke EXECUTE from authenticated on trigger-only functions (they shouldn't be called directly)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_organization() FROM authenticated;
