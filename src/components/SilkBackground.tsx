"use client";

import { useEffect, useRef, useState } from "react";

type Scrim = "poster" | "reading";

// Safari only autoplays when these are real attributes, not just React props.
function silence(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.controls = false;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("disablepictureinpicture", "");
  video.setAttribute("disableremoteplayback", "");
}

// Fixed night photograph. The still is always there. The clip plays unless
// the visitor asked for less motion, or this phone will not start it.
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
  const videoRef = useRef<HTMLVideoElement>(null);
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playVideo) return;

    let cancelled = false;
    silence(video);

    // A refusal before the file is ready is a retry. A refusal after canplay
    // means this phone will not start a background clip.
    const start = () => {
      if (cancelled) return;
      silence(video);
      const attempt = video.play();
      if (!attempt) return;
      attempt.catch(() => {
        if (!cancelled) setVideoFailed(true);
      });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      start();
    } else {
      video.addEventListener("canplay", start);
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", start);
    };
  }, [playVideo]);

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
            ref={(node) => {
              videoRef.current = node;
              if (node) silence(node);
            }}
            src="/white-night.mp4"
            poster="/images/white-night-bg.png"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            className="night-media"
            onError={() => setVideoFailed(true)}
          />
        )}
        <div className={scrim === "reading" ? "night-scrim-reading" : "night-scrim-poster"} />
      </div>
    </div>
  );
}
