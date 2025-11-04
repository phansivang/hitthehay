import React, { useEffect, useState } from 'react';
import { adminService } from '@/shared/services/adminService';
import type { AdminRole } from '@/shared/types/admin';

const Roles: React.FC = () => {
  const [rows, setRows] = useState<AdminRole[]>([]);

  useEffect(() => {
    adminService.listRoles().then(setRows).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Roles</h1>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t align-top">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.description}</td>
                <td className="px-3 py-2 whitespace-pre-wrap">{r.permissions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Roles;





