import type { Metadata } from "next";

import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — FlashX",
  description: "Placeholder privacy notice for the FlashX demo storefront.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary="What FlashX stores, and where it stores it."
      sections={[
        {
          heading: "What is stored in your browser",
          body: "Your cart and order history are kept in this browser's localStorage while the backend is under construction. Clearing site data removes them, and they are never sent anywhere.",
        },
        {
          heading: "Cookies",
          body: "One cookie is used: an httpOnly session cookie holding the token issued by the authentication backend. It is not readable by JavaScript and is not used for tracking or analytics.",
        },
        {
          heading: "Account data",
          body: "If you register, your name, email address, and a hashed password are held by the backend service. Signing in with Google shares only the profile fields Google returns for that consent.",
        },
        {
          heading: "Third parties",
          body: "Nothing is sold or shared with advertisers. The only external party involved is Google, and only when you choose to sign in with it.",
        },
      ]}
    />
  );
}
