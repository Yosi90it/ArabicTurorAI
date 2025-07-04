import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Header with Logout */}
      <Header />
      
      {/* Mobile Hamburger Button */}
      <div className="sm:hidden absolute top-4 left-4 z-30">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 bg-purple-700 text-white rounded-lg"
        >
          &#9776;
        </button>
      </div>

      {/* Backdrop when drawer is open */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`
          fixed top-0 left-0 h-full z-30
          w-64 bg-purple-700 text-white
          transform transition-transform duration-300
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:relative sm:translate-x-0
        `}
      >
        <Sidebar onLinkClick={() => setDrawerOpen(false)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="container mx-auto px-4 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
