"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  location?: string;
  district?: string;
  urgency?: string;
  impact?: string;
  submittedBy?: string;
  votes: number;
  status: string;
}

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "AI-Powered Segregation for Municipal Solid Waste",
    description: "Developing automated sorting systems for municipal recycling centers to reduce landfill waste.",
    category: "Environment & Sustainability",
    district: "Urban Centers",
    votes: 24,
    status: "Looking for University Partners",
  },
  {
    id: 2,
    title: "Low-Cost Telemedicine Kiosks for Primary Healthcare",
    description: "Designing solar-powered diagnostic booths for rural clinics with intermittent grid access.",
    category: "Healthcare & Public Health",
    district: "Rural Districts",
    votes: 41,
    status: "In Industry Review",
  },
  {
    id: 3,
    title: "Offline-First Interactive Math Learning Toolkits",
    description: "Creating open-source, gamified learning modules that function on low-spec hardware without active internet.",
    category: "Education & Skill Building",
    district: "Public Schools",
    votes: 18,
    status: "Seeking Faculty Mentors",
  },
];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const saved = localStorage.getItem("all_challenges");
    if (saved) {
      try {
        const userChallenges: Challenge[] = JSON.parse(saved);
        setChallenges([...userChallenges, ...DEFAULT_CHALLENGES]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const categories = [
    "All",
    "Environment & Sustainability",
    "Agro-Tech & Rural Development",
    "Healthcare & Public Health",
    "Water & Sanitation",
    "Urban Infrastructure",
  ];

  const handleVote = (id: number) => {
    setChallenges((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, votes: (item.votes || 0) + 1 } : item
      )
    );
  };

  const filteredChallenges =
    selectedCategory === "All"
      ? challenges
      : challenges.filter((c) =>
          c.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(c.category?.toLowerCase())
        );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Impact<span className="text-blue-500">Hub</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/challenges" className="text-blue-400 font-semibold">
            Challenges
          </Link>
          <Link
            href="/submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            Submit
          </Link>
        </nav>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 py-10 flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Active Challenges</h1>
            <p className="text-slate-400 text-sm mt-1">
              Browse crowdsourced societal problems submitted by citizens.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium truncate max-w-[150px]">
                    {challenge.category}
                  </span>
                  <span className="text-slate-500">
                    📍 {challenge.district || challenge.location || "General"}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-100">{challenge.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {challenge.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-teal-400 bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20">
                  {challenge.status || "Open"}
                </span>
                <button
                  onClick={() => handleVote(challenge.id)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-md transition-colors cursor-pointer"
                >
                  <span>▲</span>
                  <span>{challenge.votes || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}