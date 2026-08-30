"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const MAX_DESC_CHARS = 500;

export default function SubmitReportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    location: "Sector 62 (Auto-detected)",
    category: "",
    priority: "Medium",
    description: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/") && !selected.type.startsWith("video/")) {
        setError("Unsupported file format. Please upload an image or video.");
        return;
      }
      if (selected.size > 15 * 1024 * 1024) {
        setError("File size exceeds 15MB limit.");
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || formData.title.length < 4) {
      setError("Please provide a title of at least 4 characters.");
      return;
    }
    if (!formData.category) {
      setError("Please select a problem category.");
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fileName: file ? file.name : null,
        }),
      });

      if (!res.ok) throw new Error("Server error");
      
      // Navigate to citizen feed on success
      window.location.href = "/";
    } catch {
      setError("Could not connect to API server. Please retry.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-slate-200">
      <div>
        <header className="bg-[#0284c7] text-white px-5 py-4 flex items-center justify-between">
          <h1 className="text-base font-bold">Submit New Report</h1>
          <Link href="/" className="text-xs text-sky-100 hover:text-white">
            Cancel
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* File Upload Field */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl bg-white p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:border-[#0284c7] transition-colors"
          >
            <span className="text-2xl mb-1">📷</span>
            <p className="text-xs text-slate-600 font-medium">
              {file ? `Selected: ${file.name}` : "Tap to Take Photo or Upload Video"}
            </p>
            <span className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, MP4 (Max 15MB)</span>
          </div>

          {/* Issue Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              maxLength={80}
              placeholder="e.g., Broken Streetlight"
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7]"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Detected Location</label>
            <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 flex items-center gap-2">
              <span className="text-xs">📍</span>
              <input
                type="text"
                className="w-full text-xs text-slate-700 bg-transparent focus:outline-none"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          {/* Category & Urgency Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category *</label>
              <select
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0284c7]"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled>Select Category</option>
                <option value="Roads & Lighting">Roads &amp; Lighting</option>
                <option value="Sanitation & Waste">Sanitation &amp; Waste</option>
                <option value="Water Infrastructure">Water Infrastructure</option>
                <option value="Public Safety">Public Safety</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">AI Urgency</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0284c7]"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Urgent)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Problem Description *</label>
            <textarea
              required
              rows={4}
              maxLength={MAX_DESC_CHARS}
              placeholder="Describe the issue in detail..."
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="text-right text-[10px] text-slate-400 mt-0.5">
              {formData.description.length}/{MAX_DESC_CHARS}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-60 text-white font-semibold text-xs py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Transmitting to AI Engine...</span>
              </>
            ) : (
              "Submit Report to AI Routing"
            )}
          </button>
        </form>
      </div>

      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-slate-800">Home</Link>
        <span className="text-[#0284c7]">My Reports</span>
        <Link href="/dashboard" className="hover:text-slate-800">HEI Hub</Link>
      </footer>
    </div>
  );
}