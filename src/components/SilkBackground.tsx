"use client";

import { useEffect, useState } from "react";

// Fixed silk room. The still is always there. The clip plays on the invite
// and login unless the visitor asked for less motion.
export default function SilkBackground({ animate = true, behind = false }: { animate?: boolean; behind?: boolean }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const playVideo = animate && !reduceMotion;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: behind ? -1 : 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "var(--bg-gradient)",
      }}
    >
      {/* Poster, so the first paint is never blank */}
      <img
        src="/images/white-silk-bg.png"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      {playVideo && (
        <video
          src="/white-silk.mp4"
          poster="/images/white-silk-bg.png"
          autoPlay
          muted
          loop
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {/* Stronger in the center so the title reads, lighter at the edges so the silk shows */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(247,244,239,0.84) 0%, rgba(247,244,239,0.7) 58%, rgba(247,244,239,0.58) 100%)",
        }}
      />
    </div>
  );
}
