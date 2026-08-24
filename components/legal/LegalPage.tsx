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
    <Container className="pb-22 pt-14">
      <div className="mx-auto max-w-[68ch]">
        <h1 className="text-[clamp(36px,5vw,52px)] tracking-[-0.03em]">
          {title}
        </h1>
        <p className="fx-muted mt-3 text-lg">{summary}</p>

        <p className="mt-6 bg-fx-accent-100 px-4 py-3 text-[13px] text-fx-accent-800">
          <strong className="font-heading font-extrabold">Placeholder.</strong>{" "}
          FlashX is a student engineering project with no real transactions. This
          page is a structural stub, not a legal document.
        </p>

        <div className="mt-10">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="border-t border-fx-divider py-6"
            >
              <h2 className="text-lg">{section.heading}</h2>
              <p className="fx-muted mt-2">{section.body}</p>
            </section>
          ))}
        </div>

        <ButtonLink href="/" variant="secondary" className="mt-8">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
