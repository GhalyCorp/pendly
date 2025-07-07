import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Pendly",
  description: "Crowdfunding for local businesses",
};

import NavBar from '../components/NavBar';
import SupportButton from '../components/SupportButton';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
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
