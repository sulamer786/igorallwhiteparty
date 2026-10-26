"use client";

import React, { useEffect, useState, Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { Calendar, MapPin, Shirt, Star } from 'lucide-react';
import Preloader from '@/components/Preloader';
import RsvpDrawer from '@/components/RsvpDrawer';
import GuestList from '@/components/GuestList';
import SilkBackground from '@/components/SilkBackground';
import { type HostKey, EVENT_CONFIG } from '@/lib/eventConfig';

// WebGL sparkles are decorative. If the context fails, the invite still renders.
class WebGLBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.warn('WebGL sparkles failed:', error.message);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// Soft warm pool that follows the cursor.
function Spotlight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <div className="spotlight" style={{ background: `radial-gradient(720px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 252, 245, 0.95), transparent 42%)` }} />
  );
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
      {[
        { val: timeLeft.days, label: 'D' },
        { val: timeLeft.hours, label: 'H' },
        { val: timeLeft.minutes, label: 'M' },
        { val: timeLeft.seconds, label: 'S' },
      ].map((unit, i) => (
        <React.Fragment key={unit.label}>
          {i > 0 && <span style={{ color: 'var(--brand-gold)', opacity: 0.35, fontSize: '1.2rem', padding: '0 2px' }}>:</span>}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px' }}>
            <span className="gold-text" style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Cinzel Decorative, serif', lineHeight: 1 }}>
              {unit.val}
            </span>
            <span style={{ fontSize: '0.55rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              {unit.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function getTimeLeft(target: Date) {
  const now = new Date().getTime();
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
    hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
    minutes: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
    seconds: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
  };
}

// Small pearls drifting behind the invite.
function FloatingPearls() {
  return (
    <div className="particle-field">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="card-suit" />
      ))}
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="particle-field">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="particle" />)}
    </div>
  );
}

// Circle, hairline, circle — the repeating invitation rule.
function PearlRule() {
  const pearl = {
    width: '7px', height: '7px', borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #fff, #e7d7c3 50%, #c4ae8a)',
    boxShadow: '0 1px 3px rgba(80,60,30,0.18)',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.9rem' }}>
      <span style={pearl} />
      <span style={{ width: '72px', height: '1px', background: 'rgba(110,88,64,0.35)' }} />
      <span style={pearl} />
    </div>
  );
}

function DetailRow({ icon, label, value, valueColor }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0' }}>
      <div style={{ color: 'var(--brand-gold)', opacity: 0.85, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--brand-gold)', marginBottom: '2px', opacity: 0.85 }}>{label}</p>
        <p style={{ fontSize: '1rem', fontWeight: 500, color: valueColor || 'var(--text-primary)', lineHeight: 1.3 }}>{value}</p>
      </div>
    </div>
  );
}

const letterAnimation: any = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 14, stiffness: 120 } },
};

export default function LandingPage({ host }: { host: HostKey }) {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchParams = useSearchParams();
  const trackingRef = searchParams.get('ref') || searchParams.get('utm_source') || 'direct';
  // Doors open at 8:00 PM Eastern on November 7, 2026.
  const eventDate = new Date('2026-11-07T20:00:00-04:00');
  const config = EVENT_CONFIG[host];

  return (
    <main style={{ position: 'relative', width: '100%', minHeight: '100vh', touchAction: 'pan-y' }}>
      <SilkBackground />
      <Spotlight />
      <FloatingPearls />
      <FloatingParticles />

      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}

      {preloaderDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '60vh', zIndex: -1, pointerEvents: 'none' }}>
            <WebGLBoundary>
              <Canvas camera={{ position: [0, 0, 5] }}>
                <Sparkles count={80} scale={12} size={2} speed={0.25} opacity={0.35} color="#e7d7c3" />
              </Canvas>
            </WebGLBoundary>
          </div>

          <section className="content-scrim" style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <PearlRule />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ fontSize: '0.75rem', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--brand-gold)', marginBottom: '0.8rem' }}
            >
              You are invited to
            </motion.p>

            <motion.div
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.5 } } }}
              style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', overflow: 'hidden' }}
            >
              {config.heroTitle.split('').map((char, i) => (
                <motion.span key={`t-${i}`} variants={letterAnimation} style={{
                  fontSize: 'clamp(2.2rem, 9vw, 3.8rem)', lineHeight: 1, textTransform: 'uppercase',
                  color: 'var(--brand-gold)',
                  fontFamily: 'Cinzel Decorative, serif', display: 'inline-block',
                }}>{char === ' ' ? '\u00A0' : char}</motion.span>
              ))}
            </motion.div>

            <motion.div
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.9 } } }}
              style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', overflow: 'hidden' }}
            >
              {config.heroSubtitle.split('').map((char, i) => (
                <motion.span key={`cr-${i}`} variants={letterAnimation} style={{
                  fontSize: 'clamp(2rem, 8vw, 3.2rem)', lineHeight: 1, textTransform: 'uppercase',
                  color: 'var(--text-primary)', fontFamily: 'Cinzel Decorative, serif', display: 'inline-block',
                }}>{char === ' ' ? '\u00A0' : char}</motion.span>
              ))}
            </motion.div>

            <motion.div
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 1.3 } } }}
              style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', overflow: 'hidden', marginBottom: '0.6rem' }}
            >
              {config.heroLine3.split('').map((char, i) => (
                <motion.span key={`s-${i}`} variants={letterAnimation} style={{
                  fontSize: 'clamp(1.8rem, 7vw, 2.8rem)', lineHeight: 1, textTransform: 'uppercase',
                  color: 'var(--text-primary)', fontFamily: 'Cinzel Decorative, serif', display: 'inline-block',
                }}>{char === ' ' ? '\u00A0' : char}</motion.span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1 }}
              style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '4px',
                textTransform: 'uppercase', color: 'var(--brand-gold)',
                marginBottom: '0.6rem',
              }}
            >
              One night. All white.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1.2 }}
              className="gold-text"
              style={{ fontSize: '1rem', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.5px', marginBottom: '1.2rem' }}
            >
              {config.tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, duration: 0.8 }}
            >
              <CountdownTimer targetDate={eventDate} />
            </motion.div>
          </section>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.9 }}
            style={{
              textAlign: 'center',
              fontSize: '0.95rem',
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '1rem auto 1.25rem',
              maxWidth: '480px',
              padding: '0 1.5rem',
              position: 'relative',
              zIndex: 2,
            }}
          >
            Join us for an exclusive evening of <span style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>Luxury</span>, <span style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>Lifestyle</span>, and <span style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>Unforgettable Memories</span>.
          </motion.p>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="glass-panel"
            style={{
              padding: '1rem 1.2rem',
              margin: '0 1rem',
              position: 'relative',
            }}
          >
            <DetailRow icon={<Calendar size={18} />} label="When" value="November 7th • 8:00 PM – 2:00 AM" />
            <div style={{ borderTop: '1px solid var(--border-color)' }} />
            <DetailRow icon={<MapPin size={18} />} label="Where" value="544 N Victoria Park Rd, Fort Lauderdale" />
            <div style={{ borderTop: '1px solid var(--border-color)' }} />
            <DetailRow icon={<Star size={18} />} label="Experience" value="Premium Top Shelf Open Bar • Internationally Known DJs • Performances • Complimentary Valet Parking" />
            <div style={{ borderTop: '1px solid var(--border-color)' }} />
            <DetailRow icon={<Shirt size={18} />} label="Attire" value="All white, head to toe" valueColor="var(--brand-gold)" />
          </motion.section>

          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '1.5rem 1rem',
              margin: '0.6rem 1rem 0',
            }}
          >
            <p style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--brand-gold)', marginBottom: '1rem', fontWeight: 700 }}>
              WHO&apos;S ATTENDING
            </p>
            <GuestList publicView={true} host={host} />
          </motion.section>

          <div style={{ height: '160px' }} />

          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ delay: 2.7, type: 'spring', damping: 22, stiffness: 120 }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, width: '100%',
              padding: '0.6rem 1rem',
              paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom))',
              background: 'linear-gradient(to top, rgba(247,244,239,0.97) 60%, transparent)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 50,
              opacity: drawerOpen ? 0 : 1,
              pointerEvents: drawerOpen ? 'none' : 'auto',
              transition: 'opacity 0.2s ease',
            }}
          >
            <motion.button
              onClick={() => setDrawerOpen(true)}
              whileTap={{ scale: 0.96 }}
              className="cta-pulse"
              style={{
                background: '#1c1c1c',
                color: '#f7f4ef',
                padding: '0.85rem 2rem',
                borderRadius: '40px',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '2px',
                fontFamily: 'Cinzel Decorative, serif',
                width: '100%',
                maxWidth: '320px',
                textAlign: 'center',
              }}
            >
              REQUEST INVITE
            </motion.button>
            <a
              href="/login"
              style={{
                marginTop: '0.8rem',
                fontSize: '0.75rem',
                color: 'rgba(28,28,28,0.55)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
                textDecoration: 'underline',
                textUnderlineOffset: '4px'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--brand-gold)'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(28,28,28,0.55)'}
            >
              Already on the list? VIP Login
            </a>

            <a href="https://nurevix.io" target="_blank" rel="noopener noreferrer" style={{ marginTop: '2.5rem', opacity: 0.4, fontSize: '0.55rem', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', color: '#1c1c1c', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.75'} onMouseOut={e => e.currentTarget.style.opacity = '0.4'}>
              Designed & Developed by <span style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>Noah</span>
            </a>
          </motion.div>
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
