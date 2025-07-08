import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Pendly",
  description: "Crowdfunding for local businesses",
  icons: {
    icon: [
      { url: '/pendly-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/pendly-logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/pendly-logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Pendly',
    description: 'Crowdfunding for local businesses',
    url: 'https://pendly.org',
    siteName: 'Pendly',
    images: [
      {
        url: '/pendly-logo.png',
        width: 1200,
        height: 630,
        alt: 'Pendly - Crowdfunding for local businesses',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pendly',
    description: 'Crowdfunding for local businesses',
    images: ['/pendly-logo.png'],
  },
};

import NavBar from '../components/NavBar';
import SupportButton from '../components/SupportButton';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" type="image/png" sizes="32x32" href="/pendly-logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/pendly-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/pendly-logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body>

        <ErrorBoundary>
        <NavBar />
        <div className="pt-14">{children}</div>
        <SupportButton />
        </ErrorBoundary>
      </body>
    </html>
  );
}
