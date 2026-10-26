"use client";

import { Suspense } from 'react';
import LandingPage from '@/components/LandingPage';
import { EVENT_HOST } from '@/lib/eventConfig';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ height: "100vh", backgroundColor: "#f7f4ef" }} />}>
      <LandingPage host={EVENT_HOST} />
    </Suspense>
  );
}
