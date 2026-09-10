// Same value src/lib/base.ts exports; inlined here so the plain-Node check
// scripts can import this file without a path alias.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type Tier = "featured" | "compact";
export type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "gif"; src: string; alt: string }
  | { kind: "poster"; src: string; alt: string };  // code-generated webp
export interface Project {
  slug: string; title: string; tagline: string;    // tagline <= 12 words
  year: string; tier: Tier; tags: string[];
  metrics: { label: string; value: string }[];     // real numbers only
  body: string[];                                   // sheet paragraphs, <= 3
  media: Media[];                                   // first item = card image
  links: { label: string; href: string }[];
}
export interface Role {
  org: string; title: string; period: string; location: string;
  points: string[];                                 // <= 3, <= 25 words each
}
export interface Certification { name: string; issuer: string; date: string }
export interface Education { school: string; degree: string; period: string; note: string }
export interface Stat { label: string; value: number; suffix: string; decimals?: number }

export const profile = {
  name: "Karthik Reddy Jakka",
  role: "AI/ML engineer. Generative AI and data science systems.",
  location: "Hyderabad, India",
  email: "jkarthikreddyreddy@gmail.com",
  github: "https://github.com/JKarthikReddy",
  linkedin: "https://www.linkedin.com/in/karthik-reddy-8a14862bb/",
  resumePath: `${BASE}/Karthik_Reddy_Resume.pdf`,
};

export const stats: Stat[] = [
  { label: "knee OA macro AUROC", value: 0.832, suffix: "", decimals: 3 },
  { label: "yield model R2", value: 0.846, suffix: "", decimals: 3 },
  { label: "disease classifier accuracy", value: 99.55, suffix: "%", decimals: 2 },
  { label: "production tests passed", value: 464, suffix: "" },
  { label: "certifications", value: 11, suffix: "" },
];

export const projects: Project[] = [
  {
    slug: "kneevision-x", tier: "featured", year: "2026",
    title: "KneeVision-X",
    tagline: "Research-grade multi-plane, multi-pathology knee MRI AI with explainability",
    tags: ["Python", "PyTorch", "FastAPI", "React", "DICOM", "Multimodal AI"],
    metrics: [
      { label: "OA severity grading", value: "0.832 macro AUROC" },
      { label: "Datasets", value: "MRNet, SKM-TEA, fastMRI, RSNA 2026" },
    ],
    body: [
      "A multi-plane, multi-pathology knee MRI system with Grad-CAM explainability, uncertainty estimation, calibration, and automated clinical-style reporting.",
      "Designed Pathology-Aware Report Contrastive Learning (PARCL) to align MRI volumes with radiology reports for label-efficient multimodal representation learning.",
      "Integrates MRNet, SKM-TEA, fastMRI, RSNA 2026, and independent OA datasets with leakage checks, robustness testing, and reproducible evaluation. Ships with a FastAPI and React research dashboard.",
    ],
    media: [
      { kind: "image", src: `${BASE}/media/kneevision-acl.png`, alt: "Grad-CAM heatmap over a knee MRI slice highlighting the ACL region" },
      { kind: "image", src: `${BASE}/media/kneevision-meniscus.png`, alt: "Grad-CAM heatmap over a knee MRI slice highlighting the meniscus" },
    ],
    links: [],
  },
  {
    slug: "agriintel-ai", tier: "featured", year: "2026",
    title: "AgriIntel AI",
    tagline: "Crop yield prediction and smart farming platform with RAG-driven advisory",
    tags: ["Python", "FastAPI", "PyTorch", "Scikit-learn", "PostgreSQL/PostGIS", "Redis", "Docker", "LLM", "RAG"],
    metrics: [
      { label: "Yield model", value: "R2 0.846, MAE 331.2 kg/ha" },
      { label: "Disease classifier", value: "99.55% accuracy" },
      { label: "Production validation", value: "464 tests, 0 failures" },
    ],
    body: [
      "An agricultural decision-support platform combining crop recommendation, yield prediction, plant disease detection, soil and weather intelligence, fertilizer guidance, market intelligence, and conversational AI.",
      "A HistGradientBoosting yield model reaches R2 0.846 with MAE 331.2 kg/ha and RMSE 655.7 kg/ha on an unseen 2010 to 2017 test set. A ResNet-18 classifier scores 99.55% on plant disease validation.",
      "Backed by FastAPI REST APIs, PostgreSQL/PostGIS, Redis, Docker Compose, authentication, authorization, and object-level access control. RAG, a knowledge graph, and LLM advisory generation feed validated, context-aware farmer recommendations.",
    ],
    media: [{ kind: "poster", src: `${BASE}/media/agriintel.webp`, alt: "Produce grid poster" }],
    links: [],
  },
  {
    slug: "intelligent-lecture-companion", tier: "compact", year: "2025",
    title: "Intelligent Lecture Companion",
    tagline: "LLM-powered lecture assistant for summaries and student questions",
    tags: ["Generative AI", "LLMs", "Python"],
    metrics: [],
    body: [
      "An AI-powered lecture assistant that uses LLMs to summarize course material and answer student questions, improving classroom engagement and accessibility.",
    ],
    media: [{ kind: "poster", src: `${BASE}/media/lecture.webp`, alt: "Data stream poster" }],
    links: [],
  },
  {
    slug: "ai-travel-agent", tier: "compact", year: "2025",
    title: "AI Travel Planning Agent",
    tagline: "Agent system that builds itineraries and analyzes trip budgets",
    tags: ["AI Agents", "LLMs", "Python"],
    metrics: [],
    body: [
      "An AI agent system that creates travel itineraries from natural-language requests and analyzes budgets across the plan.",
    ],
    media: [{ kind: "poster", src: `${BASE}/media/travel.webp`, alt: "Waveform poster" }],
    links: [],
  },
  {
    slug: "airbnb-booking-analysis", tier: "compact", year: "2025",
    title: "Airbnb Booking Analysis",
    tagline: "Machine learning on booking data to model pricing trends",
    tags: ["Python", "Machine Learning", "Pandas"],
    metrics: [],
    body: [
      "Analyzed Airbnb booking data and built machine learning models to predict pricing trends across listings and seasons.",
    ],
    media: [{ kind: "poster", src: `${BASE}/media/airbnb.webp`, alt: "Activation map poster" }],
    links: [],
  },
  {
    slug: "netflix-content-analysis", tier: "compact", year: "2025",
    title: "Netflix Content Analysis",
    tagline: "Genre and global trends across 7,789 Netflix titles",
    tags: ["Python", "Data Analytics", "Visualization"],
    metrics: [{ label: "Titles analyzed", value: "7,789" }],
    body: [
      "Analyzed 7,789 Netflix titles to surface genre distribution and global content trends with Python data visualizations.",
    ],
    media: [{ kind: "poster", src: `${BASE}/media/netflix.webp`, alt: "Constellation poster" }],
    links: [],
  },
];

export const roles: Role[] = [
  {
    org: "Handshake AI", title: "Freelance AI Trainer, Agentic Benchmark Authoring",
    period: "2026 - Present", location: "Remote",
    points: [
      "Develops terminal-based benchmark tasks that evaluate frontier AI coding agents across systems infrastructure, ML pipelines, data processing, databases, and simulation.",
      "Delivers each task as a reproducible package: natural-language spec, Dockerised environment, automated test-based verifier, and a working reference solution.",
      "Every component meets automated QA standards and passes human review.",
    ],
  },
  {
    org: "EduSkills Academy / AICTE", title: "Prompt Engineering for AI, Virtual Intern",
    period: "Apr 2026 - Jun 2026", location: "Remote",
    points: [
      "Completed a 10-week program on prompt engineering, OpenAI API prompting, Hugging Face Transformers, and prompt design for text, code, chatbots, images, and data analysis.",
      "Applied advanced prompting strategies in a capstone AI-powered content generation and analysis platform.",
    ],
  },
  {
    org: "Google", title: "AI-ML Virtual Intern",
    period: "Nov 2025 - Jan 2026", location: "Remote",
    points: [
      "Designed and implemented machine learning models in Python for predictive data analysis.",
      "Applied data preprocessing and model evaluation techniques to improve forecasting performance.",
    ],
  },
  {
    org: "Oasis Infobyte", title: "Data Science Intern",
    period: "Oct 2025 - Nov 2025", location: "Remote",
    points: [
      "Conducted exploratory data analysis and built visualizations with Python libraries to uncover key insights.",
      "Developed machine learning models for trend and pattern analysis that supported informed decision-making.",
    ],
  },
  {
    org: "Vodafone Idea Foundation", title: "LLM Data Analysis Intern",
    period: "Sep 2025 - Oct 2025", location: "Remote",
    points: [
      "Implemented LLM-based conversational data analysis workflows, improving data processing efficiency.",
      "Applied prompt engineering and NLP techniques to extract insights from datasets.",
    ],
  },
];

export const certifications: Certification[] = [
  { name: "OCI Certified Generative AI Professional", issuer: "Oracle", date: "2026" },
  { name: "OCI Certified Data Science Professional", issuer: "Oracle", date: "2026" },
  { name: "Fusion AI Agent Studio Certified Foundations Associate", issuer: "Oracle", date: "2026" },
  { name: "Prompt Engineering for AI, 10-week Virtual Internship", issuer: "EduSkills Academy", date: "Jun 2026" },
  { name: "Data Analysis Using Python", issuer: "IBM", date: "2025" },
  { name: "Career Essentials in Data Analysis", issuer: "Microsoft and LinkedIn", date: "2025" },
  { name: "Introduction to Generative AI", issuer: "Google", date: "2025" },
  { name: "Python Programming", issuer: "IIT Bombay", date: "2025" },
  { name: "GenAI Powered Data Analytics Job Simulation", issuer: "Tata Group via Forage", date: "2025" },
  { name: "Data Analytics Job Simulation", issuer: "Deloitte Australia via Forage", date: "2025" },
  { name: "Generative AI Mastermind", issuer: "Outskill", date: "2025" },
];

export const education: Education[] = [
  { school: "Matrusri Engineering College", degree: "B.Tech, Information Technology", period: "2023 to 2027", note: "Final year" },
  { school: "Sri Chaitanya Junior College", degree: "Intermediate, MPC", period: "2021 to 2023", note: "" },
];

export const skills: string[] = [
  "Python", "PyTorch", "Scikit-learn", "Hugging Face", "LLMs", "Prompt engineering",
  "RAG", "AI agents", "Data analysis", "Data visualization", "SQL", "FastAPI",
  "React", "PostgreSQL", "Docker", "Git", "Java", "C++",
];

export const capabilities = [
  { title: "Generative AI and LLMs", items: ["Prompt engineering and structured outputs", "Retrieval-augmented generation", "AI agents and agentic benchmarks", "Hugging Face Transformers"] },
  { title: "Machine learning and CV", items: ["PyTorch and Scikit-learn", "Predictive modelling and forecasting", "Grad-CAM explainability and calibration", "Multimodal representation learning"] },
  { title: "Data science", items: ["Exploratory data analysis", "Data cleaning and visualization", "Statistical analysis and business insights", "Python for data analysis"] },
  { title: "Backend and deployment", items: ["FastAPI REST APIs", "PostgreSQL/PostGIS and Redis", "Docker Compose and auth", "Git and GitHub"] },
];
