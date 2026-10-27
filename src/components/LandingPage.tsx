"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Preloader from '@/components/Preloader';
import RsvpDrawer from '@/components/RsvpDrawer';
import GuestList from '@/components/GuestList';
import SilkBackground from '@/components/SilkBackground';
import { AmenityGrid, DiamondRule } from '@/components/PosterMarks';
import { type HostKey, EVENT_CONFIG } from '@/lib/eventConfig';

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
    hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
    minutes: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
    seconds: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
  };
}

// Small luminous figures. Sits in the lockup instead of reading as a scoreboard.
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { val: timeLeft.days, label: 'Days' },
    { val: timeLeft.hours, label: 'Hours' },
    { val: timeLeft.minutes, label: 'Minutes' },
    { val: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className="editorial-countdown">
      {units.map((unit) => (
        <div key={unit.label}>
          <span className="poster-title">{unit.val}</span>
          <span className="caps">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage({ host }: { host: HostKey }) {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchParams = useSearchParams();
  const trackingRef = searchParams.get('ref') || searchParams.get('utm_source') || 'direct';
  // Doors at 10:00 PM Eastern on November 7, 2026.
  const eventDate = new Date('2026-11-07T22:00:00-04:00');
  const config = EVENT_CONFIG[host];

  return (
    <main style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      <SilkBackground framed />

      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}

      {preloaderDone && (
        <motion.div
          className="poster-column"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Title sits in the open sky of the photograph */}
          <section className="poster-lockup">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }}>
              <DiamondRule delay={0.05} />
            </motion.div>

            <motion.p
              className="caps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              style={{ color: '#e4c98a', fontSize: '0.68rem', margin: '0.85rem 0 0.7rem' }}
            >
              {config.eyebrow}
            </motion.p>

            <motion.h1
              className="poster-title"
              initial={{ opacity: 0, filter: 'blur(14px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.45, duration: 1.15, ease: 'easeOut' }}
              style={{ fontSize: 'clamp(2.85rem, 13vw, 4.5rem)' }}
            >
              WHITE<br />PARTY
            </motion.h1>

            <motion.p
              className="italic-line"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.7 }}
              style={{ marginTop: '0.85rem' }}
            >
              {config.italicLine}
            </motion.p>

            <motion.p
              className="caps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              style={{ color: '#f6f1e6', fontSize: '0.72rem', marginTop: '0.85rem' }}
            >
              {config.city}
            </motion.p>
            <motion.p
              className="caps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.55, duration: 0.6 }}
              style={{ color: 'rgba(246,241,230,0.72)', fontSize: '0.62rem', marginTop: '0.4rem' }}
            >
              {config.dateLabel}
            </motion.p>
            <motion.p
              className="caps reading-type"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.65, duration: 0.6 }}
              style={{ marginTop: '0.45rem', letterSpacing: '0.12em' }}
            >
              {config.address}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.6 }}
              style={{ marginTop: '1.15rem' }}
            >
              <CountdownTimer targetDate={eventDate} />
            </motion.div>
          </section>

          {/* A short breath of the pool, leaving the address above the button */}
          <div style={{ height: '3vh' }} />

          <section className="poster-lower poster-reading">
            <motion.div
              className="time-rule"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
            >
              <span className="diamond-rule-line" />
              <span className="diamond" />
              <span className="poster-title reading-hours" style={{ fontSize: 'clamp(1.45rem, 6vw, 1.85rem)', letterSpacing: '0.08em' }}>
                {config.hours}
              </span>
              <span className="diamond" />
              <span className="diamond-rule-line" />
            </motion.div>

            <AmenityGrid items={config.amenities} reveal />

            <motion.p
              className="caps reading-type"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.3, duration: 0.6 }}
              style={{ marginTop: '0.4rem' }}
            >
              {config.attire}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.45, duration: 0.6 }}
              style={{ marginTop: '1.15rem' }}
            >
              <DiamondRule />
              <p className="caps reading-type" style={{ marginTop: '0.75rem' }}>
                {config.closing}
              </p>
            </motion.div>
          </section>

          <motion.section
            className="glass-panel poster-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.7, duration: 0.7 }}
            style={{ textAlign: 'center', padding: '1.4rem 1rem', margin: '1.25rem 1rem 0' }}
          >
            <p className="caps" style={{ color: '#e4c98a', fontSize: '0.64rem', marginBottom: '0.9rem' }}>
              The Guest List
            </p>
            <GuestList publicView={true} host={host} />
          </motion.section>

          <div style={{ height: '168px' }} />

          <div
            className="poster-cta"
            style={{
              opacity: drawerOpen ? 0 : 1,
              pointerEvents: drawerOpen ? 'none' : 'auto',
            }}
          >
            <motion.button
              onClick={() => setDrawerOpen(true)}
              whileTap={{ scale: 0.98 }}
              className="plaque-button"
            >
              Request Invite
            </motion.button>
            <a href="/login" className="caps poster-login">
              Already on the list
            </a>
            <a
              href="https://nurevix.io"
              target="_blank"
              rel="noopener noreferrer"
              className="poster-credit"
            >
              Designed & Developed by Noah
            </a>
          </div>
        </motion.div>
      )}

      <RsvpDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        trackingRef={trackingRef}
        host={host}
      />
    </main>
  );
}
