"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { type HostKey } from '@/lib/eventConfig';
import Image from 'next/image';

export type Guest = {
  id: string;
  full_name: string;
  plus_one_names?: string | null;
  photo_url: string | null;
  created_at: string;
  email?: string;
  phone?: string;
  rsvp_status?: string;
};

function getDisplayName(g: Guest): string {
  const firstName = g.full_name.split(' ')[0];
  if (g.plus_one_names && g.plus_one_names.trim()) {
    const plusFirst = g.plus_one_names.trim().split(' ')[0];
    return `${firstName} & ${plusFirst}`;
  }
  return firstName;
}

export default function GuestList({ 
  publicView = false, 
  layout = 'row',
  userRole = 'guest',
  isAdminMode = false,
  host,
}: { 
  publicView?: boolean; 
  layout?: 'row' | 'grid' | 'management';
  userRole?: string;
  isAdminMode?: boolean;
  host?: HostKey;
}) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function fetchGuests() {
      const isAuthorized = userRole === 'admin' || userRole === 'subadmin';
      const useFullTable = isAdminMode && isAuthorized;
      
      const tableName = useFullTable ? 'guests' : 'public_guest_list';
      const columns = useFullTable ? '*' : 'id, full_name, plus_one_names, photo_url, created_at';

      let query = supabase
        .from(tableName)
        .select(columns)
        .order('created_at', { ascending: false })
        .limit(layout === 'row' ? 50 : 500);

      // Filter by host when provided
      if (host) {
        query = query.eq('host', host);
      }

      const { data, error } = await query;

      if (!cancelled) {
        if (!error && data) {
          setGuests(data as unknown as Guest[]);
        } else if (error) {
          console.error("Error fetching guests:", error);
        }
        setLoading(false);
      }
    }
    fetchGuests();

    return () => { cancelled = true; };
  }, [publicView, layout, userRole, isAdminMode, host]);

  if (loading) {
    const count = layout === 'grid' || layout === 'management' ? 6 : 4;
    return (
      <div style={{
        padding: layout === 'row' ? '0.5rem 0' : '2rem',
        display: (layout === 'grid' || layout === 'management') ? 'grid' : 'flex',
        gridTemplateColumns: (layout === 'grid' || layout === 'management') ? 'repeat(auto-fill, minmax(90px, 1fr))' : undefined,
        gap: (layout === 'grid' || layout === 'management') ? '1.5rem 0.8rem' : '0.8rem',
        overflowX: layout === 'row' ? 'auto' : undefined,
        opacity: 0.4,
        justifyContent: layout === 'row' ? 'center' : undefined,
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{
            width: layout === 'row' ? '50px' : '100%',
            height: layout === 'row' ? '50px' : '80px',
            borderRadius: layout === 'management' ? '8px' : '50%',
            background: 'rgba(255,255,255,0.05)',
            flexShrink: 0,
          }} />
        ))}
      </div>
    );
  }

  // Show FOMO counter
  const guestCount = guests.length;

  if (guestCount === 0) {
    return (
      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center', fontSize: '0.9rem' }}>
        Be the first to secure your spot.
      </p>
    );
  }

  const avatarSize = (layout === 'grid' || layout === 'management') ? 72 : 50;

  // Management View (Admin/Subadmin only)
  if (layout === 'management') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ width: '100%', overflowX: 'auto', padding: '1.5rem', marginBottom: '2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '3px', color: 'var(--brand-gold)', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8 }}>
            GUEST DATABASE — {guestCount} RECORDS
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          <thead>
            <tr style={{ color: 'var(--brand-gold)', opacity: 0.9 }}>
              <th style={{ textAlign: 'left', padding: '0.8rem', fontSize: '0.65rem', letterSpacing: '1px' }}>GUEST</th>
              <th style={{ textAlign: 'left', padding: '0.8rem', fontSize: '0.65rem', letterSpacing: '1px' }}>CONTACT</th>
              <th style={{ textAlign: 'center', padding: '0.8rem', fontSize: '0.65rem', letterSpacing: '1px' }}>RSVP</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <td style={{ padding: '1rem 0.8rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                      {g.photo_url ? (
                        <Image src={g.photo_url} alt="" width={36} height={36} style={{ objectFit: 'cover' }} unoptimized />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--brand-burgundy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--brand-gold)', fontWeight: 700 }}>
                          {g.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.full_name}</div>
                      {g.plus_one_names && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--brand-gold)', opacity: 0.8 }}>+ {g.plus_one_names}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 0.8rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.email || 'No email'}</div>
                    {g.phone && <div style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', opacity: 0.6 }}>{g.phone}</div>}
                  </div>
                </td>
                <td style={{ padding: '1rem 0.8rem', textAlign: 'center', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    background: g.rsvp_status === 'attending' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                    color: g.rsvp_status === 'attending' ? '#4ade80' : '#f87171',
                    border: `1px solid ${g.rsvp_status === 'attending' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1px'
                  }}>
                    {g.rsvp_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    );
  }

  const content = (
    <AnimatePresence>
      {guests.map((g, index) => (
        <motion.div
          key={g.id}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03, ease: 'easeOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
            minWidth: layout === 'row' ? '70px' : 'auto',
          }}
        >
          <div style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            borderRadius: '50%',
            border: '2px solid var(--border-color)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '0.4rem',
            background: g.photo_url ? 'transparent' : 'var(--brand-burgundy)',
            position: 'relative',
          }}>
            {g.photo_url ? (
              <Image
                src={g.photo_url}
                alt={`${g.full_name}'s photo`}
                width={avatarSize}
                height={avatarSize}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                unoptimized
              />
            ) : (
              <span style={{ fontSize: layout === 'row' ? '1rem' : '1.3rem', fontWeight: 600, color: 'var(--brand-gold)' }}>
                {g.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p style={{
            fontSize: layout === 'row' ? '0.65rem' : '0.8rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            textAlign: 'center',
            width: layout === 'row' ? '70px' : '100%',
            lineHeight: 1.2,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            textShadow: '0 1px 6px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)',
          }}>
            {getDisplayName(g)}
          </p>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  if (layout === 'row') {
    return (
      <div>
        {/* FOMO Counter */}
        <div style={{
          textAlign: 'center',
          marginBottom: '0.8rem',
        }}>
          <span style={{
            fontSize: '0.65rem',
            letterSpacing: '2px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            textShadow: '0 1px 6px rgba(0,0,0,0.8)',
          }}>
            <span style={{ color: 'var(--brand-gold)', fontWeight: 700 }}>{guestCount}</span> Guests Confirmed
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          padding: '0.5rem 1rem',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          justifyContent: guestCount <= 5 ? 'center' : 'flex-start',
        }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          <span style={{ color: 'var(--brand-gold)', fontWeight: 700 }}>{guestCount}</span> VIP Guests on the list
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '1.5rem 0.8rem',
        padding: '0.5rem',
        width: '100%',
      }}>
        {content}
      </div>
    </div>
  );
}
