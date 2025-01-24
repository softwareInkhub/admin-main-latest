'use client';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import {
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Tab from '@/components/Reusable/Tab';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-800">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${color} rounded-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default function DashboardHome() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalInfluencers: 0,
    pendingApprovals: 0,
    activeCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [apis, setApis] = useState([]); // State to hold APIs

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch stats
        const influencersQuery = query(collection(db, 'influencers'));
        const influencersSnap = await getDocs(influencersQuery);

        setStats({
          totalInfluencers: influencersSnap.size,
          pendingApprovals: 0,
          activeCampaigns: 0,
        });

        // Fetch APIs
        const apisQuery = query(collection(db, 'declared_api'));
        const apisSnap = await getDocs(apisQuery);
        const apisList = apisSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApis(apisList); // Set the fetched APIs
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalInfluencers}
          icon={UsersIcon}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Pending"
          value={stats.pendingApprovals}
          icon={ClockIcon}
          color="bg-yellow-500/10 text-yellow-500"
        />
        <StatCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          icon={ChartBarIcon}
          color="bg-green-500/10 text-green-500"
        />
      </div>

      {/* Display APIs */}
      <h2 className="text-lg font-semibold">Connected APIs</h2>
      <div className="bg-[#1e2532] rounded-xl p-4">
        {apis.length === 0 ? (
          <p className="text-gray-400">No APIs found.</p>
        ) : (
          apis.map(api => (
            <div key={api.id} className="mb-4 p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">{api.apiName}</h3>
              <p className="text-gray-400">Main URL: {api.mainUrl}</p>
              <p className="text-gray-400">Method: {api.method}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 