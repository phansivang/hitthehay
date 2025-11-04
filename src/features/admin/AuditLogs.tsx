import React, { useEffect, useState } from 'react';
import { adminService } from '@/shared/services/adminService';
import type { AuditLogEntry } from '@/shared/types/admin';

const AuditLogs: React.FC = () => {
  const [rows, setRows] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    adminService.listAuditLogs().then(setRows).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Audit Logs</h1>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2 text-left">Actor</th>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-left">Target</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-3 py-2">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">{a.actor}</td>
                <td className="px-3 py-2">{a.action}</td>
                <td className="px-3 py-2">{a.target ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;





