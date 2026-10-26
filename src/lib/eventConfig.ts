// Single-event config for Igor's All White Party.
// Host "white" keeps this guest list separate from Casino Royale rows in the shared database.

export type HostKey = 'white';

export const EVENT_HOST: HostKey = 'white';

export const EVENT_CONFIG: Record<HostKey, {
  heroTitle: string;
  heroSubtitle: string;
  heroLine3: string;
  tagline: string;
  ogTitle: string;
  ogDescription: string;
  giftMessage: string;
  zelleNumber: string;
  emailSubjectName: string;
}> = {
  white: {
    heroTitle: "Igor's",
    heroSubtitle: 'All White',
    heroLine3: 'Party',
    tagline: 'Dress the part. Wear white.',
    ogTitle: "Igor's All White Party — November 7th",
    ogDescription: "You're invited to Igor's All White Party. November 7th, 8:00 PM to 2:00 AM. Wear white.",
    giftMessage: "This is only to break even on costs of the event. Non-profit! Optional.",
    zelleNumber: '917-574-3935',
    emailSubjectName: "Igor's All White Party",
  },
} as const;
