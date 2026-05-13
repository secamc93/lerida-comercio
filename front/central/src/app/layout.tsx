import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Lérida Comercio",
  description: "Directorio digital de comercios y torneo de fútbol 8 de Lérida.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-stone-100 text-stone-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
