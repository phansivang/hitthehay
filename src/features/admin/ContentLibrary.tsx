import React, { useEffect, useState } from 'react';
import { adminService } from '@/shared/services/adminService';
import type { ContentItem } from '@/shared/types/admin';

const ContentLibrary: React.FC = () => {
  const [rows, setRows] = useState<ContentItem[]>([]);

  useEffect(() => {
    adminService.listContent().then(setRows).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Content</h1>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Platform</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.title}</td>
                <td className="px-3 py-2">{c.platform}</td>
                <td className="px-3 py-2">{c.status}</td>
                <td className="px-3 py-2">{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentLibrary;





