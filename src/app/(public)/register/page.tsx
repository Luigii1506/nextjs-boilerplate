"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/shared/components";
import RegisterView from "@/core/auth/components/RegisterView";

export default function RegisterPage() {
  const { isLoading } = useAuth();
  const router = useRouter();

  const handleSwitchToLogin = () => {
    router.push("/login");
  };

  if (isLoading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  return (
    <RegisterView
      onSwitchToLogin={handleSwitchToLogin}
      showSocialLogin={true}
    />
  );
}
