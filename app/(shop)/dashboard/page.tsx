import type { Metadata } from "next";

import DashboardView from "@/components/dashboard/DashboardView";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Dashboard — FlashX",
  description: "Your FlashX account overview and recent reservations.",
};

export default function DashboardPage() {
  return (
    <Container className="py-12 lg:py-16">
      <DashboardView />
    </Container>
  );
}
