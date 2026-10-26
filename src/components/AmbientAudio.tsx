"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Ambient Audio — James Bond theme soundtrack
 * Loops the Bond theme in the background with toggle control.
 * Aggressively starts on the very first user gesture (scroll, touch,
 * mouse move, click, keydown, pointerdown) since browsers block
 * autoplay without a gesture.
 */
export default function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  // Centralized play attempt — called on every gesture until successful
  const tryPlay = useCallback(() => {
    if (startedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.play().then(() => {
      startedRef.current = true;
      setIsPlaying(true);
    }).catch(() => {
      // Still blocked — will retry on next gesture
    });
  }, []);

  useEffect(() => {
    const audio = new Audio('/James Bond (Original).mp3');
    audio.loop = false;
    audio.volume = 0.25;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Fade out after 45 seconds of playback
    const FADE_AFTER = 45; // seconds
    const FADE_DURATION = 3000; // ms
    const FADE_STEPS = 30;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    let fadeInterval: ReturnType<typeof setInterval> | null = null;

    const startFadeTimer = () => {
      if (fadeTimer) return; // already scheduled
      fadeTimer = setTimeout(() => {
        const startVol = audio.volume;
        const step = startVol / FADE_STEPS;
        let count = 0;
        fadeInterval = setInterval(() => {
          count++;
          audio.volume = Math.max(0, startVol - step * count);
          if (count >= FADE_STEPS) {
            if (fadeInterval) clearInterval(fadeInterval);
            audio.pause();
            setIsPlaying(false);
          }
        }, FADE_DURATION / FADE_STEPS);
      }, FADE_AFTER * 1000);
    };

    // Attempt autoplay immediately
    audio.play().then(() => {
      startedRef.current = true;
      setIsPlaying(true);
      startFadeTimer();
    }).catch(() => {
      setIsPlaying(false);
    });

    // Listen to every possible user gesture to start audio ASAP
    const gestureEvents = [
      'click', 'touchstart', 'touchend', 'mousedown', 'mousemove',
      'pointerdown', 'pointermove', 'keydown', 'scroll', 'wheel',
    ];

    const onGesture = () => {
      if (startedRef.current) {
        gestureEvents.forEach(evt =>
          document.removeEventListener(evt, onGesture, true)
        );
        return;
      }
      audio.play().then(() => {
        startedRef.current = true;
        setIsPlaying(true);
        startFadeTimer();
        gestureEvents.forEach(evt =>
          document.removeEventListener(evt, onGesture, true)
        );
      }).catch(() => { /* keep retrying */ });
    };

    gestureEvents.forEach(evt =>
      document.addEventListener(evt, onGesture, { capture: true, passive: true })
    );

    return () => {
      gestureEvents.forEach(evt =>
        document.removeEventListener(evt, onGesture, true)
      );
      if (fadeTimer) clearTimeout(fadeTimer);
      if (fadeInterval) clearInterval(fadeInterval);
      audio.pause();
      audio.src = '';
    };
  }, [tryPlay]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        startedRef.current = true;
        setIsPlaying(true);
      }).catch(e => console.error("Audio playback failed:", e));
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      onClick={toggleAudio}
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 100,
        background: 'rgba(15, 5, 30, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(194,168,120,0.25)',
        borderRadius: '24px',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--brand-gold)',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        fontSize: '0.6rem',
        fontFamily: 'Courier New, monospace',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(42, 21, 69, 0.5)' }}
      whileTap={{ scale: 0.9 }}
      aria-label={isPlaying ? "Mute Ambient Sound" : "Play Ambient Sound"}
    >
      {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
      <span>{isPlaying ? '007' : 'SND'}</span>
    </motion.button>
  );
}

