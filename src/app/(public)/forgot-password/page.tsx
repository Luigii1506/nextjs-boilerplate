"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/shared/components";
import ForgotPasswordView from "@/core/auth/components/ForgotPasswordView";

export default function ForgotPasswordPage() {
  const { isLoading } = useAuth();
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push("/login");
  };

  if (isLoading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  return <ForgotPasswordView onBackToLogin={handleBackToLogin} />;
}
