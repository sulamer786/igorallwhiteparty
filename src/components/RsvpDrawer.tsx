"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, Sparkles, Camera } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { type HostKey, EVENT_CONFIG } from '@/lib/eventConfig';

interface RsvpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trackingRef: string | null;
  host: HostKey;
}

export default function RsvpDrawer({ isOpen, onClose, trackingRef, host }: RsvpDrawerProps) {
  const config = EVENT_CONFIG[host];
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wantsToGift, setWantsToGift] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    plusOneNames: '',
    password: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Keep the invite from scrolling underneath the sheet.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Reset form state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setErrorMsg('');
        setFormData({ fullName: '', email: '', phone: '', plusOneNames: '', password: '' });
        setWantsToGift(false);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
      }, 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // First, upload avatar if provided
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const compressed = await imageCompression(avatarFile, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 512,
          useWebWorker: true,
        });
        const fileName = `avatar-${Date.now()}.webp`;
        const uploadFile = new File([compressed], fileName, { type: 'image/webp' });

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`public/${fileName}`, uploadFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`public/${fileName}`);
          avatarUrl = publicUrl;
        }
      }

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, trackingRef, avatarUrl, host }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      // Auto-login if they set a password
      if (formData.password) {
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
        } catch {
          // Non-blocking
        }
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldAnimation: any = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(28, 28, 28, 0.28)',
              backdropFilter: 'blur(8px)',
              zIndex: 99,
            }}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              background: 'rgba(247, 244, 239, 0.97)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderTop: '1px solid var(--border-color)',
              boxShadow: '0 -10px 50px rgba(0,0,0,0.9)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '1rem 1.2rem',
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))',
              zIndex: 100,
              maxHeight: '95vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ width: '36px', height: '4px', background: 'rgba(28,28,28,0.18)', borderRadius: '2px', margin: '0 auto 0.6rem' }} />

            <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', color: 'var(--text-secondary)', padding: '0.5rem' }}>
              <X size={22} />
            </button>

            {!success ? (
              <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {/* Header + Avatar Upload */}
                <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
                  <h2 className="font-serif gold-text" style={{ fontSize: '1.3rem', marginBottom: '0.2rem', letterSpacing: '2px' }}>
                    YOUR RSVP
                  </h2>

                  {/* Avatar Upload Circle */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                    style={{ display: 'flex', justifyContent: 'center', margin: '0.4rem 0 0.2rem' }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload profile picture"
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        border: '2px dashed var(--border-color)',
                        background: avatarPreview ? `url(${avatarPreview}) center/cover` : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {!avatarPreview && (
                        <>
                          <Camera size={20} color="var(--brand-gold)" style={{ opacity: 0.6 }} />
                          <span style={{ fontSize: '0.5rem', color: 'var(--brand-gold)', marginTop: '4px', letterSpacing: '1px', opacity: 0.6 }}>PHOTO</span>
                        </>
                      )}
                      {avatarPreview && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'rgba(0,0,0,0.6)', padding: '2px',
                          fontSize: '0.5rem', color: 'white', textAlign: 'center', letterSpacing: '1px',
                        }}>
                          CHANGE
                        </div>
                      )}
                    </button>
                  </motion.div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7 }}>
                    Add a profile photo (optional)
                  </p>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        padding: '0.8rem',
                        background: '#f8e8e6',
                        color: '#8a2b2b',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        borderLeft: '3px solid var(--brand-red-accent)',
                      }}
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2-column row for name + email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  {[
                    { label: 'FULL NAME', field: 'fullName', type: 'text', required: true, placeholder: 'Jane Doe' },
                    { label: 'EMAIL', field: 'email', type: 'email', required: true, placeholder: 'jane@email.com' },
                  ].map((input, i) => (
                    <motion.div
                      key={input.field}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fieldAnimation}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
                    >
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--brand-gold)' }}>
                        {input.label}{input.required ? ' *' : ''}
                      </label>
                      <input
                        required={input.required}
                        type={input.type}
                        value={(formData as any)[input.field]}
                        onChange={(e) => setFormData(p => ({ ...p, [input.field]: e.target.value }))}
                        className="luxury-input"
                        placeholder={input.placeholder}
                        style={{ padding: '0.75rem' }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* 2-column row for phone + plus one */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  {[
                    { label: 'PHONE', field: 'phone', type: 'tel', required: false, placeholder: '+1 (555) 000' },
                    { label: '+1 GUEST', field: 'plusOneNames', type: 'text', required: false, placeholder: 'Their name' },
                  ].map((input, i) => (
                    <motion.div
                      key={input.field}
                      custom={i + 2}
                      initial="hidden"
                      animate="visible"
                      variants={fieldAnimation}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
                    >
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--brand-gold)' }}>
                        {input.label}
                      </label>
                      <input
                        type={input.type}
                        value={(formData as any)[input.field]}
                        onChange={(e) => setFormData(p => ({ ...p, [input.field]: e.target.value }))}
                        className="luxury-input"
                        placeholder={input.placeholder}
                        style={{ padding: '0.75rem' }}
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  custom={4}
                  initial="hidden"
                  animate="visible"
                  variants={fieldAnimation}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
                >
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--brand-gold)' }}>
                    PASSWORD <span style={{ opacity: 0.5 }}>(for VIP dashboard)</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    className="luxury-input"
                    placeholder="6+ characters"
                    style={{ padding: '0.75rem' }}
                  />
                </motion.div>

                {/* Gifting option */}
                <motion.div
                  custom={5}
                  initial="hidden"
                  animate="visible"
                  variants={fieldAnimation}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(110,88,64,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                >
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={wantsToGift}
                      onChange={(e) => setWantsToGift(e.target.checked)}
                      style={{ marginTop: '0.2rem', accentColor: 'var(--brand-gold)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        I'd like to chip in for the party 🎁
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {config.giftMessage}
                      </span>
                    </div>
                  </label>

                  <AnimatePresence>
                    {wantsToGift && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(194, 168, 120, 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--brand-gold)' }}>
                          <p style={{ fontSize: '0.9rem', color: 'var(--brand-gold)', marginBottom: '0.5rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Zelle Details
                          </p>
                          <p style={{ fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '2px', fontWeight: 600 }}>
                            {config.zelleNumber}
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.8rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                            No gifts, flowers, or alcohol please — cash only via Zelle.
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--brand-gold)', marginTop: '0.4rem', fontWeight: 600 }}>
                            Suggested donation: $100 per person
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  custom={6}
                  initial="hidden"
                  animate="visible"
                  variants={fieldAnimation}
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-green) 0%, var(--brand-emerald) 100%)',
                    color: '#f7f4ef',
                    padding: '0.9rem',
                    borderRadius: '40px',
                    fontWeight: 600,
                    letterSpacing: '3px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 4px 20px rgba(28, 28, 28, 0.16)',
                    border: '1px solid rgba(28,28,28,0.08)',
                    fontSize: '0.9rem',
                    fontFamily: 'Cinzel Decorative, serif',
                    width: '100%',
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'CONFIRM RSVP'}
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '2rem 1rem', maxWidth: '400px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}
              >
                {/* Ambient bubbles */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 80, opacity: 0, scale: 0.3 }}
                    animate={{ y: -200, opacity: [0, 0.6, 0], scale: [0.3, 0.8, 0.4] }}
                    transition={{ duration: 3 + i * 0.5, delay: 0.5 + i * 0.3, repeat: Infinity, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      width: `${4 + i * 2}px`, height: `${4 + i * 2}px`,
                      borderRadius: '50%',
                      background: 'rgba(194,168,120,0.3)',
                      left: `${15 + i * 10}%`,
                      bottom: '20%',
                      pointerEvents: 'none',
                    }}
                  />
                ))}

                {/* Martini glass — CSS art */}
                <motion.div
                  initial={{ scale: 0, rotateZ: -15 }}
                  animate={{ scale: 1, rotateZ: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 120, delay: 0.2 }}
                  style={{ margin: '0 auto 1.5rem', width: '100px', height: '120px', position: 'relative' }}
                >
                  {/* Glass bowl */}
                  <div style={{
                    width: '80px', height: '50px', margin: '0 auto',
                    borderLeft: '30px solid transparent',
                    borderRight: '30px solid transparent',
                    borderTop: '50px solid rgba(194,168,120,0.15)',
                    position: 'relative',
                  }}>
                    {/* Liquid surface */}
                    <div style={{
                      position: 'absolute', top: '-48px', left: '-28px', right: '-28px',
                      height: '30px',
                      background: 'linear-gradient(180deg, rgba(194,168,120,0.1) 0%, rgba(194,168,120,0.25) 100%)',
                      borderRadius: '0 0 50% 50%',
                    }} />
                    {/* Olive on toothpick */}
                    <motion.div
                      animate={{ rotate: [-5, 5, -5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute', top: '-46px', left: '50%', transform: 'translateX(-50%)',
                        zIndex: 3,
                      }}
                    >
                      <div style={{
                        width: '2px', height: '35px',
                        background: 'var(--brand-gold)', margin: '0 auto',
                        transformOrigin: 'bottom center',
                      }} />
                      <div style={{
                        width: '14px', height: '10px',
                        background: '#2d5a3a', borderRadius: '50%',
                        border: '1px solid rgba(194,168,120,0.4)',
                        margin: '-4px auto 0',
                      }}>
                        <div style={{
                          width: '4px', height: '4px',
                          background: '#8b0000', borderRadius: '50%',
                          margin: '2px auto',
                        }} />
                      </div>
                    </motion.div>
                  </div>
                  {/* Stem */}
                  <div style={{
                    width: '3px', height: '30px',
                    background: 'linear-gradient(180deg, rgba(194,168,120,0.3), rgba(194,168,120,0.5))',
                    margin: '0 auto',
                  }} />
                  {/* Base */}
                  <div style={{
                    width: '40px', height: '4px',
                    background: 'rgba(194,168,120,0.4)',
                    borderRadius: '2px',
                    margin: '0 auto',
                    boxShadow: '0 2px 8px rgba(194,168,120,0.2)',
                  }} />
                </motion.div>

                {/* Closing line */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  style={{
                    fontSize: '0.8rem', color: 'var(--text-secondary)',
                    fontStyle: 'italic', letterSpacing: '2px', marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  See you in white.
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="font-serif gold-text"
                  style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}
                >
                  YOU&apos;RE ON THE LIST
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                  style={{
                    fontSize: '1.8rem', fontFamily: 'Cinzel Decorative, serif',
                    color: 'var(--brand-gold)',
                    textShadow: '0 0 20px rgba(194,168,120,0.4)',
                    marginBottom: '1.5rem', letterSpacing: '6px',
                  }}
                >
                  11.07
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    <Sparkles size={14} color="var(--brand-gold)" />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Get ready for an unforgettable night.</p>
                    <Sparkles size={14} color="var(--brand-gold)" />
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9, duration: 0.5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onClose();
                    router.push(formData.password ? '/dashboard' : '/login');
                  }}
                  style={{
                    background: '#1c1c1c',
                    color: '#f7f4ef', padding: '0.9rem 2rem', borderRadius: '40px',
                    fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px',
                    fontFamily: 'Cinzel Decorative, serif',
                    boxShadow: '0 4px 20px rgba(194, 168, 120, 0.3)',
                  }}
                >
                  {formData.password ? 'ENTER VIP DASHBOARD' : 'LOG IN TO DASHBOARD'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
