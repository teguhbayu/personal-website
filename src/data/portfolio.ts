export type ChannelId =
  | "home"
  | "practice"
  | "projects"
  | "stack"
  | "awards"
  | "contact";

export interface ChannelMeta {
  id: ChannelId;
  label: string;
  code: string;
  screenHeadline: string;
  screenSubline: string;
}

export interface ProjectItem {
  id: string;
  index: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  host: string;
  stack: string[];
}

export interface CertificateItem {
  id: string;
  name: string;
  category: "competition" | "language";
  image: string;
  href?: string;
  detail: string;
  issuerScope: string;
}

export interface SkillGroup {
  id: string;
  index: string;
  domain: string;
  summary: string;
  items: {
    id: string;
    name: string;
    note: string;
  }[];
}

export interface SocialLink {
  id: string;
  label: string;
  handle: string;
  href: string;
}

export const OWNER = {
  fullName: "Teguh Bayu Pratama",
  shortName: "Bayu",
  role: "Web Developer & Cloud Engineer",
  school: "Astra Polytechnic",
  location: "Cikarang, Indonesia",
  email: "teguhbayupratama@gmail.com",
  portrait: "/bayu.png",
  leadStatement:
    "Building production web applications and AWS cloud systems from Cikarang.",
  biography: [
    "Results-driven sophomore at Astra Polytechnic focused on cloud engineering and full-stack web development. Since February 2024, I have shipped production websites and worked on freelance web development projects alongside school organizations and competitions.",
    "My technical work earned 1st Place at National LKS Cloud Computing (LKSN), following 1st Place wins at both the Malang city and East Java provincial levels. Strong written and spoken communication is backed by a TOEIC score of 935 out of 990.",
  ],
};

export const CHANNELS: ChannelMeta[] = [
  {
    id: "home",
    label: "HOME",
    code: "CH 01",
    screenHeadline: "TEGUH BAYU",
    screenSubline: "WEB DEV & CLOUD ENG",
  },
  {
    id: "practice",
    label: "PRACTICE",
    code: "CH 02",
    screenHeadline: "LKSN #1 CLOUD",
    screenSubline: "SMK TELKOM MALANG",
  },
  {
    id: "projects",
    label: "PROJECTS",
    code: "CH 03",
    screenHeadline: "MOKLET & ANTAREJA",
    screenSubline: "SHIPPED PLATFORMS",
  },
  {
    id: "stack",
    label: "STACK",
    code: "CH 04",
    screenHeadline: "10 CORE TOOLS",
    screenSubline: "NEXT.JS / AWS / GO",
  },
  {
    id: "awards",
    label: "AWARDS",
    code: "CH 05",
    screenHeadline: "5 CERTIFICATES",
    screenSubline: "CLOUD & LANGUAGE",
  },
  {
    id: "contact",
    label: "CONTACT",
    code: "CH 06",
    screenHeadline: "GET IN TOUCH",
    screenSubline: "TEGUHBAYUPRATAMA@GMAIL",
  },
];

export const VERIFIED_LEDGER = [
  {
    label: "National LKS Cloud Computing",
    value: "1st Place",
    scope: "LKSN, East Java & Malang",
  },
  {
    label: "TOEIC English Assessment",
    value: "935 / 990",
    scope: "Verified certificate",
  },
  {
    label: "Freelance Web Development",
    value: "Since Feb 2024",
    scope: "Production web launches",
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "cznahub-com",
    index: "01",
    name: "CZNAhub.com",
    subtitle: "Game Item E-Commerce",
    description:
      "A place where you can buy items for games such as roblox. Built with Next.js, TypeScript, Prisma, and Postgresql, deployed through A VPS.",
    image: "/projects/czna.png",
    href: "https://cznahub.com",
    host: "cznahub.com",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "tRPC", "Prisma"],
  },
  {
    id: "bfh-teguhbayu-xyz",
    index: "02",
    name: "BFH Website",
    subtitle:
      "E-Voting Platform For ASTRAtech Software Engineering Association",
    description:
      "Badan Formatur Himma (Or BFH) is a body that organize the yearly SENA leader voting. Built with Next.js, TypeScript, Prisma, and Postgresql, deployed through A VPS.",
    image: "/projects/bfh.png",
    href: "https://bfh.teguhbayu.xyz",
    host: "bfh.teguhbayu.xyz",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
  },
  {
    id: "moklet-org",
    index: "03",
    name: "Moklet.org",
    subtitle: "Student Organization Portal for SMK Telkom Malang",
    description:
      "Central digital portal publishing student organization news, activities, sub-organizations, and contributor updates at SMK Telkom Malang. Built with Next.js, TypeScript, Prisma, and MySQL, deployed through AWS Amplify.",
    image: "/projects/mokletorg.png",
    href: "https://moklet.org",
    host: "moklet.org",
    stack: ["Next.js", "TypeScript", "MySQL", "AWS Amplify", "Prisma"],
  },
  {
    id: "antareja",
    index: "04",
    name: "Antareja",
    subtitle: "Official Competition Platform for Paskibra SMK Telkom Malang",
    description:
      "Official event website for Aksi Telkom Barisan Jawara, the marching skills competition hosted by Paskibra SMK Telkom Malang, featuring registration schedules, countdown tracking, jury information, and participant dashboards.",
    image: "/projects/antareja.png",
    href: "https://antareja.smktelkom-mlg.sch.id",
    host: "antareja.smktelkom-mlg.sch.id",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "frontend",
    index: "01",
    domain: "Frontend & Mobile",
    summary: "Interactive web interfaces and cross-platform mobile apps.",
    items: [
      { id: "nextjs", name: "Next.js", note: "Used in Moklet.org & Antareja" },
      {
        id: "typescript",
        name: "TypeScript",
        note: "Primary application language",
      },
      { id: "expo", name: "Expo", note: "Cross-platform mobile builds" },
    ],
  },
  {
    id: "backend",
    index: "02",
    domain: "Backend & Services",
    summary: "Typed data access, REST APIs, and server-side services.",
    items: [
      { id: "go", name: "Go", note: "Compiled backend services" },
      { id: "express", name: "Express", note: "Node.js HTTP servers" },
      {
        id: "prisma",
        name: "Prisma",
        note: "Type-safe ORM in Moklet.org & Antareja",
      },
    ],
  },
  {
    id: "cloud-data",
    index: "03",
    domain: "Cloud & Databases",
    summary: "AWS infrastructure and relational or document storage.",
    items: [
      {
        id: "aws",
        name: "AWS",
        note: "LKSN Cloud Computing focus & Amplify hosting",
      },
      {
        id: "postgresql",
        name: "PostgreSQL",
        note: "Relational store powering Antareja",
      },
      {
        id: "mysql",
        name: "MySQL",
        note: "Relational store powering Moklet.org",
      },
      { id: "mongodb", name: "MongoDB", note: "Document database workflows" },
    ],
  },
];

export const CERTIFICATES: CertificateItem[] = [
  {
    id: "telepati",
    name: "Telepati 8.0",
    category: "competition",
    image: "/certs/telepati.jpg",
    detail: "1st Place",
    issuerScope: "National Competition",
  },
  {
    id: "lksn",
    name: "LKSN Cloud Computing",
    category: "competition",
    image: "/certs/lksn.jpg",
    href: "https://drive.google.com/file/d/15lP-HQjh1Qi8uymXCU3fvCBttRb2L6aC/view?usp=sharing",
    detail: "1st Place",
    issuerScope: "National Competition",
  },
  {
    id: "lks-jatim",
    name: "LKS Cloud Jatim",
    category: "competition",
    image: "/certs/lks.jpg",
    href: "https://drive.google.com/file/d/1CNey9DvBIxqnGQtyA5YNqdqtOgywVdGx/view?usp=sharing",
    detail: "1st Place",
    issuerScope: "East Java Province",
  },
  {
    id: "lks-malang",
    name: "LKS Cloud Malang",
    category: "competition",
    image: "/certs/lksk.jpg",
    href: "https://drive.google.com/file/d/1X6u90-sGYHoBLOEgmC7MJXk2Ub2iPBut/view?usp=sharing",
    detail: "1st Place",
    issuerScope: "Malang City",
  },
  {
    id: "toeic",
    name: "TOEIC",
    category: "language",
    image: "/certs/toeic.jpg",
    href: "https://drive.google.com/file/d/1krU69GNOAml_z_kjTGNAgvBYQc1YmfvQ/view?usp=sharing",
    detail: "English (935 / 990)",
    issuerScope: "Language Proficiency",
  },
  {
    id: "ukbi",
    name: "UKBI",
    category: "language",
    image: "/certs/ukbi.jpg",
    href: "https://drive.google.com/file/d/1dpf2oxp_coJIG46-WQKD8M6Uv8zDT_fh/view?usp=sharing",
    detail: "Indonesian",
    issuerScope: "Language Proficiency",
  },
];

export const SOCIALS: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    handle: "@teguhbayu",
    href: "https://github.com/teguhbayu",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "in/teguhbayupratama",
    href: "https://linkedin.com/in/teguhbayupratama",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@soyuz_slav",
    href: "https://instagram.com/soyuz_slav",
  },
];
