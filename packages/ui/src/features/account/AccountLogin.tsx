import { INPUT_LIMITS } from "@openbot/contracts/input-limits";
import type {
  AppVariant,
  CentralAuthIssue,
  CentralAuthState,
  GoogleSignInInput,
  PasswordSignInInput,
  PasswordSignUpInput,
} from "@openbot/contracts/ipc";
import { normalizeEmailAddress, normalizeOneTimeCode } from "@openbot/contracts/validation";
import type { TranslatedLocale } from "@openbot/i18n";
import { ArrowLeft, Button, ErrorReference, Eye, EyeOff, Input, RefreshCw } from "@openbot/ui";
import { errorReference, type UserErrorDetails } from "@openbot/user-errors";
import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, onCleanup, Show, untrack } from "solid-js";
import { useText } from "../../text";
import { OtpInput, type OtpInputStatus } from "./OtpInput";

export interface AccountLoginProps {
  variant: AppVariant;
  state: CentralAuthState;
  onRetry: () => Promise<void>;
  onRequestEmailCode: (email: string) => Promise<void>;
  onVerifyEmailCode: (challengeId: string, code: string) => Promise<void>;
  onSignInWithPassword?: (input: PasswordSignInInput) => Promise<void>;
  onSignUpWithPassword?: (input: PasswordSignUpInput) => Promise<void>;
  onSignInWithGoogle?: (input?: GoogleSignInInput) => Promise<void>;
  onReset: () => Promise<void>;
  /** Opens the company sign-in page again: in the browser on desktop, in this tab on the web. */
  onOpenCompanySignIn?: () => Promise<void>;
  /** A choice under the send button, such as the analytics box of the web app. */
  consent?: JSX.Element;
  /** Fine print under the lock line, such as the Terms of Service notice of the web app. */
  notice?: JSX.Element;
  /** The language the screen is in. The button that opens the language choice again shows its name. */
  language?: TranslatedLocale;
  /** Opens the language choice again, so a reader who chose a language they cannot read can leave it. */
  onChangeLanguage?: () => void;
}

type PendingAction = "retry" | "send" | "check" | "verify" | "resend" | "reset" | "company" | "password" | "google";
type LoginStep = "email" | "code" | "company";
type LoginTransition = "none" | "forward" | "back";

const FIELD_ISSUES = new Set([
  "invalid_email",
  "invalid_sign_in_code",
  "sign_in_code_expired",
  "too_many_code_attempts",
]);
const NEW_CODE_ISSUES = new Set(["sign_in_code_expired", "too_many_code_attempts"]);
const UNCERTAIN_EMAIL_DELIVERY_ISSUES = new Set([
  "email_delivery_pending",
  "email_delivery_timeout",
  "email_delivery_unknown",
]);

const EMAIL_PLACEHOLDER = "you@example.com";
const EMAIL_MARKER = "\u0000";

function GoogleIcon(props: { size?: number }) {
  return (
    <svg width={props.size ?? 18} height={props.size ?? 18} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function AccountLogin(props: AccountLoginProps) {
  const { t, sourceText } = useText();
  const [authMethod] = createSignal<"password" | "code">("password");
  const [authMode, setAuthMode] = createSignal<"sign_in" | "sign_up">("sign_in");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
  const [passwordError, setPasswordError] = createSignal<string | null>(null);

  const passwordStrength = () => {
    const val = password();
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score += 1;
    if (/[a-zA-Z]/.test(val) && /\d/.test(val)) score += 1;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
    if (/[\W_]/.test(val) || val.length >= 12) score += 1;
    return Math.min(4, Math.max(1, score));
  };

  const passwordStrengthLabel = () => {
    const s = passwordStrength();
    switch (s) {
      case 1:
        return t("account.login.strengthWeak");
      case 2:
        return t("account.login.strengthFair");
      case 3:
        return t("account.login.strengthGood");
      case 4:
        return t("account.login.strengthStrong");
      default:
        return "";
    }
  };
  const [email, setEmail] = createSignal("");
  const [code, setCode] = createSignal("");
  const [presentedEmailError, setPresentedEmailError] = createSignal<string | null>(null);
  const [emailErrorActive, setEmailErrorActive] = createSignal(false);
  const [emailShaking, setEmailShaking] = createSignal(false);
  const [codeError, setCodeError] = createSignal<string | null>(null);
  const [localError, setLocalError] = createSignal<UserErrorDetails | null>(null);
  const [pendingAction, setPendingAction] = createSignal<PendingAction | null>(null);
  const [issueVisible, setIssueVisible] = createSignal(true);
  const [issueBlockedUntil, setIssueBlockedUntil] = createSignal(0);
  const [now, setNow] = createSignal(Date.now());
  const [loginTransition, setLoginTransition] = createSignal<LoginTransition>("none");
  let emailInput: HTMLInputElement | undefined;
  let emailShakeTimer: number | undefined;
  let emailRevertTimer: number | undefined;
  let emailMessageTimer: number | undefined;

  onCleanup(clearEmailErrorTimers);

  // `now()` exists for the two countdowns below and nothing else, so the clock
  // runs only while one of them is on screen. Arming it at creation instead
  // woke the view once a second for its whole life, including the ordinary case
  // where there is nothing to count down.
  const countdownUntil = createMemo(() => {
    const resendAt = props.state.status === "code_sent" ? props.state.resendAvailableAt : 0;
    return Math.max(resendAt, issueBlockedUntil());
  });

  createEffect(
    () => countdownUntil(),
    (until) => {
      setNow(Date.now());
      if (until <= Date.now()) return;
      const clock = window.setInterval(() => {
        setNow(Date.now());
        // Stop at the deadline rather than wait for the next state change: the
        // label has reached zero and no later tick can change it.
        if (Date.now() >= until) window.clearInterval(clock);
      }, 1_000);
      return () => window.clearInterval(clock);
    },
  );

  const codeSent = () => props.state.status === "code_sent";
  const verified = () => props.state.status === "signed_in";
  const companySignIn = () => (props.state.status === "company_sign_in" ? props.state : undefined);
  const loginStep = (): LoginStep => (companySignIn() ? "company" : codeSent() || verified() ? "code" : "email");
  const challenge = () => (props.state.status === "code_sent" ? props.state : undefined);
  const connecting = () => props.state.status === "loading";
  const currentIssue = (): CentralAuthIssue | undefined => {
    if (props.state.status === "error") return props.state.issue;
    return props.state.status === "code_sent" || props.state.status === "company_sign_in"
      ? props.state.issue
      : undefined;
  };
  const displayedIssue = () => (issueVisible() ? currentIssue() : undefined);
  const unavailable = () => props.state.status === "error" && props.state.issue.code === "auth_api_unavailable";
  const unavailableIssue = () => (unavailable() && props.state.status === "error" ? props.state.issue : undefined);
  const codeNeedsReplacement = () => {
    const issue = currentIssue();
    return Boolean(issue && NEW_CODE_ISSUES.has(issue.code));
  };
  const resendAvailableIn = () => {
    if (props.state.status !== "code_sent") return 0;
    return secondsUntil(Math.max(props.state.resendAvailableAt, issueBlockedUntil()), now());
  };
  const emailRetryIn = () => {
    const issue = currentIssue();
    return issue?.retryAfterSeconds ? secondsUntil(issueBlockedUntil(), now()) : 0;
  };
  const emailDeliveryUncertain = () => {
    const issue = displayedIssue();
    return Boolean(issue && UNCERTAIN_EMAIL_DELIVERY_ISSUES.has(issue.code));
  };
  const emailSubmitLabel = () => {
    const retryIn = emailRetryIn();
    if (emailDeliveryUncertain()) {
      return retryIn > 0
        ? t("account.login.checkAgainIn", { time: formatTimer(retryIn) })
        : t("account.login.checkDelivery");
    }
    return retryIn > 0 ? t("account.login.tryAgainIn", { time: formatTimer(retryIn) }) : t("account.login.sendCode");
  };
  const emailBusy = () =>
    pendingAction() === "send" ||
    pendingAction() === "check" ||
    pendingAction() === "password" ||
    pendingAction() === "google" ||
    props.state.status === "signing_in";
  const codeBusy = () => pendingAction() === "verify";
  const resendBusy = () => pendingAction() === "resend";
  const formIssue = createMemo(() => {
    const issue = displayedIssue();
    return issue && !FIELD_ISSUES.has(issue.code) ? issue : undefined;
  });
  const displayedCodeError = () => {
    const visibleIssue = displayedIssue();
    const issue = currentIssue();
    if (codeError()) return codeError();
    if (visibleIssue?.code === "invalid_sign_in_code") return sourceText(visibleIssue.message);
    return issue && NEW_CODE_ISSUES.has(issue.code) ? sourceText(issue.message) : null;
  };
  const companyDescriptionParts = () => {
    const [before = "", after = ""] = t("account.login.companyDescription", { email: EMAIL_MARKER }).split(
      EMAIL_MARKER,
    );
    return [before, after] as const;
  };
  const codeSentParts = () => {
    const [before = "", after = ""] = t("account.login.codeSent", { email: EMAIL_MARKER }).split(EMAIL_MARKER);
    return [before, after] as const;
  };
  const otpStatus = (): OtpInputStatus => {
    if (verified()) return "success";
    if (codeBusy()) return "verifying";
    if (displayedCodeError()) return "error";
    return "idle";
  };

  createEffect(
    () => loginStep(),
    (step, previousStep) => {
      if (!previousStep || step === previousStep) return;
      setLoginTransition(step === "email" ? "back" : "forward");
    },
  );

  createEffect(
    () => currentIssue(),
    (issue) => {
      setNow(Date.now());
      setIssueVisible(true);
      setIssueBlockedUntil(issue?.retryAfterSeconds ? Date.now() + issue.retryAfterSeconds * 1_000 : 0);
      if (issue?.code === "invalid_email") showEmailError(sourceText(issue.message));
    },
  );

  createEffect(
    () => (props.state.status === "code_sent" ? props.state.challengeId : null),
    (challengeId, previousChallengeId) => {
      if (!challengeId) return;
      setNow(Date.now());
      if (!previousChallengeId || challengeId === previousChallengeId) return;
      setCode("");
      setCodeError(null);
    },
  );

  createEffect(
    () => props.state.status,
    (status, previousStatus) => {
      if (status === previousStatus) return;
      if (status === "signed_out" || (status === "error" && !unavailable())) {
        queueMicrotask(() => emailInput?.focus());
      }
    },
  );

  function validateEmail(value: string): string | null {
    if (!value.trim()) return t("account.login.emailRequired");
    return normalizeEmailAddress(value) ? null : t("account.login.emailInvalid");
  }

  function clearEmailErrorTimers(): void {
    if (emailShakeTimer !== undefined) window.clearTimeout(emailShakeTimer);
    if (emailRevertTimer !== undefined) window.clearTimeout(emailRevertTimer);
    if (emailMessageTimer !== undefined) window.clearTimeout(emailMessageTimer);
    emailShakeTimer = undefined;
    emailRevertTimer = undefined;
    emailMessageTimer = undefined;
  }

  function motionDuration(name: string, fallback: number): number {
    const value = Number.parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  }

  function hideEmailError(): void {
    clearEmailErrorTimers();
    setEmailErrorActive(false);
    setEmailShaking(false);
    emailMessageTimer = window.setTimeout(
      () => {
        emailMessageTimer = undefined;
        setPresentedEmailError(null);
      },
      motionDuration("--revert-dur", 280),
    );
  }

  function showEmailError(message: string): void {
    clearEmailErrorTimers();
    setPresentedEmailError(message);
    setEmailErrorActive(true);

    setEmailShaking(false);
    if (emailInput) void emailInput.offsetWidth;
    setEmailShaking(true);

    const shakeDuration = motionDuration("--shake-dur-a", 80) * 2 + motionDuration("--shake-dur-b", 60) * 2;
    emailShakeTimer = window.setTimeout(() => {
      emailShakeTimer = undefined;
      setEmailShaking(false);
    }, shakeDuration + 20);

    emailRevertTimer = window.setTimeout(() => {
      emailRevertTimer = undefined;
      setEmailErrorActive(false);
      emailMessageTimer = window.setTimeout(
        () => {
          emailMessageTimer = undefined;
          setPresentedEmailError(null);
        },
        motionDuration("--revert-dur", 280),
      );
    }, shakeDuration + motionDuration("--revert-hold", 3_000));
  }

  /**
   * Show a failed action with the code of its cause. When the action already gave a typed issue,
   * that issue explains the failure, so a general sentence does not replace it.
   */
  function showActionError(error: unknown, message: string, keepIssue: boolean): void {
    if (keepIssue && displayedIssue()) return;
    setLocalError({ message, reference: errorReference(error) });
  }

  function handleEmailInput(value: string): void {
    setEmail(value);
    setIssueVisible(false);
    setLocalError(null);
    hideEmailError();
  }

  function handleCodeInput(value: string): void {
    setCode(value);
    setIssueVisible(false);
    setLocalError(null);
    setCodeError(null);
  }

  async function submitEmail(): Promise<void> {
    if (pendingAction() || emailBusy() || emailRetryIn() > 0) return;
    const validationError = validateEmail(email());
    if (validationError) {
      showEmailError(validationError);
      emailInput?.focus();
      return;
    }
    const normalizedEmail = normalizeEmailAddress(email());
    if (!normalizedEmail) return;
    const action: PendingAction = emailDeliveryUncertain() ? "check" : "send";
    setEmail(normalizedEmail);
    setIssueVisible(false);
    setLocalError(null);
    setPendingAction(action);
    try {
      await props.onRequestEmailCode(normalizedEmail);
    } catch (error) {
      showActionError(error, t("account.login.sendFailed"), true);
    } finally {
      setPendingAction(null);
    }
  }

  async function submitCode(value = code()): Promise<void> {
    if (props.state.status !== "code_sent" || pendingAction() || codeBusy() || codeNeedsReplacement()) return;
    const normalizedCode = normalizeOneTimeCode(value);
    if (!normalizedCode) {
      setCodeError(t("account.login.codeIncomplete"));
      return;
    }
    setCodeError(null);
    setIssueVisible(false);
    setLocalError(null);
    setPendingAction("verify");
    try {
      await props.onVerifyEmailCode(props.state.challengeId, formatCode(normalizedCode));
    } catch (error) {
      showActionError(error, t("account.login.verifyFailed"), true);
    } finally {
      setPendingAction(null);
    }
  }

  async function resendCode(): Promise<void> {
    if (props.state.status !== "code_sent" || pendingAction() || resendBusy() || resendAvailableIn() > 0) return;
    setIssueVisible(false);
    setLocalError(null);
    setPendingAction("resend");
    try {
      await props.onRequestEmailCode(props.state.email);
    } catch (error) {
      showActionError(error, t("account.login.resendFailed"), true);
    } finally {
      setPendingAction(null);
    }
  }

  async function retryConnection(): Promise<void> {
    if (pendingAction()) return;
    setPendingAction("retry");
    setLocalError(null);
    try {
      await props.onRetry();
    } catch (error) {
      showActionError(error, t("account.login.stillUnreachable"), false);
    } finally {
      setPendingAction(null);
    }
  }

  async function openCompanySignIn(): Promise<void> {
    if (pendingAction() || !props.onOpenCompanySignIn) return;
    setPendingAction("company");
    setIssueVisible(false);
    setLocalError(null);
    try {
      await props.onOpenCompanySignIn();
    } catch (error) {
      showActionError(error, t("account.login.companyOpenFailed"), false);
    } finally {
      setPendingAction(null);
    }
  }

  async function resetEmail(): Promise<void> {
    if (pendingAction()) return;
    setPendingAction("reset");
    setLocalError(null);
    try {
      await props.onReset();
      setCode("");
      setCodeError(null);
      setIssueVisible(false);
    } catch (error) {
      showActionError(error, t("account.login.resetFailed"), false);
    } finally {
      setPendingAction(null);
    }
  }

  async function submitPassword(): Promise<void> {
    if (pendingAction()) return;
    const emailVal = email().trim();
    const passVal = password();
    const confirmVal = confirmPassword();

    const emailErr = validateEmail(emailVal);
    if (emailErr) {
      showEmailError(emailErr);
      emailInput?.focus();
      return;
    }

    if (!passVal) {
      setPasswordError(t("account.login.passwordRequired"));
      return;
    }

    if (authMode() === "sign_up") {
      if (passVal.length < 8) {
        setPasswordError(t("account.login.passwordMinLength"));
        return;
      }
      const hasLetter = /[a-zA-Z]/.test(passVal);
      const hasNumberOrSymbol = /[\d\W_]/.test(passVal);
      if (!hasLetter || !hasNumberOrSymbol) {
        setPasswordError(t("account.login.passwordRequirements"));
        return;
      }
      if (passVal !== confirmVal) {
        setPasswordError(t("account.login.passwordMismatch"));
        return;
      }
    }

    setPasswordError(null);
    setIssueVisible(false);
    setLocalError(null);
    setPendingAction("password");

    try {
      const normalizedEmail = normalizeEmailAddress(emailVal) ?? emailVal;
      if (authMode() === "sign_up") {
        if (props.onSignUpWithPassword) {
          await props.onSignUpWithPassword({ email: normalizedEmail, password: passVal });
        }
      } else {
        if (props.onSignInWithPassword) {
          await props.onSignInWithPassword({ email: normalizedEmail, password: passVal });
        }
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : authMode() === "sign_up"
            ? t("account.login.createAccountFailed")
            : t("account.login.signInFailed");
      showActionError(error, msg, false);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleGoogleSignIn(): Promise<void> {
    if (pendingAction() || !props.onSignInWithGoogle) return;
    setPendingAction("google");
    setIssueVisible(false);
    setLocalError(null);
    try {
      await props.onSignInWithGoogle();
    } catch (error: unknown) {
      showActionError(error, error instanceof Error ? error.message : t("account.login.googleSignInFailed"), false);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main class="account-login-screen">
      <svg
        class="account-login-bg account-name-step-bg"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="login-lines-left-type1-grad" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.35" />
            <stop offset="45%" stop-color="currentColor" stop-opacity="0.18" />
            <stop offset="80%" stop-color="currentColor" stop-opacity="0.04" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="login-lines-left-type2-grad" x1="0%" y1="100%" x2="100%" y2="20%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.30" />
            <stop offset="50%" stop-color="currentColor" stop-opacity="0.14" />
            <stop offset="85%" stop-color="currentColor" stop-opacity="0.03" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="login-lines-right-type1-grad" x1="100%" y1="0%" x2="0%" y2="80%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.35" />
            <stop offset="45%" stop-color="currentColor" stop-opacity="0.18" />
            <stop offset="80%" stop-color="currentColor" stop-opacity="0.04" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="login-lines-right-type2-grad" x1="100%" y1="100%" x2="0%" y2="20%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.30" />
            <stop offset="50%" stop-color="currentColor" stop-opacity="0.14" />
            <stop offset="85%" stop-color="currentColor" stop-opacity="0.03" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
        </defs>

        {/* LEFT SIDE - Line Type 1: Solid layered sweeping curves */}
        <g stroke="url(#login-lines-left-type1-grad)">
          <path d="M -50,80 C 160,110 300,240 400,420 C 480,570 470,740 420,950" stroke-width="1.6" />
          <path d="M -50,130 C 180,160 320,290 430,460 C 510,610 500,770 460,950" stroke-width="1.4" />
          <path d="M -50,180 C 200,210 340,340 460,500 C 540,650 530,800 500,950" stroke-width="1.2" />
          <path d="M -50,230 C 220,260 360,390 490,540 C 570,690 560,830 540,950" stroke-width="1.0" />
          <path d="M -50,280 C 240,310 380,440 520,580 C 600,730 590,860 580,950" stroke-width="0.8" />
        </g>

        {/* LEFT SIDE - Line Type 2: Dashed layered undulating contour curves */}
        <g stroke="url(#login-lines-left-type2-grad)" stroke-dasharray="8 6">
          <path d="M -50,820 C 140,770 280,630 400,580 C 510,530 570,390 540,120" stroke-width="1.4" />
          <path d="M -50,770 C 160,720 300,580 430,530 C 540,480 600,340 580,150" stroke-width="1.2" />
          <path d="M -50,720 C 180,670 320,530 460,480 C 570,430 630,290 620,180" stroke-width="1.0" />
          <path d="M -50,670 C 200,620 340,480 490,430 C 600,380 660,240 660,210" stroke-width="0.8" />
        </g>

        {/* RIGHT SIDE - Line Type 1: Solid layered sweeping curves */}
        <g stroke="url(#login-lines-right-type1-grad)">
          <path d="M 1490,80 C 1280,110 1140,240 1040,420 C 960,570 970,740 1020,950" stroke-width="1.6" />
          <path d="M 1490,130 C 1260,160 1120,290 1010,460 C 930,610 940,770 980,950" stroke-width="1.4" />
          <path d="M 1490,180 C 1240,210 1100,340 980,500 C 900,650 910,800 940,950" stroke-width="1.2" />
          <path d="M 1490,230 C 1220,260 1080,390 950,540 C 870,690 880,830 900,950" stroke-width="1.0" />
          <path d="M 1490,280 C 1200,310 1060,440 920,580 C 840,730 850,860 860,950" stroke-width="0.8" />
        </g>

        {/* RIGHT SIDE - Line Type 2: Dashed layered undulating contour curves */}
        <g stroke="url(#login-lines-right-type2-grad)" stroke-dasharray="8 6">
          <path d="M 1490,820 C 1300,770 1160,630 1040,580 C 930,530 870,390 900,120" stroke-width="1.4" />
          <path d="M 1490,770 C 1280,720 1140,580 1010,530 C 900,480 840,340 860,150" stroke-width="1.2" />
          <path d="M 1490,720 C 1260,670 1120,530 980,480 C 870,430 810,290 820,180" stroke-width="1.0" />
          <path d="M 1490,670 C 1240,620 1100,480 950,430 C 840,380 780,240 780,210" stroke-width="0.8" />
        </g>
      </svg>

      <div class={authMode() === "sign_up" ? "account-login-shell is-signup" : "account-login-shell"}>
        <section
          class="account-login"
          data-step={loginStep()}
          data-transition={loginTransition()}
          aria-labelledby="account-login-title"
        >
          <h1 id="account-login-title" class="account-login-title">
            {connecting()
              ? t("account.login.connectingTitle")
              : unavailable()
                ? t("account.login.unavailableTitle")
                : verified()
                  ? t("account.login.signedInTitle")
                  : companySignIn()
                    ? t("account.login.companyTitle")
                    : codeSent()
                      ? t("account.login.checkInboxTitle")
                      : t("account.login.signInTitle")}
          </h1>
          <Show when={challenge() || verified() || companySignIn()}>
            <p id="account-login-description" class="account-login-description">
              <Show
                when={!companySignIn()}
                fallback={
                  <>
                    {companyDescriptionParts()[0]}
                    <strong>{companySignIn()?.email}</strong>
                    {companyDescriptionParts()[1]}
                  </>
                }
              >
                {verified() ? (
                  t("account.login.codeAccepted")
                ) : (
                  <>
                    {codeSentParts()[0]}
                    <strong>{challenge()?.email}</strong>
                    {codeSentParts()[1]}
                  </>
                )}
              </Show>
            </p>
          </Show>

          <Show when={connecting()}>
            <div class="account-login-loader" role="status" aria-live="polite">
              <span class="account-login-spinner" aria-hidden="true" />
              <span>{t("account.login.connectingSecurely")}</span>
            </div>
          </Show>

          <Show when={unavailableIssue()}>
            {(issue) => (
              <>
                <ErrorReference reference={issue().reference} />
                <Show when={localError()}>
                  {(failure) => (
                    <p class="account-login-error" role="alert">
                      {failure().message}
                      <ErrorReference reference={failure().reference} />
                    </p>
                  )}
                </Show>
                <Button
                  variant="default"
                  type="button"
                  class="account-login-primary"
                  disabled={pendingAction() === "retry"}
                  onClick={() => void retryConnection()}
                >
                  <Show when={pendingAction() === "retry"} fallback={t("common.tryAgain")}>
                    <span class="account-login-button-spinner" aria-hidden="true" />
                    {t("common.connecting")}
                  </Show>
                </Button>
              </>
            )}
          </Show>

          <Show when={companySignIn()}>
            <div class="account-login-form" data-auth-panel="company" aria-busy={pendingAction() ? "true" : "false"}>
              <Show
                when={formIssue()}
                fallback={
                  <div class="account-login-loader" role="status" aria-live="polite">
                    <span class="account-login-spinner" aria-hidden="true" />
                    <span>{t("account.login.companyWaiting")}</span>
                  </div>
                }
              >
                {(issue) => (
                  <p class="account-login-error" role="alert">
                    {sourceText(issue().message)}
                    <ErrorReference reference={issue().reference} />
                  </p>
                )}
              </Show>
              <Show when={localError()}>
                {(failure) => (
                  <p class="account-login-error" role="alert">
                    {failure().message}
                    <ErrorReference reference={failure().reference} />
                  </p>
                )}
              </Show>
              <Show when={props.onOpenCompanySignIn}>
                <Button
                  variant="default"
                  type="button"
                  class="account-login-primary"
                  disabled={pendingAction() !== null}
                  onClick={() => void openCompanySignIn()}
                >
                  <Show when={pendingAction() === "company"} fallback={t("account.login.companyOpenAgain")}>
                    <span class="account-login-button-spinner" aria-hidden="true" />
                    {t("account.login.companyOpening")}
                  </Show>
                </Button>
              </Show>
              <div class="account-login-code-actions">
                <Button
                  type="button"
                  class="account-login-code-action account-login-code-action-change"
                  variant="ghost"
                  size="sm"
                  disabled={pendingAction() !== null}
                  data-cuelume-tap="navigate"
                  onClick={() => void resetEmail()}
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  {t("account.login.companyUseAnotherEmail")}
                </Button>
              </div>
            </div>
          </Show>

          <Show when={!connecting() && !unavailable() && !companySignIn()}>
            <Show
              when={challenge() || verified()}
              fallback={
                <div class="account-login-form-container">
                  <Show when={props.onSignInWithGoogle}>
                    <button
                      type="button"
                      class="account-login-google-btn"
                      disabled={pendingAction() !== null}
                      onClick={() => void handleGoogleSignIn()}
                    >
                      <GoogleIcon size={18} />
                      <span>
                        {pendingAction() === "google" ? t("common.connecting") : t("account.login.continueWithGoogle")}
                      </span>
                    </button>
                    <div class="account-login-divider">
                      <span>{t("account.login.orContinueWithEmail")}</span>
                    </div>
                  </Show>

                  <Show
                    when={authMethod() === "password"}
                    fallback={
                      <form
                        class="account-login-form"
                        data-auth-panel="email"
                        aria-busy={emailBusy() ? "true" : "false"}
                        novalidate
                        onSubmit={(event) => {
                          event.preventDefault();
                          void submitEmail();
                        }}
                      >
                        <label class="sr-only" for="account-email">
                          {t("account.login.email")}
                        </label>
                        <div class={`account-login-email-field t-input-wrap${emailErrorActive() ? " is-error" : ""}`}>
                          <Input
                            ref={(element) => (emailInput = element)}
                            class={`t-input${emailErrorActive() ? " is-error" : ""}${emailShaking() ? " is-shaking" : ""}`}
                            id="account-email"
                            type="email"
                            autocomplete="email"
                            autocapitalize="none"
                            inputmode="email"
                            spellcheck={false}
                            placeholder={EMAIL_PLACEHOLDER}
                            maxlength={INPUT_LIMITS.email}
                            value={email()}
                            aria-invalid={emailErrorActive() ? "true" : undefined}
                            aria-describedby={emailErrorActive() ? "account-email-error" : undefined}
                            autofocus
                            onBlur={() => {
                              const value = untrack(email);
                              const validationError = value.trim() ? validateEmail(value) : null;
                              if (validationError) showEmailError(validationError);
                              else hideEmailError();
                            }}
                            onValueChange={handleEmailInput}
                          />
                          <p
                            id="account-email-error"
                            class="account-login-field-error t-error-msg"
                            role="alert"
                            aria-hidden={emailErrorActive() ? undefined : "true"}
                          >
                            {presentedEmailError()}
                          </p>
                        </div>

                        <Show when={formIssue()}>
                          {(issue) => (
                            <p class="account-login-error" role="alert">
                              {sourceText(issue().message)}
                              <ErrorReference reference={issue().reference} />
                            </p>
                          )}
                        </Show>
                        <Show when={localError()}>
                          {(failure) => (
                            <p class="account-login-error" role="alert">
                              {failure().message}
                              <ErrorReference reference={failure().reference} />
                            </p>
                          )}
                        </Show>

                        <Button
                          variant="default"
                          type="submit"
                          class="account-login-primary"
                          disabled={emailBusy() || !email().trim() || emailRetryIn() > 0}
                        >
                          <Show when={emailBusy()} fallback={emailSubmitLabel()}>
                            <span class="account-login-button-spinner" aria-hidden="true" />
                            {pendingAction() === "check"
                              ? t("account.login.checkingDelivery")
                              : t("account.login.sendingCode")}
                          </Show>
                        </Button>
                      </form>
                    }
                  >
                    <div class="account-login-tabs" role="tablist">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={authMode() === "sign_in" ? "true" : "false"}
                        class={`account-login-tab${authMode() === "sign_in" ? " is-active" : ""}`}
                        onClick={() => {
                          setAuthMode("sign_in");
                          setPasswordError(null);
                          setLocalError(null);
                        }}
                      >
                        {t("account.login.tabSignIn")}
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={authMode() === "sign_up" ? "true" : "false"}
                        class={`account-login-tab${authMode() === "sign_up" ? " is-active" : ""}`}
                        onClick={() => {
                          setAuthMode("sign_up");
                          setPasswordError(null);
                          setLocalError(null);
                        }}
                      >
                        {t("account.login.tabCreateAccount")}
                      </button>
                    </div>

                    <form
                      class="account-login-form"
                      data-auth-panel="password"
                      aria-busy={emailBusy() ? "true" : "false"}
                      novalidate
                      onSubmit={(event) => {
                        event.preventDefault();
                        void submitPassword();
                      }}
                    >
                      <label class="sr-only" for="account-email">
                        {t("account.login.email")}
                      </label>
                      <div class={`account-login-email-field t-input-wrap${emailErrorActive() ? " is-error" : ""}`}>
                        <Input
                          ref={(element) => (emailInput = element)}
                          class={`t-input${emailErrorActive() ? " is-error" : ""}${emailShaking() ? " is-shaking" : ""}`}
                          id="account-email"
                          type="email"
                          autocomplete="email"
                          autocapitalize="none"
                          inputmode="email"
                          spellcheck={false}
                          placeholder={EMAIL_PLACEHOLDER}
                          maxlength={INPUT_LIMITS.email}
                          value={email()}
                          aria-invalid={emailErrorActive() ? "true" : undefined}
                          aria-describedby={emailErrorActive() ? "account-email-error" : undefined}
                          autofocus
                          onBlur={() => {
                            const value = untrack(email);
                            const validationError = value.trim() ? validateEmail(value) : null;
                            if (validationError) showEmailError(validationError);
                            else hideEmailError();
                          }}
                          onValueChange={handleEmailInput}
                        />
                        <p
                          id="account-email-error"
                          class="account-login-field-error t-error-msg"
                          role="alert"
                          aria-hidden={emailErrorActive() ? undefined : "true"}
                        >
                          {presentedEmailError()}
                        </p>
                      </div>

                      <div class={authMode() === "sign_up" ? "account-password-row is-signup" : "account-password-row"}>
                        <div class="account-password-input-wrap t-input-wrap">
                          <Input
                            class="t-input"
                            id="account-password"
                            type={showPassword() ? "text" : "password"}
                            placeholder={t("account.login.password")}
                            value={password()}
                            onValueChange={(val) => {
                              setPassword(val);
                              setPasswordError(null);
                              setLocalError(null);
                            }}
                            autocomplete={authMode() === "sign_up" ? "new-password" : "current-password"}
                          />
                          <button
                            type="button"
                            class="account-password-toggle"
                            aria-label={
                              showPassword() ? t("account.login.hidePassword") : t("account.login.showPassword")
                            }
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword() ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        <Show when={authMode() === "sign_up"}>
                          <div class="account-password-input-wrap t-input-wrap">
                            <Input
                              class="t-input"
                              id="account-confirm-password"
                              type={showConfirmPassword() ? "text" : "password"}
                              placeholder={t("account.login.confirmPassword")}
                              value={confirmPassword()}
                              onValueChange={(val) => {
                                setConfirmPassword(val);
                                setPasswordError(null);
                                setLocalError(null);
                              }}
                              autocomplete="new-password"
                            />
                            <button
                              type="button"
                              class="account-password-toggle"
                              aria-label={
                                showConfirmPassword()
                                  ? t("account.login.hidePassword")
                                  : t("account.login.showPassword")
                              }
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                              {showConfirmPassword() ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </Show>
                      </div>

                      <Show when={authMode() === "sign_up" && password().length > 0}>
                        <div class="account-password-meter" aria-live="polite">
                          <div class="account-password-meter-bars">
                            <div
                              class={`account-password-meter-bar${passwordStrength() >= 1 ? " is-active" : ""}`}
                              data-strength={passwordStrength()}
                            />
                            <div
                              class={`account-password-meter-bar${passwordStrength() >= 2 ? " is-active" : ""}`}
                              data-strength={passwordStrength()}
                            />
                            <div
                              class={`account-password-meter-bar${passwordStrength() >= 3 ? " is-active" : ""}`}
                              data-strength={passwordStrength()}
                            />
                            <div
                              class={`account-password-meter-bar${passwordStrength() >= 4 ? " is-active" : ""}`}
                              data-strength={passwordStrength()}
                            />
                          </div>
                          <div class="account-password-meter-info">
                            <span class="account-password-strength-hint">
                              {passwordStrength() < 2 ? t("account.login.passwordRequirements") : ""}
                            </span>
                            <span class="account-password-strength-label" data-strength={passwordStrength()}>
                              {passwordStrengthLabel()}
                            </span>
                          </div>
                        </div>
                      </Show>

                      <Show when={passwordError()}>
                        {(err) => (
                          <p class="account-login-error" role="alert">
                            {err()}
                          </p>
                        )}
                      </Show>

                      <Show when={formIssue()}>
                        {(issue) => (
                          <p class="account-login-error" role="alert">
                            {sourceText(issue().message)}
                            <ErrorReference reference={issue().reference} />
                          </p>
                        )}
                      </Show>
                      <Show when={localError()}>
                        {(failure) => (
                          <p class="account-login-error" role="alert">
                            {failure().message}
                            <ErrorReference reference={failure().reference} />
                          </p>
                        )}
                      </Show>

                      <Button
                        variant="default"
                        type="submit"
                        class="account-login-primary"
                        disabled={pendingAction() !== null || !email().trim() || !password()}
                      >
                        <Show
                          when={pendingAction() === "password"}
                          fallback={
                            authMode() === "sign_up"
                              ? t("account.login.createAccountAction")
                              : t("account.login.signInAction")
                          }
                        >
                          <span class="account-login-button-spinner" aria-hidden="true" />
                          {authMode() === "sign_up" ? t("account.login.creatingAccount") : t("account.login.signingIn")}
                        </Show>
                      </Button>
                    </form>
                  </Show>
                </div>
              }
            >
              <div
                class="account-login-form"
                data-auth-panel="code"
                aria-busy={codeBusy() || resendBusy() ? "true" : "false"}
              >
                <OtpInput
                  value={code()}
                  status={otpStatus()}
                  hint={t("account.login.codeHint")}
                  errorMessage={displayedCodeError()}
                  successMessage={t("account.login.verified")}
                  disabled={codeNeedsReplacement() || resendBusy()}
                  autofocus
                  onChange={handleCodeInput}
                  onComplete={(value) => void submitCode(value)}
                />

                <Show when={challenge()?.developmentCode}>
                  {(developmentCode) => (
                    <p class="account-login-development-code">
                      {t("account.login.developmentCode", { code: developmentCode() })}
                    </p>
                  )}
                </Show>
                <Show when={formIssue()}>
                  {(issue) => (
                    <p class="account-login-error" role="alert">
                      {sourceText(issue().message)}
                      <ErrorReference reference={issue().reference} />
                    </p>
                  )}
                </Show>
                <Show when={localError()}>
                  {(failure) => (
                    <p class="account-login-error" role="alert">
                      {failure().message}
                      <ErrorReference reference={failure().reference} />
                    </p>
                  )}
                </Show>

                <Show when={!verified()}>
                  <Show when={codeNeedsReplacement()}>
                    <Button
                      variant="default"
                      type="button"
                      class="account-login-primary"
                      disabled={pendingAction() !== null || resendAvailableIn() > 0}
                      onClick={() => void resendCode()}
                    >
                      <Show
                        when={resendBusy()}
                        fallback={
                          resendAvailableIn() > 0
                            ? t("account.login.sendNewCodeIn", { time: formatTimer(resendAvailableIn()) })
                            : t("account.login.sendNewCode")
                        }
                      >
                        <span class="account-login-button-spinner" aria-hidden="true" />
                        {t("account.login.sendingNewCode")}
                      </Show>
                    </Button>
                  </Show>

                  <div class="account-login-code-actions">
                    <Button
                      type="button"
                      class="account-login-code-action account-login-code-action-change"
                      variant="ghost"
                      size="sm"
                      disabled={pendingAction() !== null}
                      data-cuelume-tap="navigate"
                      onClick={() => void resetEmail()}
                    >
                      <ArrowLeft size={14} aria-hidden="true" />
                      {t("account.login.changeEmail")}
                    </Button>
                    <Show when={!codeNeedsReplacement()}>
                      <Button
                        type="button"
                        class="account-login-code-action account-login-code-action-resend"
                        variant="ghost"
                        size="sm"
                        disabled={pendingAction() !== null || resendAvailableIn() > 0}
                        loading={resendBusy()}
                        loadingLabel={t("common.sending")}
                        onClick={() => void resendCode()}
                      >
                        <RefreshCw size={14} aria-hidden="true" />
                        {resendAvailableIn() > 0
                          ? t("account.login.resendIn", { time: formatTimer(resendAvailableIn()) })
                          : t("account.login.resend")}
                      </Button>
                    </Show>
                  </div>
                </Show>
              </div>
            </Show>
          </Show>
        </section>
      </div>
    </main>
  );
}

function formatCode(value: string): string {
  const compact = normalizeOneTimeCode(value) ?? value.replaceAll("-", "");
  return compact.length > 4 ? `${compact.slice(0, 4)}-${compact.slice(4)}` : compact;
}

function secondsUntil(timestamp: number, now: number): number {
  return Math.max(0, Math.ceil((timestamp - now) / 1_000));
}

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
