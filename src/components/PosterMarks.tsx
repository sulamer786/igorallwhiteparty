"use client";

import { motion } from 'framer-motion';
import type { Amenity, AmenityIcon } from '@/lib/eventConfig';

// Hairline, diamond, hairline. The flyer ornament, drawn out from the center.
export function DiamondRule({ delay = 0 }: { delay?: number }) {
  return (
    <div className="diamond-rule" aria-hidden>
      <motion.span
        className="diamond-rule-line"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      />
      <span className="diamond" />
      <motion.span
        className="diamond-rule-line"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

// Thin gold line icons, one stroke weight, matching the flyer amenity row.
export function AmenityIcon({ name }: { name: AmenityIcon }) {
  const common = {
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.15,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    width: 26,
    height: 26,
    'aria-hidden': true,
  };

  if (name === 'car') {
    return (
      <svg {...common}>
        <path d="M6.5 19.5h19" />
        <path d="M8.2 19.5 10.4 13a2 2 0 0 1 1.9-1.3h7.4a2 2 0 0 1 1.9 1.3l2.2 6.5" />
        <path d="M7 19.5v2.2M25 19.5v2.2" />
        <circle cx="11" cy="21.2" r="1.5" />
        <circle cx="21" cy="21.2" r="1.5" />
      </svg>
    );
  }

  if (name === 'coupe') {
    return (
      <svg {...common}>
        <path d="M7 12h18L21 18H11L7 12z" />
        <path d="M16 18v6" />
        <path d="M11.5 24h9" />
      </svg>
    );
  }

  if (name === 'rope') {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="2" />
        <circle cx="23" cy="8" r="2" />
        <path d="M9 10v13M23 10v13" />
        <path d="M9 13c4.2 3.2 9.8 3.2 14 0" />
      </svg>
    );
  }

  if (name === 'headphones') {
    return (
      <svg {...common}>
        <path d="M8 18.5v-2a8 8 0 0 1 16 0v2" />
        <rect x="6" y="17" width="4.2" height="7.2" rx="1.2" />
        <rect x="21.8" y="17" width="4.2" height="7.2" rx="1.2" />
      </svg>
    );
  }

  if (name === 'bottle') {
    return (
      <svg {...common}>
        <path d="M13 5.5h6V9l2.2 3.2V24a2 2 0 0 1-2 2h-6.4a2 2 0 0 1-2-2V12.2L13 9V5.5z" />
        <path d="M12.8 12.2h6.4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M16 4.5v5.2M16 22.3V27.5M4.5 16h5.2M22.3 16H27.5" />
      <path d="M7.8 7.8l3.6 3.6M20.6 20.6l3.6 3.6M24.2 7.8l-3.6 3.6M11.4 20.6 7.8 24.2" />
      <circle cx="16" cy="16" r="2.1" />
    </svg>
  );
}

// Flyer order: three columns, the pair stacked inside each column.
const DISPLAY_ORDER = ['valet', 'carpet', 'bar', 'drinks', 'dj', 'fireworks'];

export function AmenityGrid({
  items,
  reveal = false,
}: {
  items: readonly Amenity[];
  reveal?: boolean;
}) {
  const ordered = DISPLAY_ORDER
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is Amenity => Boolean(item));

  return (
    <ul className="amenity-grid">
      {ordered.map((item, index) => (
        <motion.li
          key={item.id}
          className="amenity-cell"
          initial={reveal ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reveal ? 1.85 + index * 0.07 : 0, duration: 0.45 }}
        >
          <AmenityIcon name={item.icon} />
          <span>{item.label}</span>
        </motion.li>
      ))}
    </ul>
  );
}
