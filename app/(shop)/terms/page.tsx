import type { Metadata } from "next";

import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — FlashX",
  description: "Placeholder terms for the FlashX demo storefront.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      summary="How the FlashX demo storefront is intended to be used."
      sections={[
        {
          heading: "No real purchases",
          body: "FlashX is a demonstration of a high-concurrency inventory engine. No payment is collected, no goods are shipped, and no order placed here creates any obligation on either side.",
        },
        {
          heading: "Stock and reservations",
          body: "Stock figures come from seed data while the backend is under construction. Once it is live, a reservation is an atomic decrement of a Redis counter and is honoured strictly first come, first served.",
        },
        {
          heading: "Accounts",
          body: "Accounts exist to demonstrate authentication flows. Do not reuse a password you use anywhere else.",
        },
        {
          heading: "Availability",
          body: "The service is offered as-is, with no uptime guarantee. It is load-tested deliberately and may be taken down without notice.",
        },
      ]}
    />
  );
}
