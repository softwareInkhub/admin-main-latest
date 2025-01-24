'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import NotificationBell from '@/components/ui/NotificationBell';
import UserMenu from '@/components/layout/UserMenu';
import { Bars3Icon } from '@heroicons/react/24/outline';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1f2b]">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen bg-gray-900">
        {/* Top Navigation */}
        <div className="fixed top-0 right-0 z-40 left-0 lg:left-64">
          <div className="h-16 px-6 flex items-center justify-between bg-[#1a1f2b]/80 backdrop-blur-sm border-b border-gray-800/50">
            {/* Left side */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            {/* Right side */}
            <div className="flex items-center space-x-4 ml-auto">
              <NotificationBell />
              <div className="h-8 w-[1px] bg-gray-800/50"></div>
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="pt-16">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 