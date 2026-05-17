"use client";

import { PermissionsProvider } from "@/shared/contexts/permissions-context";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { PanelSidebar } from "./panel-sidebar";

interface PanelShellProps {
  user: { email: string; roles: string[] };
  children: React.ReactNode;
}

export function PanelShell({ user, children }: PanelShellProps) {
  return (
    <PermissionsProvider>
      <ThemeProvider>
        <div className="flex min-h-screen bg-stone-100">
          <PanelSidebar email={user.email} />
          <main className="flex-1 min-w-0 p-6">{children}</main>
        </div>
      </ThemeProvider>
    </PermissionsProvider>
  );
}
