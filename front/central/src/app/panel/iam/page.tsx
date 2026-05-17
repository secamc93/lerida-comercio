"use client";

import { useState } from "react";
import { UserList } from "@/services/auth/users/ui";
import { RoleList } from "@/services/auth/roles/ui";
import { ResourceList } from "@/services/auth/resources/ui";
import { PermissionList } from "@/services/auth/permissions/ui";
import { AccionesTab } from "./acciones-tab";

const TABS = [
    { id: "Usuarios", icon: "👤" },
    { id: "Roles", icon: "🎭" },
    { id: "Recursos", icon: "📦" },
    { id: "Permisos", icon: "🔑" },
    { id: "Acciones", icon: "⚡" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function IamPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Usuarios");

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                            activeTab === tab.id
                                ? "bg-yellow-400 text-emerald-950"
                                : "text-stone-600 hover:bg-stone-200"
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.id}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
                {activeTab === "Usuarios" && <UserList />}
                {activeTab === "Roles" && <RoleList />}
                {activeTab === "Recursos" && <ResourceList />}
                {activeTab === "Permisos" && <PermissionList />}
                {activeTab === "Acciones" && <AccionesTab />}
            </div>
        </div>
    );
}
