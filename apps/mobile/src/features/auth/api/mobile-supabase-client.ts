import type { CentralAuthUser } from "@openbot/contracts/ipc";
import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import type { MobileSession } from "./mobile-auth";

export const DEFAULT_SUPABASE_URL = "https://cyykmfdpdeavrelapyom.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_WG1kjNBaooUCB9gCelHOxA_5XN62mgZ";

const SECURE_STORE_PREFIX = "element_agents.mobile.supabase.";

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(`${SECURE_STORE_PREFIX}${key}`);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(`${SECURE_STORE_PREFIX}${key}`, value);
    } catch {
      // Ignore write errors
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(`${SECURE_STORE_PREFIX}${key}`);
    } catch {
      // Ignore delete errors
    }
  },
};

export const mobileSupabase: SupabaseClient = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function supabaseUserToCentralAuthUser(user: User): CentralAuthUser {
  const meta = user.user_metadata || {};
  const name = typeof meta.name === "string" && meta.name.trim() ? meta.name.trim() : null;
  const avatarUrl =
    typeof meta.avatar_url === "string" ? meta.avatar_url : typeof meta.picture === "string" ? meta.picture : null;

  return {
    id: user.id,
    email: user.email || "",
    name: name || user.email?.split("@")[0] || "User",
    avatarUrl: avatarUrl || undefined,
    createdAt: user.created_at || new Date().toISOString(),
    updatedAt: user.updated_at || new Date().toISOString(),
  };
}

export function supabaseSessionToMobileSession(session: Session): MobileSession {
  return {
    apiUrl: DEFAULT_SUPABASE_URL,
    sessionToken: session.access_token,
    user: supabaseUserToCentralAuthUser(session.user),
    signIn: "supabase",
  };
}

export function calculatePasswordStrength(val: string): number {
  if (!val) return 0;
  let score = 0;
  if (val.length >= 8) score += 1;
  if (/[a-zA-Z]/.test(val) && /\d/.test(val)) score += 1;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
  if (/[\W_]/.test(val) || val.length >= 12) score += 1;
  return Math.min(4, Math.max(1, score));
}

export async function signInWithSupabasePassword(email: string, password: string): Promise<MobileSession> {
  const { data, error } = await mobileSupabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.session) {
    throw new Error(error?.message || "Sign in failed");
  }
  return supabaseSessionToMobileSession(data.session);
}

export async function signUpWithSupabasePassword(
  email: string,
  password: string,
  name?: string,
): Promise<MobileSession> {
  const { data, error } = await mobileSupabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: name?.trim() ? { name: name.trim() } : undefined,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!data.session) {
    // Confirmation email sent or pending confirmation
    throw new Error("Please check your email for a confirmation link.");
  }
  return supabaseSessionToMobileSession(data.session);
}

export async function signInWithSupabaseGoogle(): Promise<MobileSession> {
  const redirectUrl = Linking.createURL("auth/callback", { scheme: "elementagents" });

  const { data, error } = await mobileSupabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    throw new Error(error?.message || "Could not initialize Google sign in");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type !== "success" || !result.url) {
    throw new Error("Google sign in cancelled");
  }

  // Parse access_token and refresh_token from redirect url (hash or query)
  const parsed = Linking.parse(result.url);
  const hashPart = result.url.split("#")[1];
  const hashParams = new URLSearchParams(hashPart ?? "");
  const queryParams = parsed.queryParams ?? {};

  const qToken = typeof queryParams.access_token === "string" ? queryParams.access_token : null;
  const qRefresh = typeof queryParams.refresh_token === "string" ? queryParams.refresh_token : null;
  const accessToken = hashParams.get("access_token") ?? qToken;
  const refreshToken = hashParams.get("refresh_token") ?? qRefresh;

  if (accessToken && refreshToken) {
    const { data: sessionData, error: sessionError } = await mobileSupabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError || !sessionData.session) {
      throw new Error(sessionError?.message ?? "Could not establish session from Google credentials");
    }
    return supabaseSessionToMobileSession(sessionData.session);
  }

  // If authorization code flow was returned instead of tokens
  const qCode = typeof queryParams.code === "string" ? queryParams.code : null;
  const code = hashParams.get("code") ?? qCode;
  if (code) {
    const { data: exchangeData, error: exchangeError } = await mobileSupabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !exchangeData.session) {
      throw new Error(exchangeError?.message ?? "Could not exchange code for session");
    }
    return supabaseSessionToMobileSession(exchangeData.session);
  }

  throw new Error("No session tokens received from Google sign in");
}

export async function getStoredSupabaseSession(): Promise<MobileSession | null> {
  const { data } = await mobileSupabase.auth.getSession();
  if (data?.session) {
    return supabaseSessionToMobileSession(data.session);
  }
  return null;
}

export async function signOutSupabase(): Promise<void> {
  await mobileSupabase.auth.signOut();
}
