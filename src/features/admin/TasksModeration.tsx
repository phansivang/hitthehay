import React, { useEffect, useState } from 'react';
import { adminService } from '@/shared/services/adminService';
import type { ModerationTask } from '@/shared/types/admin';

const TasksModeration: React.FC = () => {
  const [rows, setRows] = useState<ModerationTask[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = () => adminService.listModerationTasks().then(setRows).catch(console.error);

  useEffect(() => { load(); }, []);

  const resolve = async (id: string, status: 'approved' | 'rejected') => {
    setLoadingId(id);
    await adminService.resolveModerationTask(id, status);
    setLoadingId(null);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Moderation</h1>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Content</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Reason</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2"/>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-3 py-2">{t.contentId}</td>
                <td className="px-3 py-2">{t.type}</td>
                <td className="px-3 py-2">{t.reason}</td>
                <td className="px-3 py-2">{t.status}</td>
                <td className="px-3 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button disabled={loadingId===t.id} onClick={() => resolve(t.id, 'approved')} className="px-2 py-1 rounded-md bg-green-600 text-white disabled:opacity-50">Approve</button>
                  <button disabled={loadingId===t.id} onClick={() => resolve(t.id, 'rejected')} className="px-2 py-1 rounded-md bg-red-600 text-white disabled:opacity-50">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksModeration;





