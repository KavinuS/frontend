import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

/**
 * Shared shell for the legal stubs.
 *
 * These pages exist so the auth and footer links resolve instead of 404-ing.
 * They say plainly that the text is a placeholder rather than presenting
 * invented policy as if it were binding.
 */
export default function LegalPage({
  title,
  summary,
  sections,
}: {
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <Container className="py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{summary}</p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-900">
          <strong className="font-semibold">Placeholder.</strong> FlashX is a
          student engineering project with no real transactions. This page is a
          structural stub, not a legal document.
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold text-slate-900">
                {section.heading}
              </h2>
              <p className="mt-2 leading-relaxed text-slate-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <ButtonLink href="/" variant="secondary" className="mt-12">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
