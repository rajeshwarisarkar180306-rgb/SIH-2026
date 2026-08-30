"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface IssueItem {
  id: number;
  title: string;
  category: string;
  location: string;
  time: string;
  status: string;
  priority: string;
  priorityColor: string;
  sponsorship: string;
  fundedAmount: string;
}

export default function UnifiedWorkspaceDashboard() {
  const [activeTab, setActiveTab] = useState<"HEI" | "Industry">("HEI");
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenges", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setIssues(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-bold mb-8 tracking-wide text-white">
            Civic Nexus Workspace
          </h2>

          <nav className="space-y-3 text-xs font-medium text-slate-300">
            <button
              onClick={() => setActiveTab("HEI")}
              className={`w-full text-left flex items-center gap-2 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === "HEI" ? "bg-sky-600 text-white font-semibold" : "hover:bg-slate-800"
              }`}
            >
              🎓 HEI Innovation Hub
            </button>
            <button
              onClick={() => setActiveTab("Industry")}
              className={`w-full text-left flex items-center gap-2 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === "Industry" ? "bg-sky-600 text-white font-semibold" : "hover:bg-slate-800"
              }`}
            >
              🏢 Industry CSR Hub
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400">
          <Link href="/" className="hover:text-white flex items-center gap-1">
            &larr; Switch to Citizen View
          </Link>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-6 max-w-6xl">
        <header className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === "HEI" ? "IIT Delhi — Civic Innovation Hub" : "Industry CSR & Enterprise Sponsorship Hub"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === "HEI" ? "Student research teams & active problem routing" : "Corporate co-funding and societal grants"}
            </p>
          </div>
          <span className="text-xs bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
            {activeTab === "HEI" ? "Academic Portal" : "Corporate Portal"}
          </span>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span>📋</span> {activeTab === "HEI" ? "Unassigned AI Issues" : "Proposals Needing Grants"}
            </div>
            <div className="text-3xl font-extrabold text-[#0284c7] mt-2">
              {issues.length}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span>🛠️</span> {activeTab === "HEI" ? "Active Student Labs" : "Committed CSR Capital"}
            </div>
            <div className="text-2xl font-bold text-[#10b981] mt-2">
              {activeTab === "HEI" ? "8 Teams Active" : "₹14.5 Lakh"}
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            {activeTab === "HEI" ? "AI-Routed Problem Queue" : "CSR Co-Funding Opportunities"}
          </h2>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading issues...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 pb-2">
                    <th className="pb-3 font-semibold">Issue Title &amp; ID</th>
                    <th className="pb-3 font-semibold">{activeTab === "HEI" ? "AI Priority" : "CSR Status"}</th>
                    <th className="pb-3 font-semibold">{activeTab === "HEI" ? "Location" : "Funding Committed"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issues.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-800">
                        #{item.id} • {item.title}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === "HEI" ? item.priorityColor : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {activeTab === "HEI" ? item.priority : item.sponsorship}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {activeTab === "HEI" ? item.location : item.fundedAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}