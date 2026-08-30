"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Report {
  id: number;
  title: string;
  location: string;
  time: string;
  status: string;
}

const DEFAULT_REPORTS: Report[] = [
  {
    id: 104,
    title: "Broken Streetlight - Sector-62",
    location: "0.5 km away",
    time: "Reported 2 hrs ago",
    status: "In Review",
  },
  {
    id: 108,
    title: "Water Pipeline Leakage",
    location: "1.2 km away",
    time: "Reported 4 hrs ago",
    status: "Assigned to HEI",
  },
];

export default function CivicNexusMobileHome() {
  const [reports, setReports] = useState<Report[]>(DEFAULT_REPORTS);

  useEffect(() => {
    const saved = localStorage.getItem("civic_reports");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReports([...parsed, ...DEFAULT_REPORTS]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-slate-200">
      {/* Top Header */}
      <div>
        <header className="bg-[#0284c7] text-white px-5 py-4 text-center">
          <h1 className="text-base font-bold tracking-wider">CIVIC NEXUS</h1>
        </header>

        {/* Action Hero Card */}
        <div className="p-4">
          <div className="bg-[#e0f2fe] rounded-2xl p-6 text-center shadow-sm">
            <h2 className="text-base font-bold text-slate-800">Report a Local Issue</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Snap a picture, record audio or upload details
            </p>
            <Link
              href="/submit"
              className="inline-block w-full bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold py-2.5 rounded-lg shadow transition-colors"
            >
              Snap &amp; Report Issue
            </Link>
          </div>

          {/* Nearby Reports Section */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-800 text-center mb-4">
              Nearby Reports
            </h3>

            <div className="space-y-3">
              {reports.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800">
                      {item.title}
                    </h4>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium shrink-0">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {item.time} • {item.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        <Link href="/" className="text-[#0284c7]">
          Home
        </Link>
        <Link href="/submit" className="hover:text-slate-800">
          My Reports
        </Link>
        <Link href="/dashboard" className="hover:text-slate-800">
          HEI Hub
        </Link>
      </footer>
    </div>
  );
}