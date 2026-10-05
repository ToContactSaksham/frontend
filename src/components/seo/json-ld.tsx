import { profile } from "@/data/profile";
import { site } from "@/lib/site";

/** Structured data so search engines understand who this page is about. */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: site.description,
    url: site.url,
    email: `mailto:${profile.email}`,
    sameAs: profile.socials
      .filter((s) => s.icon !== "mail")
      .map((s) => s.href),
    knowsAbout: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "REST APIs",
      "Web Accessibility",
      "Web Performance",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so a value can never close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
