import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * AppShell component that wraps all pages
 * Provides consistent layout with navbar and footer
 */
const AppShell = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppShell; 