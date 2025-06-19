import React, { useState } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] h-screen bg-gray-100">
      {/* Mobile hamburger button */}
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

      {/* Sidebar drawer */}
      <Sidebar
        className={
          `
          fixed top-0 left-0 h-full z-30 transform
          bg-purple-700 text-white w-64
          sm:relative sm:translate-x-0
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300
        `}
        onLinkClick={() => setDrawerOpen(false)}
      />

      {/* Main content area */}
      <main className="overflow-y-auto scrollbar-hide">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
