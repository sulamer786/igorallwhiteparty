import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07111f",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://igorallwhiteparty.vercel.app"),
  title: "Igor's White Party — An Evening Under the Stars",
  description:
    "An exclusive invitation to Igor's White Party. November 7th, 10 PM to 3 AM in Fort Lauderdale. Wear white. By invitation only.",
  keywords: ["white party", "Igor", "Fort Lauderdale", "VIP event", "luxury party", "November 7"],
  openGraph: {
    title: "Igor's White Party",
    description: "An evening under the stars. November 7th, 10 PM to 3 AM. Fort Lauderdale. Wear white.",
    type: "website",
    images: [
      {
        url: "/images/og-white-night.png",
        width: 1200,
        height: 630,
        alt: "Igor's White Party — An Evening Under the Stars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Igor's White Party",
    description: "An evening under the stars. November 7th, 10 PM to 3 AM. Fort Lauderdale. Wear white.",
    images: ["/images/og-white-night.png"],
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
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..72,400;6..72,500;6..72,600&family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
