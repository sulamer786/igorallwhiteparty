import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f7f4ef",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://jeniebirthday.com"),
  title: "Igor's All White Party — November 7th",
  description:
    "You're invited to Igor's All White Party. November 7th, 8:00 PM to 2:00 AM at The Victoria Park Mansion. Wear white. RSVP to secure your spot on the guest list.",
  keywords: ["all white party", "Igor", "Fort Lauderdale", "VIP event", "luxury party", "November 7"],
  openGraph: {
    title: "Igor's All White Party",
    description: "You're invited to Igor's All White Party. November 7th, 8:00 PM to 2:00 AM. Wear white.",
    type: "website",
    images: [
      {
        url: "/og-all-white.png",
        width: 1200,
        height: 630,
        alt: "Igor's All White Party — November 7th",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Igor's All White Party",
    description: "You're invited to Igor's All White Party. November 7th, 8:00 PM to 2:00 AM. Wear white.",
    images: ["/og-all-white.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
