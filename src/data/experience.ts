import type { Experience } from "@/lib/types";

export const experience: Experience[] = [
  {
    id: "nimbus",
    role: "Senior Frontend Engineer",
    company: "Nimbus Labs",
    location: "Remote",
    start: "2023-06",
    end: "Present",
    summary:
      "Leading the web platform for a B2B analytics product used by thousands of teams daily.",
    achievements: [
      "Migrated a 200-route Pages Router app to the App Router with React Server Components, cutting median TTFB by 46%.",
      "Designed the REST contract and BFF layer that unified four internal services behind typed, versioned endpoints.",
      "Built the design-system foundation (tokens, theming, 60+ components) adopted by three product teams.",
      "Introduced performance budgets and Core Web Vitals monitoring; p75 LCP went from 3.1s to 1.4s.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "REST", "Playwright"],
  },
  {
    id: "pixelforge",
    role: "Frontend Engineer",
    company: "Pixelforge Studio",
    location: "Bengaluru, India",
    start: "2021-02",
    end: "2023-05",
    summary:
      "Shipped marketing sites and web apps for product companies with an obsession for motion and polish.",
    achievements: [
      "Delivered 20+ high-traffic launch sites with 95+ Lighthouse scores on mobile.",
      "Created a reusable animation toolkit (scroll reveal, parallax, page transitions) honouring reduced-motion.",
      "Integrated headless CMS and commerce REST APIs with robust caching and error states.",
      "Mentored two junior developers through code review and pairing.",
    ],
    stack: ["React", "Next.js", "JavaScript", "CSS", "REST APIs", "Vercel"],
  },
  {
    id: "freelance",
    role: "Freelance Web Developer",
    company: "Independent",
    location: "Remote",
    start: "2019-05",
    end: "2021-01",
    summary:
      "Built fast, accessible websites and dashboards for startups and small businesses.",
    achievements: [
      "Hand-coded HTML/CSS/JavaScript sites with no framework overhead for maximum speed.",
      "Built admin dashboards consuming third-party REST APIs with auth and pagination.",
      "Established a component-first workflow that cut delivery time per project by a third.",
    ],
    stack: ["HTML", "CSS", "JavaScript", "React", "REST APIs"],
  },
];
