"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { changePasswordAction } from "@/services/auth/login/infra/actions";

export function ChangePasswordPanel() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!current || !next || !confirm) {
      setError("Todos los campos son requeridos");
      return;
    }
    if (next.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (next !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (current === next) {
      setError("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    startTransition(async () => {
      try {
        const r = await changePasswordAction({ current_password: current, new_password: next });
        if (r.success) {
          setSuccess(r.message || "Contraseña actualizada correctamente");
          setCurrent("");
          setNext("");
          setConfirm("");
        } else {
          setError("No se pudo cambiar la contraseña");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
      }
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow p-6">
        <h1 className="text-xl font-bold text-emerald-900 mb-1">Cambiar contraseña</h1>
        <p className="text-sm text-stone-500 mb-5">Por seguridad, ingresa la actual y elige una nueva.</p>

        <form onSubmit={submit} className="space-y-3">
          <Field label="Contraseña actual" value={current} onChange={setCurrent} />
          <Field label="Nueva contraseña" value={next} onChange={setNext} />
          <Field label="Confirmar nueva" value={confirm} onChange={setConfirm} />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-emerald-700 text-sm">{success}</p>}

          <div className="flex gap-2 pt-2">
            <Link
              href="/home"
              className="flex-1 text-center py-2.5 rounded-lg border border-stone-300 text-stone-700"
            >
              Volver
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-lg bg-emerald-700 text-white font-semibold disabled:opacity-50"
            >
              {pending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-stone-600 mb-1">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-emerald-600 outline-none"
        autoComplete="off"
      />
    </label>
  );
}
