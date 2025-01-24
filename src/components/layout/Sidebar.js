'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const userRole = user?.role || 'user';

  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (title) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const navigation = [
    {
      title: "GENERAL",
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: HomeIcon,
          role: 'user'
        }
      ]
    },
    {
      title: "API Connecter",
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard/api-dashboard',
          icon: HomeIcon,
          role: 'admin'
        },
        {
          name: 'Declare API',
          href: '/dashboard/declare-api',
          icon: UserPlusIcon,
          role: 'admin'
        },
        {
          name: 'Connect API',
          href: '/dashboard/connect-api',
          icon: CheckCircleIcon,
          role: 'admin'
        }
      ]
    },
    {
      title: "JOB MANAGER",
      items: [
        {
          name: 'Shopify',
          href: '/dashboard/job-manager/shopify',
          icon: ShoppingCartIcon,
          role: 'admin'
        },
        {
          name: 'Pinterest',
          href: '/dashboard/job-manager/pinterest',
          icon: DocumentTextIcon,
          role: 'admin'
        }
      ]
    },
    {
      title: "PINTEREST",
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard/job-manager/pinterest/dashboard',
          icon: DocumentTextIcon,
          role: 'admin'
        }
      ]
    },
    {
      title: "ORDERS",
      items: [
        {
          name: 'All Orders',
          href: '/dashboard/orders',
          icon: ShoppingCartIcon,
          role: 'user'
        },
        {
          name: 'Order Reports',
          href: '/dashboard/order-reports',
          icon: DocumentTextIcon,
          role: 'user'
        },
        {
          name: 'Order Archive',
          href: '/dashboard/order-archive',
          icon: ArchiveBoxIcon,
          role: 'user'
        }
      ]
    },
    {
      title: "USER MANAGEMENT",
      items: [
        {
          name: 'Team Members',
          href: '/dashboard/team',
          icon: UserGroupIcon,
          role: 'admin'
        },
        {
          name: 'Active Users',
          href: '/dashboard/active-users',
          icon: UsersIcon,
          role: 'admin'
        },
        {
          name: 'User Activity Logs',
          href: '/dashboard/user-logs',
          icon: ClipboardDocumentListIcon,
          role: 'admin'
        }
      ]
    },
    {
      title: "ANALYTICS",
      items: [
        {
          name: 'Performance',
          href: '/dashboard/analytics',
          icon: ChartBarIcon,
          role: 'admin'
        }
      ]
    },
    {
      title: "SETTINGS",
      items: [
        {
          name: 'General Settings',
          href: '/dashboard/settings',
          icon: Cog6ToothIcon,
          role: 'admin'
        },
        {
          name: 'Profile Settings',
          href: '/dashboard/profile',
          icon: UserIcon,
          role: 'user'
        }
      ]
    }
  ];

  return (
    <div className="h-full bg-[#1e2532] border-r border-gray-800 flex flex-col">
      <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
        <nav className="px-3 py-4">
          {navigation.map((section) => {
            const visibleItems = section.items.filter(
              item => item.role === 'user' || userRole === 'admin'
            );

            if (visibleItems.length === 0) return null;

            const isOpen = openGroups[section.title];

            return (
              <div key={section.title} className="mb-6">
                <h3
                  className="flex items-center justify-between px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleGroup(section.title)}
                >
                  {section.title}
                  {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </h3>
                <div
                  className={`mt-2 space-y-1 transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'
                  }`}
                >
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-800 text-white '
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        
                        {item.badge > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
