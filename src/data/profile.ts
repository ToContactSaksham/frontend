import type { Profile } from "@/lib/types";

export const profile: Profile = {
  name: "Saksham",
  firstName: "Saksham",
  title: "Frontend Engineer",
  tagline:
    "I build interfaces that feel instant, look intentional, and hold up under real users.",
  location: "India · Remote-friendly",
  email: "hello@saksham.dev",
  availability: "Open to frontend roles & select freelance work",
  bio: [
    "I'm Saksham, a frontend engineer who treats the browser as a craft. I care about the 16 milliseconds between frames, the focus ring nobody thinks about until they need it, and the loading state that makes a slow network feel fast.",
    "My toolkit centres on React and Next.js with TypeScript, styled with Tailwind CSS, and wired to REST APIs I design to be predictable and well-documented. I like owning the whole slice: from the route handler to the pixel.",
    "This portfolio is itself a demo. Every section you scroll past is driven by real code paths: server components, client islands, custom hooks, an API layer with validation, and animation tuned for 60fps and reduced-motion users alike.",
  ],
  roles: [
    "Frontend Engineer",
    "React & Next.js Specialist",
    "UI Performance Nerd",
    "Design-Systems Builder",
    "REST API Integrator",
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/ToContactSaksham", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/saksham", icon: "linkedin" },
    { label: "X", href: "https://x.com/saksham", icon: "x" },
    { label: "Email", href: "mailto:hello@saksham.dev", icon: "mail" },
  ],
  stats: [
    { label: "Years shipping UI", value: 5, suffix: "+" },
    { label: "Projects delivered", value: 40, suffix: "+" },
    { label: "Lighthouse perf avg", value: 98 },
    { label: "Components in design systems", value: 120, suffix: "+" },
  ],
};
