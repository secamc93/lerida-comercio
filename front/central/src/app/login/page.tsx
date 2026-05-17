import { LoginForm } from "@/services/auth/login/ui";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-950 p-4">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏪</div>
          <h1 className="text-2xl font-bold text-emerald-900">Lérida Comercio</h1>
          <p className="text-sm text-stone-500">Panel administrativo</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
