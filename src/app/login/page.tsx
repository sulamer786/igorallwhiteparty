"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import SilkBackground from '@/components/SilkBackground';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Check for error from auth callback
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMsg(error.replace(/_/g, ' '));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'password') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccessMsg('Check your email for the magic link!');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
    }}>
      <SilkBackground />

      {/* Back button */}
      <motion.a
        href="/"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          zIndex: 10,
          transition: 'color 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-gold)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={16} /> Back
      </motion.a>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ zIndex: 10, width: '100%', maxWidth: '400px', textAlign: 'center' }}
        className="glass-panel"
      >
        <div style={{ padding: '3rem 2rem' }}>
          <h1 className="gold-text font-serif" style={{ fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '4px', textTransform: 'uppercase' }}>
            VIP ACCESS
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Sign in to view the live hype thread.
          </p>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  padding: '1rem',
                  background: '#f8e8e6',
                  color: '#8a2b2b',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  borderLeft: '3px solid var(--brand-red-accent)',
                }}
              >
                {errorMsg}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  padding: '1rem',
                  background: '#eef3ea',
                  color: '#2f4a32',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  borderLeft: '3px solid var(--brand-green-accent)',
                }}
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--brand-gold)', display: 'block', marginBottom: '0.5rem' }}>EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input"
                placeholder="jane@example.com"
              />
            </div>

            <AnimatePresence>
              {mode === 'password' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label style={{ fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--brand-gold)', display: 'block', marginBottom: '0.5rem' }}>PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="luxury-input"
                    placeholder="••••••••"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || !!successMsg}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--brand-green) 0%, var(--brand-emerald) 100%)',
                color: '#f7f4ef',
                padding: '1rem',
                borderRadius: '8px',
                fontWeight: 600,
                letterSpacing: '2px',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'center',
                transition: 'all 0.2s',
                opacity: (loading || !!successMsg) ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(28, 28, 28, 0.16)',
                border: '1px solid rgba(28,28,28,0.08)',
                fontSize: '1rem',
                fontFamily: 'Cinzel Decorative, serif',
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'password' ? 'ACCESS DASHBOARD' : 'SEND MAGIC LINK')}
            </motion.button>
          </form>

          <button
            type="button"
            onClick={() => setMode(m => m === 'password' ? 'magic' : 'password')}
            style={{
              marginTop: '2rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            {mode === 'password' ? "Don't know your password? Send a Magic Link." : "I have a password instead."}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div style={{ height: "100vh", backgroundColor: "#f7f4ef" }} />}>
      <LoginContent />
    </React.Suspense>
  );
}
