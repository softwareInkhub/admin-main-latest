'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastActive: doc.data().lastActive?.toDate()
        }));
        setActiveUsers(usersList);
      } catch (error) {
        console.error('Error fetching active users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Active Users</h1>
        <p className="text-gray-400 mt-1">Monitor currently active team members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeUsers.map((user) => (
          <div key={user.id} className="bg-[#1e2532] rounded-xl p-4 flex items-center space-x-4">
            <UserCircleIcon className="h-12 w-12 text-gray-400" />
            <div>
              <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
              <div className="text-gray-400 text-sm">{user.email}</div>
              <div className="text-gray-500 text-xs mt-1">
                Last active: {user.lastActive?.toLocaleString() || 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 