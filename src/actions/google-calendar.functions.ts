import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GOOGLE_CALENDAR_SCOPES =
  "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events";

export const getGoogleAuthUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ redirectUri: z.string().url().max(500) }).parse(data),
  )
  .handler(async ({ data }) => {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    if (!clientId) throw new Error("GOOGLE_CALENDAR_CLIENT_ID não configurado");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: data.redirectUri,
      response_type: "code",
      scope: GOOGLE_CALENDAR_SCOPES,
      access_type: "offline",
      prompt: "consent",
    });

    return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` };
  });

export const exchangeGoogleCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        code: z.string().min(1).max(2000),
        redirectUri: z.string().url().max(500),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      throw new Error("Credenciais do Google Calendar não configuradas");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: data.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: data.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(`Erro ao trocar código: ${tokens.error_description || tokens.error}`);
    }

    // Get Google email
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userinfo = await userinfoRes.json();

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Upsert tokens
    const { error } = await context.supabase.from("google_calendar_tokens").upsert(
      {
        user_id: context.userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        google_email: userinfo.email || null,
      },
      { onConflict: "user_id" },
    );

    if (error) throw new Error(`Erro ao salvar tokens: ${error.message}`);

    return { success: true, email: userinfo.email };
  });

export const getGoogleCalendarStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("google_calendar_tokens")
      .select("google_email, expires_at")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return {
      connected: !!data,
      email: data?.google_email || null,
      expiresAt: data?.expires_at || null,
    };
  });

export const disconnectGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("google_calendar_tokens")
      .delete()
      .eq("user_id", context.userId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getValidAccessToken(supabase: any, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Google Calendar não conectado");

  const now = new Date();
  const expiresAt = new Date(data.expires_at);

  if (now < expiresAt) return data.access_token;

  // Refresh token
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Credenciais não configuradas");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const refreshed = await res.json();
  if (!res.ok) throw new Error(`Erro ao renovar token: ${refreshed.error}`);

  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  await supabase
    .from("google_calendar_tokens")
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpiresAt,
    })
    .eq("user_id", userId);

  return refreshed.access_token;
}

export const getGoogleCalendarEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        timeMin: z.string().max(50),
        timeMax: z.string().max(50),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const accessToken = await getValidAccessToken(context.supabase, context.userId);

    const params = new URLSearchParams({
      timeMin: data.timeMin,
      timeMax: data.timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const result = await res.json();
    if (!res.ok)
      throw new Error(`Erro ao buscar eventos: ${result.error?.message || res.statusText}`);

    return {
      events: (result.items || []).map((e: Record<string, unknown>) => ({
        id: e.id,
        summary: e.summary || "Sem título",
        start:
          (e.start as Record<string, string>)?.dateTime ||
          (e.start as Record<string, string>)?.date,
        end: (e.end as Record<string, string>)?.dateTime || (e.end as Record<string, string>)?.date,
        status: e.status,
        htmlLink: e.htmlLink,
      })),
    };
  });
