// Single-event config for Igor's White Party.
// Host "white" keeps this guest list separate from Casino Royale rows in the shared database.

export type HostKey = 'white';
export type AmenityIcon = 'car' | 'sushi' | 'rope' | 'headphones' | 'bottle' | 'burst';

export type Amenity = {
  id: string;
  label: string;
  icon: AmenityIcon;
};

export const EVENT_HOST: HostKey = 'white';

export const EVENT_CONFIG: Record<HostKey, {
  eyebrow: string;
  heroTitle: string;
  italicLine: string;
  city: string;
  dateLabel: string;
  hours: string;
  attire: string;
  address: string;
  addressLines: string;
  closing: string;
  amenities: readonly Amenity[];
  ogTitle: string;
  ogDescription: string;
  giftMessage: string;
  zelleNumber: string;
  emailSubjectName: string;
}> = {
  white: {
    eyebrow: 'An Exclusive Invitation',
    heroTitle: 'White Party',
    italicLine: 'An Evening Under the Stars',
    city: 'Fort Lauderdale',
    dateLabel: 'November 7th',
    hours: '9 PM – 3 AM',
    attire: 'All White',
    address: '544 N Victoria Park Rd, Fort Lauderdale',
    addressLines: '544 North Victoria Park Road<br/>Fort Lauderdale, FL 33301',
    closing: 'By Invitation Only',
    amenities: [
      { id: 'valet', label: 'Valet Parking', icon: 'car' },
      { id: 'sushi', label: 'Sushi Delights', icon: 'sushi' },
      { id: 'carpet', label: 'Red Carpet Entrance', icon: 'rope' },
      { id: 'dj', label: 'Surprise DJ', icon: 'headphones' },
      { id: 'bar', label: 'Premium Open Bar', icon: 'bottle' },
      { id: 'fireworks', label: 'Fireworks', icon: 'burst' },
    ],
    ogTitle: "Igor's White Party — November 7th",
    ogDescription: "An exclusive invitation to Igor's White Party. An evening under the stars. November 7th, 9 PM to 3 AM. Fort Lauderdale. Wear white.",
    giftMessage: "This is only to break even on costs of the event. Non-profit! Optional.",
    zelleNumber: '917-574-3935',
    emailSubjectName: "Igor's White Party",
  },
} as const;
