'use client';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  
  // Don't render anything if user is not admin
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-gray-400 hover:text-white transition-colors">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
        )}
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
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-[#1e2532] border border-gray-800 shadow-lg focus:outline-none">
          <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
            <p className="text-sm font-medium text-white">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-custom">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <div
                      onClick={() => markAsRead(notification.id)}
                      className={`px-4 py-3 text-sm cursor-pointer ${
                        active ? 'bg-gray-800' : ''
                      }`}
                    >
                      <p className="text-white">{notification.title}</p>
                      <p className="text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(notification.createdAt?.toDate(), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 