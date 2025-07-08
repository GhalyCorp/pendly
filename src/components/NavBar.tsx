'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../lib/firebase';
import { usePathname } from 'next/navigation';
import SearchBarNav from './SearchBarNav';

// Accept search and setSearch as props for homepage
interface NavBarProps {
  search?: string;
  setSearch?: (v: string) => void;
}

import type { User } from 'firebase/auth';

export default function NavBar({ search, setSearch }: NavBarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showLogoDropdown, setShowLogoDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const pathname = usePathname();
  const logoDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      // No longer tracking profileId for ESLint cleanliness
    });
    return () => unsubscribe();
  }, []);

  // Click outside handler for mobile dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logoDropdownRef.current && !logoDropdownRef.current.contains(event.target as Node)) {
        setShowLogoDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const handleLogout = async () => {
    await signOut(getAuth(app));
  };





  return (
    <nav className="w-full bg-white flex items-center justify-between px-2 md:px-4 py-3 fixed top-0 left-0 z-[999] border-none outline-none">
      <div className="relative group">
        {/* Desktop: Hover-based dropdown */}
        <div className="hidden md:block">
          <Link href="/" className="flex items-center gap-0 text-2xl font-bold hover:opacity-80 transition cursor-pointer">
            <Image src="/pendly-logo.png" alt="Pendly Logo" width={32} height={32} className="h-8 w-8 object-contain" />
            <span style={{ color: '#0181fe' }}>endly</span>
          </Link>
          <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
            <Link
              href="/"
              className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 rounded-t-lg"
            >
              🏠 Home
            </Link>
            <Link
              href="/how-it-works"
              className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 border-t border-gray-100"
            >
              🔍 How It Works
            </Link>
            <Link
              href="/about"
              className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 rounded-b-lg border-t border-gray-100"
            >
              ℹ️ About
            </Link>
          </div>
        </div>
        
        {/* Mobile: Click-based dropdown */}
        <div className="md:hidden" ref={logoDropdownRef}>
          <button 
            onClick={() => setShowLogoDropdown(!showLogoDropdown)}
            className="flex items-center gap-0 text-2xl font-bold transition cursor-pointer"
          >
            <Image src="/pendly-logo.png" alt="Pendly Logo" width={32} height={32} className="h-8 w-8 object-contain" />
            <span style={{ color: '#0181fe' }}>endly</span>
          </button>
          {showLogoDropdown && (
            <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              <Link
                href="/"
                onClick={() => setShowLogoDropdown(false)}
                className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 rounded-t-lg"
              >
                🏠 Home
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setShowLogoDropdown(false)}
                className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 border-t border-gray-100"
              >
                🔍 How It Works
              </Link>
              <Link
                href="/about"
                onClick={() => setShowLogoDropdown(false)}
                className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 rounded-b-lg border-t border-gray-100"
              >
                ℹ️ About
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* Desktop Search Bar */}
      {pathname === '/' && search !== undefined && setSearch !== undefined && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <SearchBarNav value={search} onChangeAction={setSearch} />
        </div>
      )}
      
      {/* Mobile Search Button */}
      {pathname === '/' && search !== undefined && setSearch !== undefined && (
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="bg-white border-2 border-gray-200 rounded-lg p-2 hover:border-blue-300 transition-colors"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Mobile Search Dropdown */}
      {showMobileSearch && pathname === '/' && search !== undefined && setSearch !== undefined && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-4 md:hidden z-50">
          <div className="flex items-center gap-2 mb-2">
            <SearchBarNav value={search} onChangeAction={setSearch} />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 md:gap-4">
        {!user && (
          <Link href="/signup" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition">
            <span className="hidden md:inline">Start a Campaign</span>
            <span className="md:hidden">Campaign</span>
          </Link>
        )}
        {!user && (
          <Link href="/login" className="bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition">
            <span className="hidden md:inline">Log In</span>
            <span className="md:hidden">Login</span>
          </Link>
        )}
        {user && (
          <div className="relative group">
            {/* Desktop: Hover-based dropdown */}
            <div className="hidden md:block">
              <button className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 transition">
                {user.displayName || user.email}
              </button>
              <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                <Link
                  href="/my-campaigns"
                  className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 rounded-t-lg"
                >
                  👤 Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 border-t border-gray-100"
                >
                  ⚙️ Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-red-700 hover:bg-red-50 transition-colors duration-150 rounded-b-lg border-t border-gray-100"
                >
                  🚪 Log Out
                </button>
              </div>
            </div>
            
            {/* Mobile: Click-based dropdown */}
            <div className="md:hidden" ref={userDropdownRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg font-bold transition"
              >
                {user.displayName || user.email}
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <Link
                    href="/my-campaigns"
                    onClick={() => setShowUserDropdown(false)}
                    className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 rounded-t-lg"
                  >
                    👤 Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 border-t border-gray-100"
                  >
                    ⚙️ Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-red-700 hover:bg-red-50 transition-colors duration-150 rounded-b-lg border-t border-gray-100"
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
