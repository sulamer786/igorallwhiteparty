import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-gradient)',
      overflowX: 'hidden',
      overflowY: 'auto',
      position: 'relative',
      WebkitOverflowScrolling: 'touch',
    }}>
      {children}
    </div>
  );
}
