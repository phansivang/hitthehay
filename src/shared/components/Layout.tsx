/**
 * Layout Component
 * Reusable layout wrapper to eliminate duplication
 */

import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col h-screen bg-[#f8f9fb] text-gray-800 ${className}`}>
      <Navbar />
      <main className="flex-grow pt-14">{children}</main>
    </div>
  );
};

