import { Suspense } from "react";
import { AuthCard } from "../_components/auth-card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Entra con tu cuenta institucional o personal."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
