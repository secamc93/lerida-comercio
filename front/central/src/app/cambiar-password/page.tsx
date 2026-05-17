import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChangePasswordPanel } from "./change-password-panel";

export default async function CambiarPasswordPage() {
  const token = (await cookies()).get("session_token")?.value;
  if (!token) redirect("/login");
  return <ChangePasswordPanel />;
}
