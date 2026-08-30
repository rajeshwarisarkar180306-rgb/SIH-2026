"use client";
import React, { useState } from "react";

export default function HEIWorkspace() {
  const [activeTab, setActiveTab] = useState("All");

  const [challenges] = useState([
    {
      id: "CH-101",
      title: "Smart Water Management System for Mining Areas",
      category: "Water & Agro-Tech",
      district: "Dhanbad",
      status: "Pending",
      description: "Need an automated sensor-based system to monitor groundwater quality near industrial mining sites.",
    },
    {
      id: "CH-102",
      title: "AI Solution for Rural Health Diagnostics",
      category: "Healthcare / AI",
      district: "Ranchi",
      status: "Under Review",
      description: "Predictive model for early identification of endemic health issues using local clinic data.",
    },
    {
      id: "CH-103",
      title: "Crop Disease Detection App for Farmers",
      category: "Agro-Tech",
      district: "Hazaribagh",
      status: "Accepted",
      description: "Mobile-first solution using image recognition for leaf disease classification.",
    },
  ]);

  const [facultyMentor, setFacultyMentor] = useState("");
  const [studentName, setStudentName] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState("CH-101");
  const [submitMsg, setSubmitMsg] = useState("");

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg("✅ Proposal & Team details submitted successfully!");
    setTimeout(() => setSubmitMsg(""), 4000);
  };

  const filteredChallenges =
    activeTab === "All"
      ? challenges
      : challenges.filter((c) => c.status === activeTab);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-5 shadow-xl">
        <h2 className="text-xl font-bold mb-8 text-blue-400 border-b border-slate-700 pb-3">
          HEI Workspace
        </h2>
        <nav className="flex flex-col gap-3 font-medium">
          <a href="#inbox" className="p-3 bg-blue-600 rounded-lg text-white">📥 Challenge Inbox</a>
          <a href="#proposals" className="p-3 hover:bg-slate-800 rounded-lg transition">📄 Submission & Team</a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">University Portal</h1>
            <p className="text-xs text-gray-500">Member 4 - HEI View</p>
          </div>
          <div className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full border border-emerald-300">
            IIT Dhanbad Portal
          </div>
        </header>

        <div className="p-8 space-y-8">
          <section id="inbox" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Routed Challenge Inbox</h2>
            <div className="flex border-b border-gray-200 mb-6 gap-2">
              {["All", "Pending", "Under Review", "Accepted"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-5 font-semibold text-sm transition-all border-b-2 ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {filteredChallenges.map((item) => (
                <div key={item.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50 flex justify-between items-start">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-gray-200 px-2 py-0.5 rounded">{item.id}</span>
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-md">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    item.status === "Pending" ? "bg-amber-100 text-amber-800" : item.status === "Under Review" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section id="proposals" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Proposal Submission & Team Builder</h2>
            {submitMsg && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">{submitMsg}</div>}
            <form onSubmit={handleProposalSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Challenge</label>
                <select value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                  {challenges.map((c) => <option key={c.id} value={c.id}>{c.id} - {c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Faculty Mentor</label>
                  <input type="text" placeholder="Dr. A. K. Sharma" value={facultyMentor} onChange={(e) => setFacultyMentor(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Student Lead</label>
                  <input type="text" placeholder="Rahul Kumar" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload Proposal PDF</label>
                <input type="file" className="w-full border rounded-lg p-2 text-sm bg-gray-50" />
              </div>
              <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm">Submit Proposal</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}