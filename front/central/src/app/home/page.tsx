import { redirect } from "next/navigation";

// El antiguo dashboard /home fue reemplazado por el panel admin con sidebar (/panel).
export default function HomePage() {
  redirect("/panel");
}
