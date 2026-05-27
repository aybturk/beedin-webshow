/**
 * Merchant Portal layout — minimal, no storefront branding.
 * Shared by /portal/login and /portal/dashboard.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beedin Merchant Portal",
  robots: "noindex,nofollow",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9f9f7",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
