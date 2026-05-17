import { redirect } from "next/navigation";
import { getAllStoreSlugs } from "@/lib/data";

export default function RootPage() {
  const slugs = getAllStoreSlugs();
  if (slugs.length === 1) {
    redirect(`/demo/${slugs[0]}`);
  }
  // Multiple stores — show a simple index
  return (
    <main style={{ padding: "80px 24px", textAlign: "center", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 32 }}>Web Show Demos</h1>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {slugs.map((slug) => (
          <a
            key={slug}
            href={`/demo/${slug}`}
            style={{
              padding: "12px 24px",
              background: "#1a1a2e",
              color: "white",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {slug}
          </a>
        ))}
        {slugs.length === 0 && (
          <p style={{ color: "#666" }}>
            No webshow packages ready yet. Generate one in beedin-sync first.
          </p>
        )}
      </div>
    </main>
  );
}
