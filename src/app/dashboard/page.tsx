"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import CreatePost from '@/components/CreatePost';
import GuestList from '@/components/GuestList';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Info, Users, MessageCircle, User, Loader2, Camera } from 'lucide-react';
import Image from 'next/image';
import { updateProfile, toggleRsvpStatus } from '@/app/actions/profile';
import imageCompression from 'browser-image-compression';
import { type HostKey, EVENT_CONFIG, EVENT_HOST } from '@/lib/eventConfig';
import SilkBackground from '@/components/SilkBackground';
import { AmenityGrid } from '@/components/PosterMarks';

type Post = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  guest_id: string;
  guests: {
    full_name: string;
    photo_url: string | null;
    host?: string | null;
  } | null;
};

type TabType = 'overview' | 'guests' | 'thread' | 'profile';

const TABS: TabType[] = ['overview', 'guests', 'thread', 'profile'];

// ============================================================
//  TAB 1: OVERVIEW
// ============================================================
function OverviewTab({ host }: { host: HostKey }) {
  const config = EVENT_CONFIG[host];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '1.5rem', paddingBottom: '140px', position: 'relative' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem', padding: '0.8rem 1rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--brand-gold)', textTransform: 'uppercase' }}>
            November 7
          </p>
          <p style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'uppercase' }}>
            {config.hours}
          </p>
        </div>
        <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          11.07
        </p>
      </div>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-secondary)' }}>
          11.07
        </div>
        <h2 className="gold-text" style={{ fontSize: '1.35rem', marginBottom: '0.3rem', letterSpacing: '2px' }}>
          THE EVENING
        </h2>
        <p style={{ fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
          {config.dateLabel} &bull; {config.hours}
        </p>
        <p className="italic-line" style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>
          {config.italicLine}
        </p>
        <AmenityGrid items={config.amenities} />
      </section>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-secondary)' }}>
          ALL WHITE
        </div>
        <h2 className="gold-text" style={{ fontSize: '1.5rem', marginBottom: '1rem', letterSpacing: '2px', fontFamily: 'Cinzel, serif' }}>
          HOUSE NOTES
        </h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          A few notes so the night stays as considered as the room.
        </p>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          <li style={{ marginBottom: '1rem' }}><strong>Photographs:</strong> Photographers and videographers will be circling to capture the night. Come camera ready.</li>
          <li style={{ marginBottom: '1rem' }}>
            <strong>Dress code:</strong> All white, head to toe.
          </li>
          <li><strong>The thread:</strong> The guest thread is for photos and messages from the night. Keep it among the list.</li>
        </ul>
      </section>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-secondary)' }}>
          GIFTS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <h2 className="gold-text" style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '2px', fontFamily: 'Cinzel, serif' }}>
            GIFTS
          </h2>
        </div>
        <p style={{ marginBottom: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {config.giftMessage} If you&apos;d like to chip in for the party, use Zelle.
        </p>
        <div style={{ padding: '1.2rem', background: 'rgba(110,88,64,0.06)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--brand-gold)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--brand-gold)', marginBottom: '0.5rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Zelle
          </p>
          <p style={{ fontSize: '1.6rem', color: 'var(--text-primary)', letterSpacing: '2px', marginBottom: '0.8rem', fontWeight: 600 }}>
            {config.zelleNumber}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
              No gifts, flowers, or alcohol please — cash only via Zelle.
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--brand-gold)', fontWeight: 600 }}>
              Suggested donation: $100 per person
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-secondary)' }}>
          FORT LAUDERDALE
        </div>
        <h2 className="gold-text" style={{ fontSize: '1.5rem', marginBottom: '1rem', letterSpacing: '2px', fontFamily: 'Cinzel, serif' }}>
          THE ADDRESS
        </h2>
        <p style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--brand-gold)' }}>The Victoria Park Mansion</p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
          544 North Victoria Park Road<br />Fort Lauderdale, FL 33301
        </p>
        <div style={{ padding: '1rem', background: 'rgba(110,88,64,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--brand-gold)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}><strong>Valet:</strong> At the front gates. Rideshare is encouraged.</p>
        </div>
      </section>
    </motion.div>
  );
}

// ============================================================
//  TAB 2: GUEST LIST
// ============================================================
function GuestsTab({ userRole, isAdminMode, setIsAdminMode, host }: { userRole: string; isAdminMode: boolean; setIsAdminMode: (v: boolean) => void; host: HostKey }) {
  const canManage = userRole === 'admin' || userRole === 'subadmin';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '1rem', paddingBottom: '140px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h2 className="gold-text" style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '3px', textAlign: 'center', fontFamily: 'Cinzel, serif' }}>
          {isAdminMode ? 'GUEST MANAGEMENT' : 'THE GUEST LIST'}
        </h2>
        
        {canManage && (
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              background: isAdminMode ? '#e4c98a' : 'transparent',
              color: isAdminMode ? '#07111f' : 'var(--brand-gold)',
              border: '1px solid var(--brand-gold)',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
          >
            {isAdminMode ? 'EXIT MANAGEMENT' : 'ENTER MANAGEMENT'}
          </button>
        )}
      </div>

      <GuestList 
        publicView={false} 
        layout={isAdminMode ? "management" : "grid"} 
        userRole={userRole}
        isAdminMode={isAdminMode}
        host={host}
      />
    </motion.div>
  );
}

// ============================================================
//  TAB 3: HYPE THREAD
// ============================================================
function ThreadTab({ posts, guestId }: { posts: Post[]; guestId: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts.length]);

  // Group posts by date for date separators
  const groupedPosts = useMemo(() => {
    const groups: { date: string; posts: Post[] }[] = [];
    let currentDate = '';

    for (const post of posts) {
      const postDate = new Date(post.created_at);
      const dateKey = postDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: getDateLabel(postDate), posts: [post] });
      } else {
        groups[groups.length - 1].posts.push(post);
      }
    }
    return groups;
  }, [posts]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        padding: '1rem',
        paddingBottom: '200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <MessageCircle size={48} color="var(--brand-gold)" style={{ opacity: 0.5, margin: '0 auto 1rem auto', display: 'block' }} />
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '1.1rem' }}>
            The thread is empty.<br />Be the first to post a photo or message.
          </p>
        </div>
      ) : (
        groupedPosts.map((group) => (
          <React.Fragment key={group.date}>
            <div className="date-separator">{group.date}</div>
            {group.posts.map((post) => {
              const isMe = post.guest_id === guestId;
              const bg = isMe ? 'rgba(228, 201, 138, 0.16)' : 'rgba(7, 17, 31, 0.62)';
              const fg = 'var(--text-primary)';
              const align = isMe ? 'flex-end' : 'flex-start';
              const name = post.guests?.full_name?.split(' ')[0] || 'Guest';

              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={post.id}
                  style={{
                    alignSelf: align,
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: align,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', opacity: 0.7, fontSize: '0.75rem' }}>
                    {!isMe && <span>{name}</span>}
                    <span style={{ color: 'var(--brand-gold)' }}>
                      {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <span>You</span>}
                  </div>

                  <div style={{
                    background: bg,
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    borderBottomRightRadius: isMe ? '4px' : 'var(--radius-lg)',
                    borderBottomLeftRadius: !isMe ? '4px' : 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 15px rgba(60,45,25,0.06)',
                    color: fg,
                    wordBreak: 'break-word',
                  }}>
                    {post.image_url && (
                      <div style={{ width: '100%', marginBottom: post.content ? '1rem' : 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <Image
                          src={post.image_url}
                          alt="Hype image"
                          width={300}
                          height={400}
                          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                          unoptimized
                        />
                      </div>
                    )}
                    {post.content && <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>{post.content}</p>}
                  </div>
                </motion.div>
              );
            })}
          </React.Fragment>
        ))
      )}
      <div ref={messagesEndRef} />
    </motion.div>
  );
}

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ============================================================
//  MAIN DASHBOARD
// ============================================================
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [prevTab, setPrevTab] = useState<TabType>('overview');
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Direction for tab transitions
  const direction = TABS.indexOf(activeTab) > TABS.indexOf(prevTab) ? 1 : -1;

  const handleTabChange = (tab: TabType) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  // Authenticate & Load
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) console.error("Session error:", sessionError);

        if (!currentSession) {
          router.push('/login');
          return;
        }

        if (cancelled) return;
        setSession(currentSession);

        // Fetch full user data to get avatar and status
        const { data: userData } = await supabase
          .from('guests')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (userData) {
          setCurrentUser(userData);
          setGuestName(userData.full_name?.split(' ')[0] || 'VIP');
        } else {
          const displayName =
            currentSession.user.user_metadata?.full_name?.split(' ')[0] ||
            currentSession.user.email?.split('@')[0] ||
            'VIP';
          setGuestName(displayName);
        }

        // Fetch initial hype posts
        const { data, error } = await supabase
          .from('hype_posts')
          .select('*, guests(full_name, photo_url, host)')
          .order('created_at', { ascending: true })
          .limit(100);

        if (!cancelled && !error && data) {
          // Casino Royale posts stay in the shared table. Only show this party.
          const whitePosts = (data as Post[]).filter((post) => post.guests?.host === EVENT_HOST);
          setPosts(whitePosts);
        }
      } catch (err) {
        console.error("Dashboard initialization failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();

    const handleScroll = () => setHasScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!session) return;

    const subscription = supabase
      .channel('public:hype_posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hype_posts' }, async (payload) => {
        const { data: guestData } = await supabase
          .from('guests')
          .select('full_name, photo_url, host')
          .eq('id', payload.new.guest_id)
          .single();

        if (guestData?.host !== EVENT_HOST) return;

        const newPost = { ...payload.new, guests: guestData } as Post;
        setPosts(prev => [...prev, newPost]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return (
    <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-gradient)' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '2px solid rgba(110,88,64,0.2)', borderTopColor: 'var(--brand-gold)', borderRadius: '50%', marginBottom: '1.5rem' }} />
      <p className="gold-text" style={{ fontSize: '1.2rem', letterSpacing: '4px', fontFamily: 'Cinzel, serif' }}>Verifying VIP Pass...</p>
    </div>
  );

  if (!session) return null;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'ALL WHITE';
      case 'guests': return 'VIP GUESTS';
      case 'thread': return 'THE HYPE THREAD';
      case 'profile': return 'USER PROFILE';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>

      {/* Still only. A loop behind the guest thread is a distraction. */}
      <SilkBackground animate={false} behind scrim="reading" />

      {/* Sticky Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '1.2rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: hasScrolled ? 'rgba(7, 17, 31, 0.9)' : 'transparent',
        backdropFilter: hasScrolled ? 'blur(15px)' : 'none',
        WebkitBackdropFilter: hasScrolled ? 'blur(15px)' : 'none',
        borderBottom: hasScrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {currentUser?.photo_url ? (
            <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
              <Image src={currentUser.photo_url} alt="Profile" fill style={{ objectFit: 'cover' }} unoptimized />
            </div>
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="gold-text" style={{ fontSize: '1rem', fontWeight: 600 }}>{guestName.charAt(0)}</span>
            </div>
          )}
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
              Welcome, {guestName}
            </p>
            <h1 className="gold-text" style={{ fontSize: '1.1rem', letterSpacing: '3px', margin: 0, fontFamily: 'Cinzel, serif' }}>
              {getTabTitle()}
            </h1>
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Log out"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.8rem', color: 'var(--error-color)',
            padding: '0.5rem 0.8rem', borderRadius: '40px', background: 'rgba(255,100,100,0.1)',
          }}
        >
          <LogOut size={14} /> Exit
        </button>
      </header>

      {/* Tab Content */}
      <main style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          {activeTab === 'overview' && <OverviewTab key="overview" host={EVENT_HOST} />}
          {activeTab === 'guests' && (
            <GuestsTab 
              key="guests" 
              userRole={currentUser?.role || 'guest'} 
              isAdminMode={isAdminMode} 
              setIsAdminMode={setIsAdminMode}
              host={EVENT_HOST}
            />
          )}
          {activeTab === 'thread' && <ThreadTab key="thread" posts={posts} guestId={session.user.id} />}
          {activeTab === 'profile' && <ProfileTab key="profile" currentUser={currentUser} setGuestName={setGuestName} setCurrentUser={setCurrentUser} supabase={supabase} />}
        </AnimatePresence>
      </main>

      {/* Floating Composer */}
      <AnimatePresence>
        {activeTab === 'thread' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 'calc(64px + env(safe-area-inset-bottom))',
              left: 0, right: 0,
              padding: '0 1rem',
              zIndex: 40,
            }}
          >
            <CreatePost userId={session.user.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 'calc(64px + env(safe-area-inset-bottom))',
        background: 'rgba(7, 17, 31, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: '0.6rem',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
        boxShadow: '0 -8px 24px rgba(60,45,25,0.06)',
      }}>
        <TabButton icon={<Info size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} />
        <TabButton icon={<Users size={20} />} label="Guests" active={activeTab === 'guests'} onClick={() => handleTabChange('guests')} />
        <TabButton icon={<MessageCircle size={20} />} label="Thread" active={activeTab === 'thread'} onClick={() => handleTabChange('thread')} />
        <TabButton icon={<User size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => handleTabChange('profile')} />
      </nav>
    </div>
  );
}

// ============================================================
//  TAB BUTTON
// ============================================================
function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        color: active ? 'var(--brand-gold)' : 'rgba(246,241,230,0.42)',
        transition: 'all 0.2s ease',
        width: '70px',
        padding: '0.3rem 0',
        minHeight: '48px', // Minimum touch target
      }}
    >
      <div style={{
        transform: active ? 'scale(1.15)' : 'scale(1)',
        transition: 'transform 0.2s ease',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.6rem', letterSpacing: '0.5px', fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
    </button>
  );
}

// ============================================================
//  TAB 4: PROFILE
// ============================================================
function ProfileTab({ currentUser, setGuestName, setCurrentUser, supabase }: any) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isDeclined = currentUser?.rsvp_status === 'declined';

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setErrorMsg('');
    try {
      const formData = new FormData(e.currentTarget);
      await updateProfile(formData);
      
      const newName = formData.get('fullName') as string;
      setGuestName(newName.split(' ')[0]);
      setCurrentUser((p: any) => ({ ...p, full_name: newName, phone: formData.get('phone'), plus_one_names: formData.get('plusOneNames') }));
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setLoading(true);
      const file = e.target.files[0];
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 512, useWebWorker: true });
      const fileName = `avatar-${currentUser.id}-${Date.now()}.webp`;
      const uploadFile = new File([compressed], fileName, { type: 'image/webp' });

      const { error: uploadError } = await supabase.storage.from('avatars').upload(`public/${fileName}`, uploadFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`public/${fileName}`);
      
      await supabase.from('guests').update({ photo_url: publicUrl }).eq('id', currentUser.id);
      setCurrentUser((p: any) => ({ ...p, photo_url: publicUrl }));
      setSuccess('Profile icon updated.');
    } catch (err) {
      setErrorMsg('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (isDeclined || confirm('Are you sure you want to cancel your RSVP? Your spot will be forfeited.')) {
      try {
        setLoading(true);
        const newStatus = isDeclined ? 'attending' : 'declined';
        await toggleRsvpStatus(newStatus);
        setCurrentUser((p: any) => ({ ...p, rsvp_status: newStatus }));
        setSuccess(isDeclined ? 'RSVP Confirmed!' : 'RSVP Cancelled.');
      } catch (err) {
        setErrorMsg('Failed to update status.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ padding: '1.5rem', paddingBottom: '140px' }}>
      
      {/* Avatar Upload */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} disabled={loading} />
        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ width: 90, height: 90, borderRadius: '50%', background: currentUser?.photo_url ? `url(${currentUser.photo_url}) center/cover` : 'rgba(255,255,255,0.05)', border: '2px solid var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', padding: '4px', fontSize: '0.6rem', textAlign: 'center', color: 'white' }}>EDIT</div>
          {!currentUser?.photo_url && <Camera color="var(--brand-gold)" />}
        </button>
      </div>

      <form onSubmit={handleUpdate} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {errorMsg && <div style={{ color: '#ff8a8a', fontSize: '0.85rem', textAlign: 'center' }}>{errorMsg}</div>}
        {success && <div style={{ color: 'var(--brand-gold)', fontSize: '0.85rem', textAlign: 'center' }}>{success}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--brand-gold)', letterSpacing: '1px' }}>NAME</label>
          <input required name="fullName" defaultValue={currentUser?.full_name} className="luxury-input" style={{ padding: '0.8rem' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--brand-gold)', letterSpacing: '1px' }}>PHONE</label>
          <input name="phone" defaultValue={currentUser?.phone} className="luxury-input" style={{ padding: '0.8rem' }} placeholder="Optional" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--brand-gold)', letterSpacing: '1px' }}>+1 GUEST NAME</label>
          <input name="plusOneNames" defaultValue={currentUser?.plus_one_names} className="luxury-input" style={{ padding: '0.8rem' }} placeholder="Optional" />
        </div>
        
        <button type="submit" disabled={loading} className="plaque-button" style={{ opacity: loading ? 0.7 : 1, maxWidth: 'none' }}>
          {loading ? 'SAVING...' : 'SAVE DETAILS'}
        </button>
      </form>

      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <h3 className="gold-text" style={{ fontSize: '1.2rem', margin: '0 0 1rem 0' }}>CURRENT RSVP</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {isDeclined ? 'You are currently marked as not attending. Re-RSVP to secure a spot.' : 'You are confirmed on the VIP guest list.'}
        </p>
        <button 
          onClick={handleToggleStatus} 
          disabled={loading}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '40px', background: isDeclined ? '#e4c98a' : 'rgba(224, 138, 138, 0.1)', color: isDeclined ? '#07111f' : 'var(--error-color)', border: isDeclined ? 'none' : '1px solid var(--error-color)', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}
        >
          {isDeclined ? 'RE-CONFIRM RSVP' : 'CANCEL RSVP'}
        </button>
      </div>

    </motion.div>
  );
}
