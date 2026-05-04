
-- Revoke from public role (default grant) on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_organization() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_org_role(uuid, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, org_role) FROM public;
