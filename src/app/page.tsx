import { Suspense } from "react";
import { Hero } from "@/components/sections/hero/hero";
import { About } from "@/components/sections/about/about";
import { Skills } from "@/components/sections/skills/skills";
import { Projects } from "@/components/sections/projects/projects";
import { GitHubActivity } from "@/components/sections/github/github-activity";
import { Experience } from "@/components/sections/experience/experience";
import { ApiPlayground } from "@/components/sections/playground/api-playground";
import { Contact } from "@/components/sections/contact/contact";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";

function ProjectsFallback() {
  return (
    <Section id="projects">
      <Skeleton className="mb-6 h-10 w-64" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    </Section>
  );
}

export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <About />
      <Skills />
      {/* Projects reads the URL via useSearchParams, which needs a Suspense boundary. */}
      <Suspense fallback={<ProjectsFallback />}>
        <Projects />
      </Suspense>
      <GitHubActivity />
      <Experience />
      <ApiPlayground />
      <Contact />
    </main>
  );
}
