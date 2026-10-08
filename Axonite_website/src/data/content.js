export const products = [
  {
    name: "Polypus",
    tag: "Intelligent automation",
    desc: "Touchless document intake and controlled SAP posting that removes manual keying from business workflows.",
    idealFor: "Enterprises processing high volumes of invoices, forms, and orders directly into ERP systems.",
    features: [
      "Multi-channel intake for emails, documents, and digital forms",
      "OCR and LLM-powered data extraction and structural parsing",
      "Real-time cross-validation against SAP master data",
      "Human-in-the-loop review and approval controls",
      "Automated, controlled SAP transaction posting with full audit trails",
    ],
  },
  {
    name: "MESIO",
    tag: "Industrial IoT & MES",
    desc: "A shop-floor execution and IoT platform replacing paper logs with connected dispensing, weighing, and reactor tracking.",
    idealFor: "Global chemical and industrial manufacturers needing real-time batch control and plant-wide traceability.",
    features: [
      "Precision weighing and batch dispensing control",
      "Paperless production tracking with digital recipe workflows",
      "Direct IoT connectivity and telemetry for reactors and shop-floor equipment",
      "Multi-site orchestration proven across global operations",
      "Complete batch traceability, compliance logging, and process analytics",
    ],
  },
  {
    name: "FinOps Flow",
    tag: "Treasury & close automation",
    desc: "Automated month-end close and real-time cash position monitoring built to replace manual reconciliation marathons.",
    idealFor: "Treasury, controllers, and finance teams looking to compress their MEC timeline and manage multi-account liquidity.",
    features: [
      "Automated Month-End Close (MEC) task orchestration and review checkpoints",
      "Continuous bank balance aggregation and real-time treasury position reporting",
      "Intercompany reconciliation and automated journal entry generation",
      "Cash flow forecasting and liquidity variance tracking",
      "Audit-proof closing binders with complete historical trail",
    ],
  },
];

export const services = [
  {
    title: "Design Systems",
    desc: "Interfaces built on a shared language of components, so every new feature looks like it belongs.",
  },
  {
    title: "Applied AI",
    desc: "Model integration and automation where it actually removes work, not where it just sounds impressive in a deck.",
  },
  {
    title: "Platform & Infrastructure",
    desc: "Systems that stay up: deployment pipelines, monitoring, and architecture that scales without a rewrite.",
  },
  {
  title: "Product Support",
  desc: "We stay on after launch: active maintenance, bug triage, and incremental improvements so your software never degrades into technical debt.",
},
];

export const process = [
  { step: "Discover", desc: "We sit with the problem before touching a keyboard — talking to the people who'll use the product." },
  { step: "Design", desc: "Wireframes and prototypes get tested early, so mistakes are cheap to fix." },
  { step: "Build", desc: "Short cycles, visible progress, working software every week — not a reveal at the end." },
  { step: "Ship", desc: "Releases are boring on purpose: staged rollouts, rollback plans, no surprises." },
  { step: "Support", desc: "We stay on after launch. A product without upkeep is a liability, not an asset." },
];

export const gallery = [
  {
    title: "Finance workflow visibility",
    tag: "Ledgerline",
    accent: "#0f766e",
    gradient: "linear-gradient(135deg, #0d1017 0%, #123a37 34%, #14b8a6 100%)",
    description: "Exception queues, approval flows, and reconciliation views built for operations teams that need answers fast.",
  },
  {
    title: "Field service at a glance",
    tag: "Fieldpost",
    accent: "#0b5a55",
    gradient: "linear-gradient(135deg, #0d1017 0%, #0f3b38 35%, #0f766e 100%)",
    description: "Job cards, proof-of-work checks, and live status updates for crews working out of range and offline.",
  },
  {
    title: "Teams scheduled without chaos",
    tag: "Rosterly",
    accent: "#14b8a6",
    gradient: "linear-gradient(135deg, #0d1017 0%, #10403c 32%, #5eead4 100%)",
    description: "Shift planning and attendance data that keeps staffing stable across stores, sites, and rotating rosters.",
  },
  {
    title: "Product decisions backed by data",
    tag: "Operations",
    accent: "#a9752c",
    gradient: "linear-gradient(135deg, #0d1017 0%, #3a2c14 32%, #a9752c 100%)",
    description: "Clear reporting and usage signals that help product teams fix the right bottlenecks without guesswork.",
  },
];

export const jobs = [
  {
    title: "Senior Frontend Engineer",
    location: "Pune / Remote",
    type: "Full-time",
    desc: "Own the interface layer across our product line — React, accessibility, and a good eye for detail.",
  },
  {
    title: "Backend Engineer — Platform",
    location: "Pune",
    type: "Full-time",
    desc: "Build the services and data layer that our products run on. Comfortable with databases under real load.",
  },
  {
    title: "Product Designer",
    location: "Pune / Remote",
    type: "Full-time",
    desc: "Turn messy workflows into interfaces people don't need a manual for.",
  },
  {
    title: "QA & Release Engineer",
    location: "Pune",
    type: "Full-time",
    desc: "Keep our release process boring, in the best possible way.",
  },
];

export const blogPosts = [
  {
    title: "Why we rebuilt Rosterly's scheduling engine from scratch",
    date: "Jul 2026",
    tag: "Engineering",
    excerpt: "The old version worked — until a customer with 400 shift patterns a week found every edge case we hadn't.",
  },
  {
    title: "Designing for a phone screen your customer might be sharing",
    date: "Jun 2026",
    tag: "Design",
    excerpt: "Field teams often share one device between two shifts. That single fact changed our entire login flow.",
  },
  {
    title: "What we look for in a first engineering hire",
    date: "May 2026",
    tag: "Team",
    excerpt: "Less about the stack they know, more about how they behave when the stack breaks at 11pm.",
  },
  {
    title: "A quieter approach to applying AI in operations software",
    date: "Apr 2026",
    tag: "Product",
    excerpt: "The best use of a model in Ledgerline is the one our customers never notice is there.",
  },
];
