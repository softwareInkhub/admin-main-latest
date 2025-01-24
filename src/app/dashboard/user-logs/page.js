'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function UserActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, 'activityLogs'),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
        const snapshot = await getDocs(q);
        const logsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setLogs(logsList);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Activity Logs</h1>
        <p className="text-gray-400 mt-1">Track user actions and system events</p>
      </div>

      <div className="bg-[#1e2532] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {log.timestamp?.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{log.userEmail}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">{log.details}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 