import React, { useEffect, useState } from 'react';
import { adminService } from '@/shared/services/adminService';
import type { AnalyticsSummary } from '@/shared/types/admin';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    adminService.getAnalytics().then(setData).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-bold">{data?.totalUsers ?? '—'}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Active Workflows</div>
          <div className="text-2xl font-bold">{data?.activeWorkflows ?? '—'}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Posts (7d)</div>
          <div className="text-2xl font-bold">{data?.postsLast7d ?? '—'}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Avg Proc. Time</div>
          <div className="text-2xl font-bold">{data ? `${Math.round(data.avgProcessingTimeMs/1000)}s` : '—'}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





