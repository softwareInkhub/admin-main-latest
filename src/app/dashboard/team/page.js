'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { UserPlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const membersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersList);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-gray-400 mt-1">Manage your team members and their roles</p>
        </div>
        <Link
          href="/dashboard/team/add"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Member
        </Link>
      </div>

      <div className="bg-[#1e2532] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Member</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Position</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-300">{member.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-300">{member.department}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{member.position}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${member.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {member.status}
                    </span>
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