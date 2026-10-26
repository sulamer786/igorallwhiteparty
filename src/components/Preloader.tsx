"use client";

import React, { useRef, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Catches a missing WebGL context and shows the CSS pearl instead.
class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('WebGL rendering failed, showing fallback:', error.message);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Slowly turning pearl — the white-party stand-in for the old casino chip.
function Pearl() {
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.45;
    groupRef.current.rotation.x = Math.sin(t * 0.35) * 0.18;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.82, 64, 64]} />
        <meshStandardMaterial
          color="#f7f3ec"
          metalness={0.82}
          roughness={0.16}
          emissive="#fff6ea"
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.3, 0.2, 0]}>
        <torusGeometry args={[1.22, 0.012, 16, 96]} />
        <meshStandardMaterial color="#c4ae8a" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );
}

function PearlFallback() {
  return (
    <div style={{
      width: '148px', height: '148px', borderRadius: '50%',
      background: 'radial-gradient(circle at 32% 28%, #ffffff 0%, #f4efe6 36%, #d7c4a4 70%, #a88b62 100%)',
      boxShadow: '0 18px 40px rgba(80, 60, 30, 0.22), inset -10px -14px 24px rgba(120, 90, 50, 0.28), inset 8px 8px 16px rgba(255,255,255,0.8)',
      border: '1px solid rgba(140, 110, 70, 0.35)',
    }} />
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{
      width: '220px', height: '2px',
      background: 'rgba(28,28,28,0.1)', borderRadius: '2px',
      overflow: 'hidden', marginTop: '1.6rem',
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #8c7355, #e7d7c3)',
          borderRadius: '2px',
        }}
      />
    </div>
  );
}

// White silk sweep and a camera flash. Replaces the gun-barrel transition.
function SilkReveal({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div
        initial={{ x: '-110%' }}
        animate={{ x: ['-110%', '0%', '0%', '110%'] }}
        transition={{ duration: 2.15, times: [0, 0.34, 0.52, 1], ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(100deg, #f7f4ef 0%, #ffffff 42%, #f3efe6 70%, #e7dcc8 100%)',
          boxShadow: '0 0 80px rgba(255,255,255,0.8)',
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.7, delay: 0.72, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0, background: '#fff' }}
      />
    </div>
  );
}

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [silk, setSilk] = useState(false);

  useEffect(() => {
    const steps = [18, 36, 54, 72, 88, 100];
    const timers = steps.map((value, i) => setTimeout(() => setProgress(value), 280 + i * 420));
    const done = setTimeout(() => {
      setLoading(false);
      setSilk(true);
    }, 3500);
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
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              backgroundColor: '#f7f4ef',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Portrait, washed toward white so it sits in the ivory field */}
            <motion.div
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.62, scale: 1 }}
              transition={{ duration: 2.4, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            >
              <Image
                src="/images/igor pic.png"
                alt=""
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center 20%', filter: 'grayscale(1) contrast(0.9)' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(247,244,239,0.35) 0%, rgba(247,244,239,0.62) 55%, rgba(247,244,239,0.8) 100%)',
              }} />
            </motion.div>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* CSS pearl stays visible if the 3D canvas cannot paint on this ground */}
              <div style={{ width: '220px', height: '220px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'absolute', width: '190px', height: '190px', borderRadius: '50%',
                  border: '1px solid rgba(140, 110, 70, 0.45)',
                  boxShadow: '0 0 0 10px rgba(231, 215, 195, 0.35)',
                }} />
                <div style={{ position: 'absolute' }}>
                  <PearlFallback />
                </div>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <WebGLErrorBoundary fallback={null}>
                    <Canvas camera={{ position: [0, 0, 3.2] }} style={{ width: '100%', height: '100%' }}>
                      <ambientLight intensity={0.9} />
                      <directionalLight position={[4, 6, 5]} intensity={2.4} color="#fffaf3" />
                      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#c4a574" />
                      <pointLight position={[-2, 1, 3]} intensity={1.1} color="#f0d0c8" />
                      <Pearl />
                    </Canvas>
                  </WebGLErrorBoundary>
                </div>
              </div>

              <h1
                className="gold-text"
                style={{
                  marginTop: '0.4rem',
                  fontSize: '1.35rem', letterSpacing: '0.28em', fontWeight: 400,
                  textAlign: 'center', lineHeight: 1.45,
                }}
              >
                IGOR&apos;S<br />ALL WHITE<br />PARTY
              </h1>
              <ProgressBar progress={progress} />
              <p style={{
                marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic',
                letterSpacing: '0.08em', color: 'rgba(28,28,28,0.45)',
              }}>
                Setting the room…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {silk && <SilkReveal onComplete={onComplete} />}
    </>
  );
}
