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
        <link rel="icon" type="image/png" sizes="32x32" href="/pendly-logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/pendly-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/pendly-logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body className="global-gradient-bg">
        {/* Red accent circles for all pages */}
        <div
          className="absolute top-[-80px] right-[-120px] w-[320px] h-[320px] rounded-full bg-red-500 opacity-40 z-0 pointer-events-none select-none"
          style={{
            animation: 'float1 16s ease-in-out infinite, float-scale-in 0.5s cubic-bezier(0.4,0,0.2,1) 0s 1 normal both'
          }}
        ></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-[260px] h-[260px] rounded-full bg-red-500 opacity-40 z-0 pointer-events-none select-none float-animate-2"></div>
        <div className="absolute top-[40%] left-[-120px] w-[180px] h-[180px] rounded-full bg-red-500 opacity-20 z-0 pointer-events-none select-none float-animate-3"></div>
        <div className="absolute top-[-60px] left-[-80px] w-[180px] h-[180px] rounded-full bg-red-500 opacity-40 z-0 pointer-events-none select-none float-animate-2"></div>
        <div className="absolute bottom-[-80px] right-[-80px] w-[220px] h-[220px] rounded-full bg-red-500 opacity-40 z-0 pointer-events-none select-none float-animate-3"></div>
        <ErrorBoundary>
        <NavBar />
        <div className="pt-14">{children}</div>
        <SupportButton />
        </ErrorBoundary>
      </body>
    </html>
  );
}
