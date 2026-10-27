"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{
      width: '180px', height: '1px',
      background: 'rgba(246,241,230,0.2)',
      overflow: 'hidden', marginTop: '1.4rem',
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ height: '100%', background: '#e4c98a' }}
      />
    </div>
  );
}

// A short white flash, then the poster. Replaces the ivory silk wipe.
function NightFlash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 900);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.92, 0] }}
      transition={{ duration: 0.9, times: [0, 0.35, 1], ease: 'easeOut' }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#fff', pointerEvents: 'none' }}
    />
  );
}

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const steps = [22, 48, 74, 100];
    const timers = steps.map((value, i) => setTimeout(() => setProgress(value), 280 + i * 480));
    const done = setTimeout(() => {
      setLoading(false);
      setFlash(true);
    }, 2400);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              backgroundColor: '#07111f',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Night plate under the portrait so the opening already belongs to the flyer */}
            <img
              src="/images/white-night-bg.png"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Igor, framed high so the title sits in the night below him */}
            <motion.div
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            >
              <Image
                src="/images/igor-intro.jpg"
                alt=""
                fill
                priority
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center top',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(7,17,31,0.12) 0%, rgba(7,17,31,0.02) 34%, rgba(7,17,31,0.45) 62%, rgba(7,17,31,0.88) 100%)',
              }} />
            </motion.div>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', padding: '0 1.5rem 12vh' }}>
              <p className="caps" style={{ color: '#e4c98a', fontSize: '0.68rem', marginBottom: '0.85rem' }}>
                An Exclusive Invitation
              </p>
              <motion.h1
                className="poster-title"
                initial={{ opacity: 0, filter: 'blur(12px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
                style={{ fontSize: 'clamp(3rem, 14vw, 4.4rem)', textAlign: 'center' }}
              >
                WHITE PARTY
              </motion.h1>
              <p className="italic-line" style={{ marginTop: '0.7rem', fontSize: '1.25rem' }}>
                An Evening Under the Stars
              </p>
              <ProgressBar progress={progress} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {flash && <NightFlash onComplete={onComplete} />}
    </>
  );
}
