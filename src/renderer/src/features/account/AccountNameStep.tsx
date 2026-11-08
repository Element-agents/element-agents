import { ArrowRight, Button, Input } from "@openbot/ui";
import { useText } from "@openbot/ui/text";
import { createSignal, Show } from "solid-js";

export interface AccountNameStepProps {
  initialName?: string;
  email: string;
  onSave: (name: string) => Promise<void>;
}

export function AccountNameStep(props: AccountNameStepProps) {
  const { t } = useText();
  const [name, setName] = createSignal(props.initialName?.trim() || "");
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let nameInput: HTMLInputElement | undefined;

  queueMicrotask(() => nameInput?.focus());

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault();
    const trimmed = name().trim();
    if (!trimmed) {
      setError(t("account.nameStep.required"));
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await props.onSave(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("account.nameStep.saveFailed"));
      setSaving(false);
    }
  };

  return (
    <main class="account-login-screen account-name-step-screen" aria-label={t("account.nameStep.screen")}>
      <svg
        class="account-name-step-bg"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Gradients for Left Lines */}
          <linearGradient id="lines-left-type1-grad" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.35" />
            <stop offset="45%" stop-color="currentColor" stop-opacity="0.18" />
            <stop offset="80%" stop-color="currentColor" stop-opacity="0.04" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="lines-left-type2-grad" x1="0%" y1="100%" x2="100%" y2="20%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.30" />
            <stop offset="50%" stop-color="currentColor" stop-opacity="0.14" />
            <stop offset="85%" stop-color="currentColor" stop-opacity="0.03" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>

          {/* Gradients for Right Lines */}
          <linearGradient id="lines-right-type1-grad" x1="100%" y1="0%" x2="0%" y2="80%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.35" />
            <stop offset="45%" stop-color="currentColor" stop-opacity="0.18" />
            <stop offset="80%" stop-color="currentColor" stop-opacity="0.04" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="lines-right-type2-grad" x1="100%" y1="100%" x2="0%" y2="20%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.30" />
            <stop offset="50%" stop-color="currentColor" stop-opacity="0.14" />
            <stop offset="85%" stop-color="currentColor" stop-opacity="0.03" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
        </defs>

        {/* LEFT SIDE - Line Type 1: Solid layered sweeping curves */}
        <g stroke="url(#lines-left-type1-grad)">
          <path d="M -50,80 C 160,110 300,240 400,420 C 480,570 470,740 420,950" stroke-width="1.6" />
          <path d="M -50,130 C 180,160 320,290 430,460 C 510,610 500,770 460,950" stroke-width="1.4" />
          <path d="M -50,180 C 200,210 340,340 460,500 C 540,650 530,800 500,950" stroke-width="1.2" />
          <path d="M -50,230 C 220,260 360,390 490,540 C 570,690 560,830 540,950" stroke-width="1.0" />
          <path d="M -50,280 C 240,310 380,440 520,580 C 600,730 590,860 580,950" stroke-width="0.8" />
        </g>

        {/* LEFT SIDE - Line Type 2: Dashed layered undulating contour curves */}
        <g stroke="url(#lines-left-type2-grad)" stroke-dasharray="8 6">
          <path d="M -50,820 C 140,770 280,630 400,580 C 510,530 570,390 540,120" stroke-width="1.4" />
          <path d="M -50,770 C 160,720 300,580 430,530 C 540,480 600,340 580,150" stroke-width="1.2" />
          <path d="M -50,720 C 180,670 320,530 460,480 C 570,430 630,290 620,180" stroke-width="1.0" />
          <path d="M -50,670 C 200,620 340,480 490,430 C 600,380 660,240 660,210" stroke-width="0.8" />
        </g>

        {/* RIGHT SIDE - Line Type 1: Solid layered sweeping curves */}
        <g stroke="url(#lines-right-type1-grad)">
          <path d="M 1490,80 C 1280,110 1140,240 1040,420 C 960,570 970,740 1020,950" stroke-width="1.6" />
          <path d="M 1490,130 C 1260,160 1120,290 1010,460 C 930,610 940,770 980,950" stroke-width="1.4" />
          <path d="M 1490,180 C 1240,210 1100,340 980,500 C 900,650 910,800 940,950" stroke-width="1.2" />
          <path d="M 1490,230 C 1220,260 1080,390 950,540 C 870,690 880,830 900,950" stroke-width="1.0" />
          <path d="M 1490,280 C 1200,310 1060,440 920,580 C 840,730 850,860 860,950" stroke-width="0.8" />
        </g>

        {/* RIGHT SIDE - Line Type 2: Dashed layered undulating contour curves */}
        <g stroke="url(#lines-right-type2-grad)" stroke-dasharray="8 6">
          <path d="M 1490,820 C 1300,770 1160,630 1040,580 C 930,530 870,390 900,120" stroke-width="1.4" />
          <path d="M 1490,770 C 1280,720 1140,580 1010,530 C 900,480 840,340 860,150" stroke-width="1.2" />
          <path d="M 1490,720 C 1260,670 1120,530 980,480 C 870,430 810,290 820,180" stroke-width="1.0" />
          <path d="M 1490,670 C 1240,620 1100,480 950,430 C 840,380 780,240 780,210" stroke-width="0.8" />
        </g>
      </svg>

      <div class="account-login-shell">
        <section class="account-login account-name-step-card">
          <h1 class="account-name-step-title">{t("account.nameStep.title")}</h1>

          <form
            class="account-login-form account-name-form"
            onSubmit={handleSubmit}
            aria-busy={saving() ? "true" : "false"}
          >
            <div class="account-name-input-group">
              <label for="account-display-name" class="account-name-label">
                {t("account.nameStep.nameLabel")}
              </label>
              <Input
                ref={(el) => (nameInput = el)}
                id="account-display-name"
                type="text"
                placeholder={t("account.nameStep.placeholder")}
                value={name()}
                onInput={(e) => {
                  setName(e.currentTarget.value);
                  if (error()) setError(null);
                }}
                disabled={saving()}
                autofocus
                class="account-name-input"
              />
            </div>

            <Show when={error()}>
              {(msg) => (
                <p class="account-login-error" role="alert">
                  {msg()}
                </p>
              )}
            </Show>

            <Button
              type="submit"
              variant="default"
              class="account-login-primary account-name-submit-btn"
              disabled={saving() || !name().trim()}
            >
              <Show
                when={saving()}
                fallback={
                  <span class="account-name-btn-content">
                    <span>{t("account.nameStep.launchApp")}</span>
                    <ArrowRight size={16} />
                  </span>
                }
              >
                <span class="account-login-button-spinner" aria-hidden="true" />
                <span>{t("account.nameStep.launching")}</span>
              </Show>
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
