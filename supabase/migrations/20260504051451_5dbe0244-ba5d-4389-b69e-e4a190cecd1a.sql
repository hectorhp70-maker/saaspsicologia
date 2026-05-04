
-- Enums
CREATE TYPE public.org_role AS ENUM ('admin', 'psicologo', 'recepcao', 'supervisor');
CREATE TYPE public.subscription_plan AS ENUM ('trial', 'basico', 'profissional', 'clinica');
CREATE TYPE public.subscription_status AS ENUM ('active', 'trial', 'past_due', 'canceled', 'expired');

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_user_id UUID NOT NULL,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_organizations_owner ON public.organizations(owner_user_id);
CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- ORGANIZATION MEMBERSHIPS
CREATE TABLE public.organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'psicologo',
  status TEXT NOT NULL DEFAULT 'active',
  invited_email TEXT,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
CREATE INDEX idx_memberships_user ON public.organization_memberships(user_id);
CREATE INDEX idx_memberships_org ON public.organization_memberships(organization_id);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'trial',
  status subscription_status NOT NULL DEFAULT 'trial',
  billing_cycle TEXT DEFAULT 'monthly',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  provider_subscription_id TEXT,
  max_users INT NOT NULL DEFAULT 1,
  max_patients INT NOT NULL DEFAULT 10,
  max_storage_mb INT NOT NULL DEFAULT 100,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_org ON public.subscriptions(organization_id);

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  provider_reference TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_org ON public.payments(organization_id);

-- INVITATIONS
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_by_user_id UUID NOT NULL,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'psicologo',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);
CREATE INDEX idx_invitations_org ON public.invitations(organization_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);

-- PATIENTS (multi-tenant)
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL,
  nome_completo TEXT NOT NULL,
  data_nascimento DATE,
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  genero TEXT,
  estado_civil TEXT,
  profissao TEXT,
  endereco TEXT,
  contato_emergencia TEXT,
  contato_emergencia_telefone TEXT,
  observacoes TEXT,
  motivo_consulta TEXT,
  abordagem_terapeutica TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_patients_org ON public.patients(organization_id);
CREATE INDEX idx_patients_status ON public.patients(organization_id, status);

-- CLINICAL CASES
CREATE TABLE public.clinical_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_user_id UUID NOT NULL,
  titulo TEXT,
  abordagem TEXT,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  nivel_risco TEXT DEFAULT 'baixo',
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clinical_cases_org ON public.clinical_cases(organization_id);
CREATE INDEX idx_clinical_cases_patient ON public.clinical_cases(patient_id);

-- SESSIONS
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinical_case_id UUID REFERENCES public.clinical_cases(id),
  therapist_user_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'agendada',
  session_type TEXT DEFAULT 'presencial',
  local TEXT,
  valor NUMERIC(10,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_org ON public.sessions(organization_id);
CREATE INDEX idx_sessions_scheduled ON public.sessions(organization_id, scheduled_at);
CREATE INDEX idx_sessions_patient ON public.sessions(patient_id);
CREATE INDEX idx_sessions_therapist ON public.sessions(therapist_user_id);

-- CLINICAL NOTES
CREATE TABLE public.clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id),
  author_user_id UUID NOT NULL,
  queixa_principal TEXT,
  observacoes TEXT,
  conduta TEXT,
  conteudo_livre TEXT,
  transcricao_audio TEXT,
  nivel_risco TEXT DEFAULT 'baixo',
  resumo_ia TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  data_sessao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clinical_notes_org ON public.clinical_notes(organization_id);
CREATE INDEX idx_clinical_notes_patient ON public.clinical_notes(patient_id);
CREATE INDEX idx_clinical_notes_session ON public.clinical_notes(session_id);

-- INVOICES
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id),
  session_id UUID REFERENCES public.sessions(id),
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX idx_invoices_patient ON public.invoices(patient_id);

-- TASKS
CREATE TABLE public.org_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_to_user_id UUID,
  created_by_user_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'media',
  data_limite DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_org_tasks_org ON public.org_tasks(organization_id);
CREATE INDEX idx_org_tasks_assigned ON public.org_tasks(assigned_to_user_id);

-- DOCUMENTS
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id),
  uploaded_by_user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  document_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_documents_org ON public.documents(organization_id);
CREATE INDEX idx_documents_patient ON public.documents(patient_id);

-- ENABLE RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER FUNCTIONS (tables exist now)
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.organization_memberships WHERE user_id = _user_id AND organization_id = _org_id AND status = 'active') $$;

CREATE OR REPLACE FUNCTION public.get_org_role(_user_id uuid, _org_id uuid)
RETURNS org_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.organization_memberships WHERE user_id = _user_id AND organization_id = _org_id AND status = 'active' LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _role org_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.organization_memberships WHERE user_id = _user_id AND organization_id = _org_id AND role = _role AND status = 'active') $$;

-- RLS POLICIES: organizations
CREATE POLICY "Members can view their organizations" ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id));
CREATE POLICY "Owner can update organization" ON public.organizations FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Authenticated users can create organizations" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

-- RLS POLICIES: organization_memberships
CREATE POLICY "Members can view memberships" ON public.organization_memberships FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can insert memberships" ON public.organization_memberships FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, 'admin') OR user_id = auth.uid());
CREATE POLICY "Admins can update memberships" ON public.organization_memberships FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));
CREATE POLICY "Admins can delete memberships" ON public.organization_memberships FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS POLICIES: subscriptions
CREATE POLICY "Members can view subscription" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can update subscription" ON public.subscriptions FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));
CREATE POLICY "Members can insert subscription" ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- RLS POLICIES: payments
CREATE POLICY "Admins can view payments" ON public.payments FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));
CREATE POLICY "System can insert payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- RLS POLICIES: invitations
CREATE POLICY "Admins can view invitations" ON public.invitations FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));
CREATE POLICY "Admins can create invitations" ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, 'admin'));
CREATE POLICY "Admins can update invitations" ON public.invitations FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));
CREATE POLICY "Admins can delete invitations" ON public.invitations FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS POLICIES: patients
CREATE POLICY "Members can view patients" ON public.patients FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Members can create patients" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id) AND created_by_user_id = auth.uid());
CREATE POLICY "Members can update patients" ON public.patients FOR UPDATE TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can delete patients" ON public.patients FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS POLICIES: clinical_cases
CREATE POLICY "Members can view cases" ON public.clinical_cases FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Therapists can create cases" ON public.clinical_cases FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id) AND therapist_user_id = auth.uid());
CREATE POLICY "Therapists can update cases" ON public.clinical_cases FOR UPDATE TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id) AND (therapist_user_id = auth.uid() OR public.has_org_role(auth.uid(), organization_id, 'admin')));
CREATE POLICY "Admins can delete cases" ON public.clinical_cases FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS POLICIES: sessions
CREATE POLICY "Members can view sessions" ON public.sessions FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Members can create sessions" ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Members can update sessions" ON public.sessions FOR UPDATE TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Staff can delete sessions" ON public.sessions FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin') OR therapist_user_id = auth.uid());

-- RLS POLICIES: clinical_notes (restricted from recepcao)
CREATE POLICY "Clinical staff can view notes" ON public.clinical_notes FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id) AND public.get_org_role(auth.uid(), organization_id) IN ('admin', 'psicologo', 'supervisor'));
CREATE POLICY "Therapists can create notes" ON public.clinical_notes FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id) AND author_user_id = auth.uid() AND public.get_org_role(auth.uid(), organization_id) IN ('admin', 'psicologo'));
CREATE POLICY "Authors can update notes" ON public.clinical_notes FOR UPDATE TO authenticated
  USING (author_user_id = auth.uid() AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can delete notes" ON public.clinical_notes FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS POLICIES: invoices
CREATE POLICY "Members can view invoices" ON public.invoices FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Members can create invoices" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Members can update invoices" ON public.invoices FOR UPDATE TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can delete invoices" ON public.invoices FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS POLICIES: org_tasks
CREATE POLICY "Members can view tasks" ON public.org_tasks FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Members can create tasks" ON public.org_tasks FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id) AND created_by_user_id = auth.uid());
CREATE POLICY "Members can update tasks" ON public.org_tasks FOR UPDATE TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Creators can delete tasks" ON public.org_tasks FOR DELETE TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id) AND (created_by_user_id = auth.uid() OR public.has_org_role(auth.uid(), organization_id, 'admin')));

-- RLS POLICIES: documents
CREATE POLICY "Members can view documents" ON public.documents FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Members can upload documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id) AND uploaded_by_user_id = auth.uid());
CREATE POLICY "Staff can delete documents" ON public.documents FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, 'admin') OR uploaded_by_user_id = auth.uid());

-- TRIGGERS for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.organization_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clinical_cases_updated_at BEFORE UPDATE ON public.clinical_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clinical_notes_updated_at BEFORE UPDATE ON public.clinical_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_org_tasks_updated_at BEFORE UPDATE ON public.org_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUTO SETUP: When an organization is created, add owner as admin + create trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_memberships (organization_id, user_id, role, status, accepted_at)
  VALUES (NEW.id, NEW.owner_user_id, 'admin', 'active', now());
  INSERT INTO public.subscriptions (organization_id, plan, status, trial_ends_at, max_users, max_patients, max_storage_mb)
  VALUES (NEW.id, 'trial', 'trial', now() + interval '14 days', 1, 10, 100);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_organization_created AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();
