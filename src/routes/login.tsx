import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, ShieldCheck, CalendarCheck, Brain, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroTherapy from "@/assets/hero-therapy.png";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const features = [
  { icon: Brain, label: "Prontuários", sub: "inteligentes" },
  { icon: CalendarCheck, label: "Agenda", sub: "integrada" },
  { icon: Heart, label: "Evoluções", sub: "clínicas" },
  { icon: ShieldCheck, label: "Sigilo", sub: "garantido" },
];

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [crp, setCrp] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (isSignUp && !nomeCompleto.trim()) {
      toast.error("Informe seu nome completo.");
      return;
    }
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: nomeCompleto.trim(),
              crp: crp.trim(),
            },
          },
        });
        if (error) throw error;
        toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Erro ao entrar com Google.");
      }
      if (result.redirected) return;
    } catch {
      toast.error("Erro ao conectar com Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary/5 via-accent/8 to-primary/3 p-12 xl:p-16">
        <div>
          <span className="text-lg font-semibold tracking-tight text-foreground">PSIQWELL</span>
        </div>

        <div className="max-w-lg">
          <h1 className="text-4xl font-light leading-tight text-foreground xl:text-5xl">
            Cuidado em <span className="font-semibold text-primary">saúde mental</span>
            <br />
            personalizado para você
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            O atendimento começa aqui
          </p>

          {/* Hero illustration */}
          <div className="mt-8 flex justify-center">
            <img
              src={heroTherapy}
              alt="Ilustração minimalista de sessão de terapia"
              width={320}
              height={320}
              className="opacity-80"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3.5 transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">
                    {f.label} <span className="font-medium text-primary">{f.sub}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} PSIQWELL · Sigilo garantido conforme o Código de Ética do
          Psicólogo
        </p>
      </div>

      {/* Right — form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:bg-card/50">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 text-center lg:hidden">
            <span className="text-lg font-semibold tracking-tight text-foreground">PSIQWELL</span>
            <p className="mt-1 text-sm text-muted-foreground">Gestão de consultório</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              {isSignUp ? "Criar conta" : "Bem-vindo de volta"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignUp
                ? "Cadastre-se como psicólogo(a) para gerenciar seus pacientes"
                : "Acesse sua conta para continuar"}
            </p>
          </div>

          {/* Google button first */}
          <Button
            variant="outline"
            className="w-full gap-2.5 h-11 rounded-xl border-border/80 font-medium"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continuar com Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs text-muted-foreground">ou com e-mail</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <form className="space-y-3.5" onSubmit={handleEmailAuth}>
            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nome completo</label>
                  <Input
                    type="text"
                    placeholder="Dr(a). Maria Silva"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    CRP <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="00/00000"
                    value={crp}
                    onChange={(e) => setCrp(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              className="w-full h-11 rounded-xl font-medium"
              type="submit"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>

          <p className="mt-8 text-center text-[11px] text-muted-foreground/60 leading-relaxed">
            Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do
            PSIQWELL.
          </p>
        </div>
      </div>
    </div>
  );
}
