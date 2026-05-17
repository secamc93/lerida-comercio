"use client";

import { useState } from "react";
import { BusinessList, BusinessTypeList } from "@/services/auth/business/ui";

const TABS = [
  { id: "Negocios", icon: "🏢" },
  { id: "Tipos de negocio", icon: "🏷️" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function NegociosPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Negocios");

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
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
        {activeTab === "Negocios" ? <BusinessList /> : <BusinessTypeList />}
      </div>
    </div>
  );
}
