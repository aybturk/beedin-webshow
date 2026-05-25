"use client";
import { motion } from "framer-motion";
import type { Section, Branding } from "@/lib/types";
import { fadeUp, staggerContainer, defaultViewport } from "@/lib/animations";

interface Props {
  section: Section;
  branding: Branding;
}

export default function BrandStorySection({ section, branding }: Props) {
  if (!section.headline && !section.body) return null;

  return (
    <section style={{ padding: "96px 0", background: "var(--color-bg)" }}>
      <motion.div
        className="section-container"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}
      >
        {/* Decorative line — grows in */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: 48, opacity: 1 }}
          viewport={defaultViewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 1, background: "var(--color-accent)", margin: "0 auto 32px" }}
        />

        {section.headline && (
          <motion.h2
            variants={fadeUp}
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400, color: "var(--color-text)", marginBottom: 24, letterSpacing: "-0.01em", lineHeight: 1.2 }}
          >
            {section.headline}
          </motion.h2>
        )}
        {section.body && (
          <motion.p
            variants={fadeUp}
            style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-muted)", lineHeight: 1.8, marginBottom: 32 }}
          >
            {section.body}
          </motion.p>
        )}
        {branding.brand_voice && (
          <motion.p
            variants={fadeUp}
            style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontStyle: "italic", color: "var(--color-accent)", letterSpacing: "0.04em" }}
          >
            {branding.brand_voice}
          </motion.p>
        )}

        <motion.div
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: 48, opacity: 1 }}
          viewport={defaultViewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ width: 1, background: "var(--color-accent)", margin: "32px auto 0" }}
        />
      </motion.div>
    </section>
  );
}
