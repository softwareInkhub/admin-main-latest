'use client';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '@/context/AuthContext';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-white">{user?.email}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role || 'user'}</p>
        </div>
        <UserCircleIcon className="h-8 w-8" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-[#1e2532] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-800">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard/profile"
                  className={`${
                    active ? 'bg-gray-800/50 text-white' : 'text-gray-300'
                  } group flex items-center px-4 py-2 text-sm rounded-md`}
                >
                  <Cog6ToothIcon className="mr-3 h-5 w-5" />
                  Settings
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-800/50 text-red-300' : 'text-red-400'
                  } group flex items-center px-4 py-2 text-sm rounded-md w-full`}
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 