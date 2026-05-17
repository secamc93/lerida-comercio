import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PanelShell } from "./panel-shell";

const API = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3050/api/v1";

interface VerifyData {
  user_id: number;
  email: string;
  roles: string[] | null;
  business_id: number;
}

async function verify(token: string): Promise<VerifyData | null> {
  try {
    const res = await fetch(`${API}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? (json.data as VerifyData) : null;
  } catch {
    return null;
  }
}

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("session_token")?.value;
  if (!token) redirect("/login");

  const data = await verify(token);
  if (!data) redirect("/login");

  return (
    <PanelShell
      user={{
        email: data.email,
        roles: data.roles ?? [],
      }}
    >
      {children}
    </PanelShell>
  );
}
