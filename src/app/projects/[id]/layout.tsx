import type { Metadata } from "next";

// A plain string here would normally run through the root layout's
// title.template ("%s · NEXUS"), but that template only propagates through
// the *nearest* ancestor segment that defines metadata — and /projects'
// own layout defines a title without redeclaring the template, which
// breaks the chain one level down. Spelling out the full title directly
// sidesteps that rather than fighting template inheritance for a title
// that's static either way (there's no server-side project data to make
// it dynamic).
export const metadata: Metadata = { title: "Project · NEXUS" };

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
