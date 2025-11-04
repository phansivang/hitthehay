import React, { useEffect, useState } from 'react';
import { adminService } from '@/shared/services/adminService';
import type { WorkflowSummary } from '@/shared/types/admin';

const Workflows: React.FC = () => {
  const [rows, setRows] = useState<WorkflowSummary[]>([]);

  useEffect(() => {
    adminService.listWorkflows().then(setRows).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Workflows</h1>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Last Run</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-3 py-2">{w.name}</td>
                <td className="px-3 py-2">{w.status}</td>
                <td className="px-3 py-2">{w.lastRunAt ? new Date(w.lastRunAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Workflows;





