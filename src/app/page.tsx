"use client";

import { Suspense } from 'react';
import LandingPage from '@/components/LandingPage';
import { EVENT_HOST } from '@/lib/eventConfig';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ height: "100vh", backgroundColor: "#07111f" }} />}>
      <LandingPage host={EVENT_HOST} />
    </Suspense>
  );
}
