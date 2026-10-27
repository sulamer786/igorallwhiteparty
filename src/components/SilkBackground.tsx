"use client";

import { useEffect, useState } from "react";

type Scrim = "poster" | "reading";

// Fixed night photograph. The still is always there. The clip plays unless
// the visitor asked for less motion, or this surface wants a quiet still.
export default function SilkBackground({
  animate = true,
  behind = false,
  framed = false,
  scrim = "poster",
}: {
  animate?: boolean;
  behind?: boolean;
  framed?: boolean;
  scrim?: Scrim;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const playVideo = animate && !reduceMotion && !videoFailed;

  return (
    <div
      aria-hidden
      className={`night-stage${framed ? " night-stage-framed" : ""}`}
      style={{ zIndex: behind ? -1 : 0 }}
    >
      {framed && <div className="night-wash" />}
      <div className={framed ? "night-poster" : "night-full"}>
        <img src="/images/white-night-bg.png" alt="" className="night-media" />
        {playVideo && (
          <video
            src="/white-night.mp4"
            poster="/images/white-night-bg.png"
            autoPlay
            muted
            loop
            playsInline
            className="night-media"
            onError={() => setVideoFailed(true)}
          />
        )}
        <div className={scrim === "reading" ? "night-scrim-reading" : "night-scrim-poster"} />
      </div>
    </div>
  );
}
