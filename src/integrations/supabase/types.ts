export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      clinical_cases: {
        Row: {
          abordagem: string | null;
          created_at: string;
          data_fim: string | null;
          data_inicio: string | null;
          id: string;
          nivel_risco: string | null;
          observacoes: string | null;
          organization_id: string;
          patient_id: string;
          status: string;
          therapist_user_id: string;
          titulo: string | null;
          updated_at: string;
        };
        Insert: {
          abordagem?: string | null;
          created_at?: string;
          data_fim?: string | null;
          data_inicio?: string | null;
          id?: string;
          nivel_risco?: string | null;
          observacoes?: string | null;
          organization_id: string;
          patient_id: string;
          status?: string;
          therapist_user_id: string;
          titulo?: string | null;
          updated_at?: string;
        };
        Update: {
          abordagem?: string | null;
          created_at?: string;
          data_fim?: string | null;
          data_inicio?: string | null;
          id?: string;
          nivel_risco?: string | null;
          observacoes?: string | null;
          organization_id?: string;
          patient_id?: string;
          status?: string;
          therapist_user_id?: string;
          titulo?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_cases_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_cases_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      clinical_notes: {
        Row: {
          author_user_id: string;
          conduta: string | null;
          conteudo_livre: string | null;
          created_at: string;
          data_sessao: string | null;
          id: string;
          nivel_risco: string | null;
          observacoes: string | null;
          organization_id: string;
          patient_id: string;
          queixa_principal: string | null;
          resumo_ia: string | null;
          session_id: string | null;
          status: string;
          transcricao_audio: string | null;
          updated_at: string;
        };
        Insert: {
          author_user_id: string;
          conduta?: string | null;
          conteudo_livre?: string | null;
          created_at?: string;
          data_sessao?: string | null;
          id?: string;
          nivel_risco?: string | null;
          observacoes?: string | null;
          organization_id: string;
          patient_id: string;
          queixa_principal?: string | null;
          resumo_ia?: string | null;
          session_id?: string | null;
          status?: string;
          transcricao_audio?: string | null;
          updated_at?: string;
        };
        Update: {
          author_user_id?: string;
          conduta?: string | null;
          conteudo_livre?: string | null;
          created_at?: string;
          data_sessao?: string | null;
          id?: string;
          nivel_risco?: string | null;
          observacoes?: string | null;
          organization_id?: string;
          patient_id?: string;
          queixa_principal?: string | null;
          resumo_ia?: string | null;
          session_id?: string | null;
          status?: string;
          transcricao_audio?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_notes_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_notes_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          created_at: string;
          document_type: string | null;
          file_name: string;
          file_url: string;
          id: string;
          organization_id: string;
          patient_id: string | null;
          size_bytes: number | null;
          uploaded_by_user_id: string;
        };
        Insert: {
          created_at?: string;
          document_type?: string | null;
          file_name: string;
          file_url: string;
          id?: string;
          organization_id: string;
          patient_id?: string | null;
          size_bytes?: number | null;
          uploaded_by_user_id: string;
        };
        Update: {
          created_at?: string;
          document_type?: string | null;
          file_name?: string;
          file_url?: string;
          id?: string;
          organization_id?: string;
          patient_id?: string | null;
          size_bytes?: number | null;
          uploaded_by_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      evolucoes: {
        Row: {
          conduta: string | null;
          conteudo_livre: string | null;
          created_at: string;
          data_sessao: string;
          id: string;
          observacoes: string | null;
          paciente_id: string;
          queixa_principal: string | null;
          resumo_ia: string | null;
          status: string;
          transcricao_audio: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          conduta?: string | null;
          conteudo_livre?: string | null;
          created_at?: string;
          data_sessao?: string;
          id?: string;
          observacoes?: string | null;
          paciente_id: string;
          queixa_principal?: string | null;
          resumo_ia?: string | null;
          status?: string;
          transcricao_audio?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          conduta?: string | null;
          conteudo_livre?: string | null;
          created_at?: string;
          data_sessao?: string;
          id?: string;
          observacoes?: string | null;
          paciente_id?: string;
          queixa_principal?: string | null;
          resumo_ia?: string | null;
          status?: string;
          transcricao_audio?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evolucoes_paciente_id_fkey";
            columns: ["paciente_id"];
            isOneToOne: false;
            referencedRelation: "pacientes";
            referencedColumns: ["id"];
          },
        ];
      };
      google_calendar_tokens: {
        Row: {
          access_token: string;
          calendar_id: string | null;
          created_at: string;
          expires_at: string;
          google_email: string | null;
          id: string;
          refresh_token: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_token: string;
          calendar_id?: string | null;
          created_at?: string;
          expires_at: string;
          google_email?: string | null;
          id?: string;
          refresh_token: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          access_token?: string;
          calendar_id?: string | null;
          created_at?: string;
          expires_at?: string;
          google_email?: string | null;
          id?: string;
          refresh_token?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by_user_id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["org_role"];
          status: string;
          token: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by_user_id: string;
          organization_id: string;
          role?: Database["public"]["Enums"]["org_role"];
          status?: string;
          token?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by_user_id?: string;
          organization_id?: string;
          role?: Database["public"]["Enums"]["org_role"];
          status?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          organization_id: string;
          paid_at: string | null;
          patient_id: string | null;
          payment_method: string | null;
          session_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          organization_id: string;
          paid_at?: string | null;
          patient_id?: string | null;
          payment_method?: string | null;
          session_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          organization_id?: string;
          paid_at?: string | null;
          patient_id?: string | null;
          payment_method?: string | null;
          session_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      org_tasks: {
        Row: {
          assigned_to_user_id: string | null;
          created_at: string;
          created_by_user_id: string;
          data_limite: string | null;
          descricao: string | null;
          id: string;
          organization_id: string;
          patient_id: string | null;
          prioridade: string | null;
          status: string;
          titulo: string;
          updated_at: string;
        };
        Insert: {
          assigned_to_user_id?: string | null;
          created_at?: string;
          created_by_user_id: string;
          data_limite?: string | null;
          descricao?: string | null;
          id?: string;
          organization_id: string;
          patient_id?: string | null;
          prioridade?: string | null;
          status?: string;
          titulo: string;
          updated_at?: string;
        };
        Update: {
          assigned_to_user_id?: string | null;
          created_at?: string;
          created_by_user_id?: string;
          data_limite?: string | null;
          descricao?: string | null;
          id?: string;
          organization_id?: string;
          patient_id?: string | null;
          prioridade?: string | null;
          status?: string;
          titulo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_tasks_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_tasks_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_memberships: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          id: string;
          invited_at: string | null;
          invited_email: string | null;
          organization_id: string;
          role: Database["public"]["Enums"]["org_role"];
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          id?: string;
          invited_at?: string | null;
          invited_email?: string | null;
          organization_id: string;
          role?: Database["public"]["Enums"]["org_role"];
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          id?: string;
          invited_at?: string | null;
          invited_email?: string | null;
          organization_id?: string;
          role?: Database["public"]["Enums"]["org_role"];
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          address: string | null;
          city: string | null;
          created_at: string;
          email: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          owner_user_id: string;
          phone: string | null;
          slug: string;
          state: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          owner_user_id: string;
          phone?: string | null;
          slug: string;
          state?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          owner_user_id?: string;
          phone?: string | null;
          slug?: string;
          state?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      pacientes: {
        Row: {
          abordagem_terapeutica: string | null;
          apellido: string;
          created_at: string;
          email: string | null;
          estado: string;
          fecha_nacimiento: string | null;
          genero: string | null;
          id: string;
          motivo_consulta: string | null;
          nombre: string;
          telefono: string | null;
        };
        Insert: {
          abordagem_terapeutica?: string | null;
          apellido: string;
          created_at?: string;
          email?: string | null;
          estado?: string;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          id?: string;
          motivo_consulta?: string | null;
          nombre: string;
          telefono?: string | null;
        };
        Update: {
          abordagem_terapeutica?: string | null;
          apellido?: string;
          created_at?: string;
          email?: string | null;
          estado?: string;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          id?: string;
          motivo_consulta?: string | null;
          nombre?: string;
          telefono?: string | null;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          abordagem_terapeutica: string | null;
          contato_emergencia: string | null;
          contato_emergencia_telefone: string | null;
          cpf: string | null;
          created_at: string;
          created_by_user_id: string;
          data_nascimento: string | null;
          email: string | null;
          endereco: string | null;
          estado_civil: string | null;
          genero: string | null;
          id: string;
          motivo_consulta: string | null;
          nome_completo: string;
          observacoes: string | null;
          organization_id: string;
          profissao: string | null;
          status: string;
          telefone: string | null;
          updated_at: string;
        };
        Insert: {
          abordagem_terapeutica?: string | null;
          contato_emergencia?: string | null;
          contato_emergencia_telefone?: string | null;
          cpf?: string | null;
          created_at?: string;
          created_by_user_id: string;
          data_nascimento?: string | null;
          email?: string | null;
          endereco?: string | null;
          estado_civil?: string | null;
          genero?: string | null;
          id?: string;
          motivo_consulta?: string | null;
          nome_completo: string;
          observacoes?: string | null;
          organization_id: string;
          profissao?: string | null;
          status?: string;
          telefone?: string | null;
          updated_at?: string;
        };
        Update: {
          abordagem_terapeutica?: string | null;
          contato_emergencia?: string | null;
          contato_emergencia_telefone?: string | null;
          cpf?: string | null;
          created_at?: string;
          created_by_user_id?: string;
          data_nascimento?: string | null;
          email?: string | null;
          endereco?: string | null;
          estado_civil?: string | null;
          genero?: string | null;
          id?: string;
          motivo_consulta?: string | null;
          nome_completo?: string;
          observacoes?: string | null;
          organization_id?: string;
          profissao?: string | null;
          status?: string;
          telefone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          organization_id: string;
          paid_at: string | null;
          provider_reference: string | null;
          status: string;
          subscription_id: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          organization_id: string;
          paid_at?: string | null;
          provider_reference?: string | null;
          status?: string;
          subscription_id?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          organization_id?: string;
          paid_at?: string | null;
          provider_reference?: string | null;
          status?: string;
          subscription_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          crp: string | null;
          id: string;
          nome: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          crp?: string | null;
          id?: string;
          nome?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          crp?: string | null;
          id?: string;
          nome?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          clinical_case_id: string | null;
          created_at: string;
          duration_minutes: number | null;
          id: string;
          link_online: string | null;
          local: string | null;
          observacoes: string | null;
          organization_id: string;
          patient_id: string;
          plataforma_online: string | null;
          scheduled_at: string;
          session_type: string | null;
          status: string;
          therapist_user_id: string;
          updated_at: string;
          valor: number | null;
        };
        Insert: {
          clinical_case_id?: string | null;
          created_at?: string;
          duration_minutes?: number | null;
          id?: string;
          link_online?: string | null;
          local?: string | null;
          observacoes?: string | null;
          organization_id: string;
          patient_id: string;
          plataforma_online?: string | null;
          scheduled_at: string;
          session_type?: string | null;
          status?: string;
          therapist_user_id: string;
          updated_at?: string;
          valor?: number | null;
        };
        Update: {
          clinical_case_id?: string | null;
          created_at?: string;
          duration_minutes?: number | null;
          id?: string;
          link_online?: string | null;
          local?: string | null;
          observacoes?: string | null;
          organization_id?: string;
          patient_id?: string;
          plataforma_online?: string | null;
          scheduled_at?: string;
          session_type?: string | null;
          status?: string;
          therapist_user_id?: string;
          updated_at?: string;
          valor?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_clinical_case_id_fkey";
            columns: ["clinical_case_id"];
            isOneToOne: false;
            referencedRelation: "clinical_cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          billing_cycle: string | null;
          cancel_at_period_end: boolean | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          features: Json | null;
          id: string;
          max_patients: number;
          max_storage_mb: number;
          max_users: number;
          organization_id: string;
          plan: Database["public"]["Enums"]["subscription_plan"];
          provider_subscription_id: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          updated_at: string;
        };
        Insert: {
          billing_cycle?: string | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          features?: Json | null;
          id?: string;
          max_patients?: number;
          max_storage_mb?: number;
          max_users?: number;
          organization_id: string;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          billing_cycle?: string | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          features?: Json | null;
          id?: string;
          max_patients?: number;
          max_storage_mb?: number;
          max_users?: number;
          organization_id?: string;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_org_role: {
        Args: { _org_id: string; _user_id: string };
        Returns: Database["public"]["Enums"]["org_role"];
      };
      has_org_role: {
        Args: {
          _org_id: string;
          _role: Database["public"]["Enums"]["org_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_org_member: {
        Args: { _org_id: string; _user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      org_role: "admin" | "psicologo" | "recepcao" | "supervisor";
      subscription_plan: "trial" | "basico" | "profissional" | "clinica";
      subscription_status: "active" | "trial" | "past_due" | "canceled" | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      org_role: ["admin", "psicologo", "recepcao", "supervisor"],
      subscription_plan: ["trial", "basico", "profissional", "clinica"],
      subscription_status: ["active", "trial", "past_due", "canceled", "expired"],
    },
  },
} as const;
