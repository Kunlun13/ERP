import { useEffect, useState } from 'react';
import { Users, ClipboardList, Layers } from 'lucide-react';
import api from '../utils/api';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SessionGuard from '../components/SessionGuard';
import { formatDate } from '../utils/helpers';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings/dashboard')
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500">Overview of your school management system</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Students" value={stats?.students ?? 0} icon={Users} color="primary" />
          <StatCard title="Tests Created" value={stats?.tests ?? 0} icon={ClipboardList} color="green" />
          <StatCard title="Classes" value={stats?.classes ?? 0} icon={Layers} color="purple" />
        </div>

        <Card title="Recent Activities">
          {stats?.recentActivities?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivities.map((act) => (
                <div key={act._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{act.description}</p>
                    <p className="text-xs text-gray-500">{act.userId?.name} · {act.module}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(act.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activities</p>
          )}
        </Card>
      </div>
    </SessionGuard>
  );
}
