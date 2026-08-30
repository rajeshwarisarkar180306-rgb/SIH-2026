import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Initial seed data shared across Citizen, HEI, and Industry Hubs
let sharedIssues = [
  {
    id: 104,
    title: "Broken Streetlight (Safety Risk)",
    category: "Roads & Lighting",
    location: "Sector 62 (0.5 km)",
    time: "Reported 2 hrs ago",
    status: "In Review",
    priority: "High",
    priorityColor: "bg-red-100 text-red-600",
    sponsorship: "Seeking CSR Partner",
    fundedAmount: "₹0",
  },
  {
    id: 108,
    title: "Water Pipeline Leakage",
    category: "Water Infrastructure",
    location: "Block C (1.2 km)",
    time: "Reported 4 hrs ago",
    status: "Assigned to HEI",
    priority: "Medium",
    priorityColor: "bg-amber-100 text-amber-700",
    sponsorship: "Funded by TechCorp",
    fundedAmount: "₹2,50,000",
  },
];

export async function GET() {
  return NextResponse.json(sharedIssues, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newIssue = {
      id: Math.floor(100 + Math.random() * 900),
      title: body.title || `${body.category} - ${body.location}`,
      category: body.category || "General",
      location: body.location || "Sector 62 (Auto-detected)",
      time: "Just now",
      status: "In Review",
      priority: body.priority || "Medium",
      priorityColor: body.priority === "High" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700",
      sponsorship: "Open for Corporate Grant",
      fundedAmount: "₹0",
    };

    sharedIssues.unshift(newIssue);
    return NextResponse.json(newIssue, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process issue" }, { status: 400 });
  }
}