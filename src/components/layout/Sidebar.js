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
  CogIcon,
  ChartPieIcon,
  ClipboardIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const userRole = user?.role || 'user';

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
      title: "API Manager",
      items: [
        {
          name: 'API Dashboard',
          href: '/dashboard/api-dashboard',
          icon: UserPlusIcon,
          role: 'admin'
        },
        {
          name: 'API',
          href: '/dashboard/api',
          icon: UserPlusIcon,
          role: 'admin'
        },
        // {
        //   name: 'Declare Api',
        //   href: '/dashboard/declare-api',
        //   icon: CheckCircleIcon,
        //   role: 'admin'
        // },
        // {
        //   name: 'API Method',
        //   href: '/dashboard/api-names',
        //   icon: ClipboardIcon,
        //   role: 'admin'
        // }
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
          icon: PencilSquareIcon,
          role: 'admin'
        }
      ]
    },
    // {
    //   title: "PINTEREST",
    //   items: [
    //     {
    //       name: 'Dashboard',
    //       href: '/dashboard/job-manager/pinterest/dashboard',
    //       icon: ChartBarIcon,
    //       role: 'admin'
    //     }
    //   ]
    // },
    {
      title: "DESIGN",
      items: [
        {
          name: 'Design Library',
          href: '/dashboard/design-library',
          icon: DocumentTextIcon,
          role: 'admin'
        }
      ]
    },
    // {
    //   title: "ORDERS",
    //   items: [
    //     {
    //       name: 'All Orders',
    //       href: '/dashboard/orders',
    //       icon: ShoppingCartIcon,
    //       role: 'user'
    //     },
    //     {
    //       name: 'Order Reports',
    //       href: '/dashboard/order-reports',
    //       icon: ClipboardDocumentListIcon,
    //       role: 'user'
    //     },
    //     {
    //       name: 'Order Archive',
    //       href: '/dashboard/order-archive',
    //       icon: ArchiveBoxIcon,
    //       role: 'user'
    //     }
    //   ]
    // },
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

            return (
              <div key={section.title} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{section.title}</h3>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ease-in-out ${
                        isActive
                          ? 'bg-blue-800 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
