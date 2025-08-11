import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="h-[calc(100vh-4rem)] overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 