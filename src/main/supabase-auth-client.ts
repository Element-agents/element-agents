import { existsSync, readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { join } from "node:path";
import type {
  CentralAuthUser,
  GoogleSignInInput,
  PasswordSignInInput,
  PasswordSignUpInput,
} from "@openbot/contracts/ipc";
import { createOpenBotLogger } from "@openbot/logging";
import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import { BrowserWindow, shell } from "electron";

const logger = createOpenBotLogger("supabase-auth-client");

function loadEnvValue(key: string, rootDir?: string): string | null {
  const envVal = process.env[key];
  if (envVal?.trim()) {
    return envVal.trim();
  }
  const candidateDirs = [process.cwd(), rootDir].filter((d): d is string => Boolean(d));
  for (const dir of candidateDirs) {
    const envPath = join(dir, ".env");
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, "utf8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const [k, ...rest] = trimmed.split("=");
          if (k?.trim() === key) {
            const val = rest
              .join("=")
              .trim()
              .replace(/^["']|["']$/g, "");
            if (val) return val;
          }
        }
      } catch {
        // Ignore read errors
      }
    }
  }
  return null;
}

const DEFAULT_SUPABASE_URL = "https://cyykmfdpdeavrelapyom.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_WG1kjNBaooUCB9gCelHOxA_5XN62mgZ";

function renderSuccessHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Signed In - Element Agents</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #090a0f;
        color: #f3f4f6;
        overflow: hidden;
        position: relative;
      }
      .bg-lines {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 0;
      }
      .card {
        position: relative;
        z-index: 1;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1.25rem;
        padding: 3rem 3.5rem;
        text-align: center;
        backdrop-filter: blur(20px);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        max-width: 440px;
        width: 90%;
        animation: fadeIn 0.4s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .logo {
        width: 48px;
        height: 48px;
        margin: 0 auto 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
      }
      p {
        color: #94a3b8;
        font-size: 0.95rem;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <svg class="bg-lines" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id="left-g" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="right-g" x1="100%" y1="0%" x2="0%" y2="80%">
          <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g stroke="url(#left-g)">
        <path d="M -50,80 C 160,110 300,240 400,420 C 480,570 470,740 420,950" stroke-width="1.6"/>
        <path d="M -50,140 C 180,170 320,300 430,470 C 510,620 500,780 460,950" stroke-width="1.2"/>
        <path d="M -50,200 C 200,230 340,360 460,520 C 540,670 530,810 500,950" stroke-width="0.8"/>
      </g>
      <g stroke="url(#left-g)" stroke-dasharray="8 6">
        <path d="M -50,820 C 140,770 280,630 400,580 C 510,530 570,390 540,120" stroke-width="1.2"/>
        <path d="M -50,720 C 180,670 320,530 460,480 C 570,430 630,290 620,180" stroke-width="0.8"/>
      </g>
      <g stroke="url(#right-g)">
        <path d="M 1490,80 C 1280,110 1140,240 1040,420 C 960,570 970,740 1020,950" stroke-width="1.6"/>
        <path d="M 1490,140 C 1260,170 1120,300 1010,470 C 930,620 940,780 980,950" stroke-width="1.2"/>
        <path d="M 1490,200 C 1240,230 1100,360 980,520 C 900,670 910,810 940,950" stroke-width="0.8"/>
      </g>
      <g stroke="url(#right-g)" stroke-dasharray="8 6">
        <path d="M 1490,820 C 1300,770 1160,630 1040,580 C 930,530 870,390 900,120" stroke-width="1.2"/>
        <path d="M 1490,720 C 1260,670 1120,530 980,480 C 870,430 810,290 820,180" stroke-width="0.8"/>
      </g>
    </svg>
    <div class="card">
      <div class="logo">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
          <rect x="8" y="8" width="24" height="24" rx="4" stroke="#60a5fa" stroke-width="2.5" fill="none"/>
          <path d="M12 20h16M20 12v16" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h1>Signed in successfully</h1>
      <p>You can close this window and return to Element Agents.</p>
    </div>
    <script>
      setTimeout(() => { try { window.close(); } catch (_) {} }, 1500);
    </script>
  </body>
</html>`;
}

export class SupabaseAuthClient {
  readonly #client: SupabaseClient | null = null;
  readonly #inMemoryStorage = new Map<string, string>();
  #currentSession: Session | null = null;

  constructor(rootDir?: string) {
    const url =
      loadEnvValue("SUPABASE_URL", rootDir) ||
      loadEnvValue("NEXT_PUBLIC_SUPABASE_URL", rootDir) ||
      DEFAULT_SUPABASE_URL;
    const anonKey =
      loadEnvValue("SUPABASE_ANON_KEY", rootDir) ||
      loadEnvValue("SUPABASE_PUBLISHABLE_KEY", rootDir) ||
      loadEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", rootDir) ||
      loadEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY", rootDir) ||
      DEFAULT_SUPABASE_ANON_KEY;

    if (url && anonKey) {
      try {
        const storage = {
          getItem: (key: string) => this.#inMemoryStorage.get(key) ?? null,
          setItem: (key: string, value: string) => {
            this.#inMemoryStorage.set(key, value);
          },
          removeItem: (key: string) => {
            this.#inMemoryStorage.delete(key);
          },
        };
        this.#client = createClient(url, anonKey, {
          auth: {
            storage,
            flowType: "pkce",
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });
        logger.info("Supabase client initialized with provided configuration.");
      } catch (err) {
        logger.warn("Could not initialize Supabase client.", err);
      }
    } else {
      logger.info("Supabase credentials not found. Local authentication store will be used.");
    }
  }

  get isConfigured(): boolean {
    return this.#client !== null;
  }

  get currentSession(): Session | null {
    return this.#currentSession;
  }

  #userToCentralAuth(user: User): CentralAuthUser {
    const meta = user.user_metadata || {};
    const rawName = meta.full_name || meta.name || user.email?.split("@")[0] || null;
    const name = typeof rawName === "string" && rawName.trim() ? rawName.trim() : null;
    const avatarUrl =
      typeof meta.avatar_url === "string" ? meta.avatar_url : typeof meta.picture === "string" ? meta.picture : null;

    return {
      id: user.id,
      email: user.email || "",
      name,
      avatarUrl,
      chatColor: meta.chatColor || null,
    };
  }

  async signUpWithPassword(input: PasswordSignUpInput): Promise<CentralAuthUser> {
    if (!this.#client) throw new Error("Supabase is not configured.");
    const email = input.email.trim().toLowerCase();
    const { data, error } = await this.#client.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          has_completed_name_step: false,
          name: null,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Could not create user account.");
    }

    this.#currentSession = data.session;
    return this.#userToCentralAuth(data.user);
  }

  async signInWithPassword(input: PasswordSignInInput): Promise<CentralAuthUser> {
    if (!this.#client) throw new Error("Supabase is not configured.");
    const email = input.email.trim().toLowerCase();
    const { data, error } = await this.#client.auth.signInWithPassword({
      email,
      password: input.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("No user returned from authentication.");
    }

    this.#currentSession = data.session;
    return this.#userToCentralAuth(data.user);
  }

  async signInWithGoogle(_input?: GoogleSignInInput): Promise<CentralAuthUser> {
    const client = this.#client;
    if (!client) throw new Error("Supabase is not configured.");

    return new Promise<CentralAuthUser>((resolve, reject) => {
      let server: Server | null = null;
      let settled = false;

      const cleanup = () => {
        if (server) {
          try {
            server.close();
          } catch {
            // Ignore
          }
          server = null;
        }
      };

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(new Error("Google sign-in timed out. Please try again."));
        }
      }, 120_000);

      const focusApp = () => {
        try {
          BrowserWindow.getAllWindows().forEach((win) => {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
          });
        } catch {
          // Ignore focus errors
        }
      };

      server = createServer(async (req, res) => {
        const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

        if (reqUrl.pathname === "/callback") {
          const code = reqUrl.searchParams.get("code");

          if (code) {
            try {
              const { data, error } = await client.auth.exchangeCodeForSession(code);
              if (error) throw error;
              if (!data.user) throw new Error("No user returned from Google authentication.");

              this.#currentSession = data.session;
              const centralUser = this.#userToCentralAuth(data.user);

              res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
              res.end(renderSuccessHtml());

              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                cleanup();
                focusApp();
                resolve(centralUser);
              }
              return;
            } catch (exchangeError) {
              res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
              res.end("<p>Authentication exchange failed. Please close this window and try again.</p>");
              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                cleanup();
                reject(exchangeError instanceof Error ? exchangeError : new Error("OAuth exchange failed"));
              }
              return;
            }
          }

          // If no code in query params, serve a client-side fragment collector (implicit flow fallback)
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`
            <!DOCTYPE html>
            <html>
              <body>
                <script>
                  if (window.location.hash) {
                    const params = new URLSearchParams(window.location.hash.substring(1));
                    const access_token = params.get('access_token');
                    const refresh_token = params.get('refresh_token');
                    if (access_token && refresh_token) {
                      window.location.href = '/token-callback?access_token=' + encodeURIComponent(access_token) + '&refresh_token=' + encodeURIComponent(refresh_token);
                    }
                  }
                </script>
              </body>
            </html>
          `);
          return;
        }

        if (reqUrl.pathname === "/token-callback") {
          const accessToken = reqUrl.searchParams.get("access_token");
          const refreshToken = reqUrl.searchParams.get("refresh_token");

          if (accessToken && refreshToken) {
            try {
              const { data, error } = await client.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (error) throw error;
              if (!data.user) throw new Error("No user returned.");

              this.#currentSession = data.session;
              const centralUser = this.#userToCentralAuth(data.user);

              res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
              res.end(renderSuccessHtml());

              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                cleanup();
                focusApp();
                resolve(centralUser);
              }
              return;
            } catch (err) {
              res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
              res.end("<p>Setting session failed.</p>");
              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                cleanup();
                reject(err instanceof Error ? err : new Error("Failed to set session"));
              }
              return;
            }
          }
        }

        res.writeHead(404);
        res.end();
      });

      const startListening = (preferredPort: number = 54321) => {
        server
          ?.listen(preferredPort, "127.0.0.1", async () => {
            const address = server?.address();
            if (!address || typeof address === "string") {
              cleanup();
              reject(new Error("Failed to allocate local callback port"));
              return;
            }

            const port = address.port;
            const redirectTo = `http://127.0.0.1:${port}/callback`;

            try {
              const { data, error } = await client.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo,
                  skipBrowserRedirect: true,
                },
              });

              if (error) throw error;
              if (!data?.url) throw new Error("No authorization URL returned from Supabase.");

              // Probe the Supabase authorization URL to check if provider is enabled
              try {
                const probe = await fetch(data.url, { redirect: "manual" });
                if (probe.status >= 400) {
                  const body = await probe.text();
                  let msg = "Google provider is not enabled in your Supabase project.";
                  try {
                    const parsed = JSON.parse(body);
                    if (parsed.msg) msg = parsed.msg;
                  } catch {
                    // Ignore parse errors
                  }
                  throw new Error(msg);
                }
              } catch (probeError) {
                if (probeError instanceof Error && probeError.message.includes("provider")) {
                  throw probeError;
                }
              }

              await shell.openExternal(data.url);
            } catch (authError) {
              cleanup();
              clearTimeout(timeout);
              reject(authError instanceof Error ? authError : new Error("Failed to start Google sign-in"));
            }
          })
          .on("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "EADDRINUSE" && preferredPort !== 0) {
              logger.info(`Port ${preferredPort} in use, trying dynamic port`);
              startListening(0);
            } else if (!settled) {
              cleanup();
              clearTimeout(timeout);
              reject(err);
            }
          });
      };

      startListening(54321);
    });
  }

  async updateName(_userId: string, name: string): Promise<CentralAuthUser> {
    if (!this.#client) throw new Error("Supabase is not configured.");
    const trimmed = name.trim();
    const { data, error } = await this.#client.auth.updateUser({
      data: {
        name: trimmed,
        has_completed_name_step: true,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Could not update user name.");
    }

    return this.#userToCentralAuth(data.user);
  }

  async getUser(_userId: string): Promise<CentralAuthUser | null> {
    if (!this.#client) return null;
    try {
      const { data, error } = await this.#client.auth.getUser();
      if (error || !data.user) return null;
      return this.#userToCentralAuth(data.user);
    } catch {
      return null;
    }
  }

  async signOut(): Promise<void> {
    if (this.#client) {
      try {
        await this.#client.auth.signOut();
      } catch {
        // Ignore
      }
    }
    this.#currentSession = null;
  }
}
