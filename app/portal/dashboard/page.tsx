/**
 * Merchant Portal dashboard — server component.
 *
 * Auth flow:
 *   1. Server-side: fetch /api/portal/auth/me (BFF reads httpOnly cookie)
 *   2. If 401/403 → redirect to /portal/login
 *   3. If OK → render merchant overview
 *
 * Scope (v1 first milestone — auth isolation proof):
 *   - Merchant name + storefront slug
 *   - PUBLISHED product count
 *   - Link to public storefront demo
 *   - Logout button
 *
 * Product editing, publication toggle, Shopify sync → deferred to next Adım.
 */
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function getMerchantData() {
  // Read the httpOnly session cookie (Path=/ so it's sent with all requests)
  const cookieStore = cookies();
  const token = cookieStore.get("beedin_session")?.value;

  if (!token) return null;

  // Call Railway backend directly with the JWT (server-to-server, no CORS issue)
  const backendUrl =
    process.env.BACKEND_URL ?? "https://beedin-sync-production.up.railway.app";

  try {
    const res = await fetch(`${backendUrl}/api/merchant/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getProductCount(storefront_slug: string) {
  const backendUrl =
    process.env.BACKEND_URL ?? "https://beedin-sync-production.up.railway.app";
  try {
    const res = await fetch(
      `${backendUrl}/api/storefront/${storefront_slug}/products?page_size=1`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.total_count ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const merchant = await getMerchantData();

  if (!merchant) {
    redirect("/portal/login");
  }

  const storefront = merchant.storefront;
  const productCount = storefront?.slug
    ? await getProductCount(storefront.slug)
    : null;

  const demoUrl = storefront?.slug
    ? `https://beedin-webshow.vercel.app/demo/${storefront.slug}`
    : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 40,
          borderBottom: "1px solid #e5e5e3",
          paddingBottom: 24,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 4,
            }}
          >
            Merchant Portal
          </p>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            {merchant.merchant?.name ?? "Dashboard"}
          </h1>
        </div>

        <form action="/api/portal/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #d5d5d3",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              color: "#555",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Overview cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <StatCard label="Storefront" value={storefront?.slug ?? "—"} />
        <StatCard
          label="Published Products"
          value={productCount !== null ? String(productCount) : "—"}
        />
        <StatCard label="Status" value="Demo mode — not yet on sale" small />
      </div>

      {/* Storefront link */}
      {demoUrl && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e3",
            borderRadius: 8,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
            Your storefront
          </h2>
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 14, color: "#2563eb", wordBreak: "break-all" }}
          >
            {demoUrl}
          </a>
          <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
            This is your demo storefront. Product prices are for preview only — checkout is not yet active.
          </p>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e3",
          borderRadius: 8,
          padding: "24px",
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 16 }}>
          Manage
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="/portal/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#1a1a1a",
              color: "#fff",
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            Product Catalog →
          </a>
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                border: "1px solid #e5e5e3",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                color: "#555",
                textDecoration: "none",
              }}
            >
              View Storefront ↗
            </a>
          )}
        </div>
      </div>

      {/* Coming soon */}
      <div
        style={{
          background: "#f3f4f6",
          border: "1px solid #e5e5e3",
          borderRadius: 8,
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 12 }}>
          Coming next
        </h2>
        <ul style={{ fontSize: 13, color: "#666", lineHeight: 2, margin: 0, paddingLeft: 20 }}>
          <li>Price editing with Shopify sync</li>
          <li>Order tracking &amp; commission ledger</li>
          <li>Fulfillment &amp; shipping updates</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e3",
        borderRadius: 8,
        padding: "20px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#888",
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: small ? 13 : 22,
          fontWeight: 600,
          color: "#1a1a1a",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
