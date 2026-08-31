export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  votes: number;
  status: string;
}

export const challengesStore: Challenge[] = [
  {
    id: 1,
    title: "AI-Powered Segregation for Municipal Solid Waste",
    description: "Developing automated sorting systems for municipal recycling centers to reduce landfill waste.",
    category: "Environment",
    location: "Urban Centers",
    votes: 24,
    status: "Looking for University Partners",
  },
  {
    id: 2,
    title: "Low-Cost Telemedicine Kiosks for Primary Healthcare",
    description: "Designing solar-powered diagnostic booths for rural clinics with intermittent grid access.",
    category: "Healthcare",
    location: "Rural Districts",
    votes: 41,
    status: "In Industry Review",
  },
  {
    id: 3,
    title: "Offline-First Interactive Math Learning Toolkits",
    description: "Creating open-source, gamified learning modules that function on low-spec hardware without active internet.",
    category: "Education",
    location: "Public Schools",
    votes: 18,
    status: "Seeking Faculty Mentors",
  },
];