import { Button, Spinner, Typography } from "heroui-native";
import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import ScanLine from "lucide-react-native/icons/scan-line";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import type { MobileSession } from "@/features/auth/api/mobile-auth";
import {
  calculatePasswordStrength,
  signInWithSupabaseGoogle,
  signInWithSupabasePassword,
  signUpWithSupabasePassword,
} from "@/features/auth/api/mobile-supabase-client";
import { GoogleIcon } from "@/features/auth/components/google-icon";
import { SIGN_IN_CONTROL_HEIGHT, useSignInColors } from "@/features/auth/components/sign-in-colors";
import { haptics } from "@/shared/lib/haptics";
import { selectionColorProps } from "@/shared/lib/selection-color";
import { useText } from "@/shared/lib/text";

interface SupabaseAuthPaneProps {
  onSuccess: (session: MobileSession) => void;
  onScanQr: () => void;
  onLayout?: (height: number) => void;
  reduced?: boolean;
}

export function SupabaseAuthPane({ onSuccess, onScanQr, onLayout }: SupabaseAuthPaneProps) {
  const { t } = useText();
  const colors = useSignInColors();
  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = calculatePasswordStrength(password);

  const getStrengthColor = (level: number) => {
    if (strength < level) return "rgba(255, 255, 255, 0.12)";
    if (strength === 1) return "#EF4444";
    if (strength === 2) return "#F97316";
    if (strength === 3) return "#EAB308";
    return "#10B981";
  };

  const strengthLabel = () => {
    switch (strength) {
      case 1:
        return t("mobile.auth.supabase.strengthWeak");
      case 2:
        return t("mobile.auth.supabase.strengthFair");
      case 3:
        return t("mobile.auth.supabase.strengthGood");
      case 4:
        return t("mobile.auth.supabase.strengthStrong");
      default:
        return "";
    }
  };

  const handlePasswordAuth = async () => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage(t("mobile.auth.supabase.error.emailRequired"));
      return;
    }
    if (!password) {
      setErrorMessage(t("mobile.auth.supabase.error.passwordRequired"));
      return;
    }

    if (mode === "sign_up") {
      if (password.length < 8) {
        setErrorMessage(t("mobile.auth.supabase.error.passwordLength"));
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(t("mobile.auth.supabase.error.passwordMismatch"));
        return;
      }
    }

    setLoading(true);
    void haptics.impact("light");

    try {
      if (mode === "sign_in") {
        const session = await signInWithSupabasePassword(email, password);
        onSuccess(session);
      } else {
        const session = await signUpWithSupabasePassword(email, password, name);
        onSuccess(session);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("mobile.auth.error.verifyFailed");
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    void haptics.impact("light");
    try {
      const session = await signInWithSupabaseGoogle();
      onSuccess(session);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("cancelled")) {
        setErrorMessage(msg || t("mobile.auth.error.verifyFailed"));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View className="w-full" onLayout={({ nativeEvent: { layout } }) => onLayout?.(layout.height)}>
      {/* Title */}
      <View className="mb-4">
        <Typography.Heading type="h2" accessibilityRole="header" className="tracking-openbot-tight text-center">
          {mode === "sign_in" ? t("mobile.auth.supabase.title") : t("mobile.auth.supabase.createTitle")}
        </Typography.Heading>
        <Typography.Paragraph color="muted" className="mt-1 text-center text-sm">
          {mode === "sign_in" ? t("mobile.auth.supabase.subtitle") : t("mobile.auth.supabase.createSubtitle")}
        </Typography.Paragraph>
      </View>

      {/* Mode Switcher */}
      <View
        className="mb-5 flex-row rounded-full p-1 self-center"
        style={{ backgroundColor: colors.surface, width: "100%", maxWidth: 320 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("mobile.auth.supabase.signInTab")}
          className="flex-1 py-1.5 rounded-full items-center justify-center"
          style={{ backgroundColor: mode === "sign_in" ? colors.brand : "transparent" }}
          onPress={() => {
            void haptics.selection();
            setMode("sign_in");
            setErrorMessage(null);
          }}
        >
          <Typography.Paragraph
            className="text-xs font-semibold"
            style={{ color: mode === "sign_in" ? colors.onBrand : colors.muted }}
          >
            {t("mobile.auth.supabase.signInTab")}
          </Typography.Paragraph>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("mobile.auth.supabase.signUpTab")}
          className="flex-1 py-1.5 rounded-full items-center justify-center"
          style={{ backgroundColor: mode === "sign_up" ? colors.brand : "transparent" }}
          onPress={() => {
            void haptics.selection();
            setMode("sign_up");
            setErrorMessage(null);
          }}
        >
          <Typography.Paragraph
            className="text-xs font-semibold"
            style={{ color: mode === "sign_up" ? colors.onBrand : colors.muted }}
          >
            {t("mobile.auth.supabase.signUpTab")}
          </Typography.Paragraph>
        </Pressable>
      </View>

      {/* Fields Container */}
      <View className="gap-3">
        {mode === "sign_up" && (
          <View
            style={{
              height: SIGN_IN_CONTROL_HEIGHT,
              borderRadius: colors.radius,
              backgroundColor: colors.surface,
            }}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t("mobile.auth.supabase.namePlaceholder")}
              placeholderTextColor={colors.muted}
              accessibilityLabel={t("mobile.auth.supabase.namePlaceholder")}
              autoCapitalize="words"
              autoCorrect={false}
              {...selectionColorProps(colors.brand)}
              className="flex-1 px-4 font-sans text-[16px]"
              style={{ color: colors.text }}
            />
          </View>
        )}

        {/* Email Field */}
        <View
          style={{
            height: SIGN_IN_CONTROL_HEIGHT,
            borderRadius: colors.radius,
            backgroundColor: colors.surface,
          }}
        >
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("mobile.auth.supabase.emailPlaceholder")}
            placeholderTextColor={colors.muted}
            accessibilityLabel={t("mobile.auth.supabase.emailPlaceholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            autoCorrect={false}
            spellCheck={false}
            {...selectionColorProps(colors.brand)}
            className="flex-1 px-4 font-sans text-[16px]"
            style={{ color: colors.text }}
          />
        </View>

        {/* Password Field */}
        <View
          className="flex-row items-center pr-3"
          style={{
            height: SIGN_IN_CONTROL_HEIGHT,
            borderRadius: colors.radius,
            backgroundColor: colors.surface,
          }}
        >
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("mobile.auth.supabase.passwordPlaceholder")}
            placeholderTextColor={colors.muted}
            accessibilityLabel={t("mobile.auth.supabase.passwordPlaceholder")}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            autoCorrect={false}
            spellCheck={false}
            {...selectionColorProps(colors.brand)}
            className="flex-1 px-4 font-sans text-[16px]"
            style={{ color: colors.text }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            hitSlop={8}
            onPress={() => {
              void haptics.selection();
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.muted} strokeWidth={2} />
            ) : (
              <Eye size={18} color={colors.muted} strokeWidth={2} />
            )}
          </Pressable>
        </View>

        {/* Confirm Password & Strength Meter (Sign Up mode only) */}
        {mode === "sign_up" && (
          <>
            <View
              className="flex-row items-center pr-3"
              style={{
                height: SIGN_IN_CONTROL_HEIGHT,
                borderRadius: colors.radius,
                backgroundColor: colors.surface,
              }}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t("mobile.auth.supabase.confirmPasswordPlaceholder")}
                placeholderTextColor={colors.muted}
                accessibilityLabel={t("mobile.auth.supabase.confirmPasswordPlaceholder")}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                autoCorrect={false}
                spellCheck={false}
                {...selectionColorProps(colors.brand)}
                className="flex-1 px-4 font-sans text-[16px]"
                style={{ color: colors.text }}
              />
            </View>

            {/* 4-tier interactive strength meter */}
            {password.length > 0 && (
              <View className="mt-1 px-1">
                <View className="flex-row gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      className="flex-1 rounded-full"
                      style={{ backgroundColor: getStrengthColor(level) }}
                    />
                  ))}
                </View>
                <View className="flex-row justify-between items-center mt-1">
                  <Typography.Paragraph type="body-sm" color="muted" className="text-[11px]">
                    {strength < 2
                      ? t("mobile.auth.supabase.strengthHintWeak")
                      : t("mobile.auth.supabase.strengthHintGood")}
                  </Typography.Paragraph>
                  <Typography.Paragraph
                    type="body-sm"
                    className="text-[11px] font-semibold"
                    style={{ color: getStrengthColor(strength) }}
                  >
                    {strengthLabel()}
                  </Typography.Paragraph>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* Error Message */}
      {errorMessage && (
        <View className="mt-3 px-1">
          <Typography.Paragraph
            type="body-sm"
            accessibilityRole="alert"
            className="text-xs text-red-400 text-center font-medium"
          >
            {errorMessage}
          </Typography.Paragraph>
        </View>
      )}

      {/* Submit Button */}
      <View className="mt-5">
        <Button
          size="lg"
          variant="ghost"
          feedbackVariant="scale"
          className="w-full"
          accessibilityLabel={
            mode === "sign_in" ? t("mobile.auth.supabase.signInTab") : t("mobile.auth.supabase.signUpTab")
          }
          style={{
            height: SIGN_IN_CONTROL_HEIGHT,
            borderRadius: colors.radius,
            backgroundColor: colors.brand,
          }}
          onPress={handlePasswordAuth}
          disabled={loading || googleLoading}
        >
          {loading ? (
            <Spinner size="sm" color={colors.onBrand} />
          ) : (
            <Button.Label className="font-sans font-semibold text-[16px]" style={{ color: colors.onBrand }}>
              {mode === "sign_in" ? t("mobile.auth.supabase.signInTab") : t("mobile.auth.supabase.signUpTab")}
            </Button.Label>
          )}
        </Button>
      </View>

      {/* Divider */}
      <View className="my-4 flex-row items-center gap-3 px-2">
        <View className="flex-1 h-[1px] bg-white/10" />
        <Typography.Paragraph color="muted" className="text-xs uppercase tracking-wider">
          {t("mobile.auth.supabase.orDivider")}
        </Typography.Paragraph>
        <View className="flex-1 h-[1px] bg-white/10" />
      </View>

      {/* Google OAuth Button */}
      <Button
        size="lg"
        variant="ghost"
        feedbackVariant="scale"
        className="w-full flex-row items-center justify-center gap-2"
        accessibilityLabel={t("mobile.auth.supabase.googleButton")}
        style={{
          height: SIGN_IN_CONTROL_HEIGHT,
          borderRadius: colors.radius,
          backgroundColor: colors.surface,
        }}
        onPress={handleGoogleAuth}
        disabled={loading || googleLoading}
      >
        {googleLoading ? (
          <Spinner size="sm" color={colors.text} />
        ) : (
          <View className="flex-row items-center gap-2.5">
            <GoogleIcon size={18} />
            <Button.Label className="font-sans font-medium text-[15px]" style={{ color: colors.text }}>
              {t("mobile.auth.supabase.googleButton")}
            </Button.Label>
          </View>
        )}
      </Button>

      {/* QR Code Secondary Button */}
      <View className="mt-3">
        <Button
          size="lg"
          variant="ghost"
          feedbackVariant="scale"
          className="w-full flex-row items-center justify-center gap-2"
          accessibilityLabel={t("mobile.auth.supabase.qrButton")}
          style={{
            height: SIGN_IN_CONTROL_HEIGHT,
            borderRadius: colors.radius,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.12)",
          }}
          onPress={() => {
            void haptics.impact("light");
            onScanQr();
          }}
        >
          <View className="flex-row items-center gap-2">
            <ScanLine size={18} color={colors.muted} strokeWidth={1.75} />
            <Button.Label className="font-sans text-[14px]" style={{ color: colors.muted }}>
              {t("mobile.auth.supabase.qrButton")}
            </Button.Label>
          </View>
        </Button>
      </View>
    </View>
  );
}
