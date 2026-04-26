import { AuthCard } from "../_components/auth-card";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Regístrate para guardar favoritos y consultar algoritmos."
    >
      <RegisterForm />
    </AuthCard>
  );
}
