"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/shared/components";
import LoginView from "@/core/auth/components/LoginView";

export default function LoginPage() {
  const { isLoading } = useAuth();
  const router = useRouter();

  const handleSwitchToRegister = () => {
    router.push("/register");
  };

  const handleSwitchToForgotPassword = () => {
    router.push("/forgot-password");
  };

  if (isLoading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  return (
    <LoginView
      onSwitchToRegister={handleSwitchToRegister}
      onSwitchToForgotPassword={handleSwitchToForgotPassword}
      showSocialLogin={true}
    />
  );
}
