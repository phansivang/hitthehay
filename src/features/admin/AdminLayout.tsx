import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart2, Users, Shield, Workflow, FileStack, ListChecks, Settings, BookOpenCheck, Home } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';

const AdminLayout: React.FC = () => {
  const { signOut } = useAuthContext();

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-800 flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
        <div className="h-14 border-b px-4 flex items-center font-semibold">Admin Portal</div>
        <nav className="flex-1 p-2 space-y-1">
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <Home className="w-4 h-4" /> Overview
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <Users className="w-4 h-4" /> Users
          </NavLink>
          <NavLink to="/admin/roles" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <Shield className="w-4 h-4" /> Roles
          </NavLink>
          <NavLink to="/admin/workflows" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <Workflow className="w-4 h-4" /> Workflows
          </NavLink>
          <NavLink to="/admin/moderation" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <ListChecks className="w-4 h-4" /> Moderation
          </NavLink>
          <NavLink to="/admin/content" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <FileStack className="w-4 h-4" /> Content
          </NavLink>
          <NavLink to="/admin/audit" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <BookOpenCheck className="w-4 h-4" /> Audit Logs
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <BarChart2 className="w-4 h-4" /> Analytics
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'bg-orange-50 text-[#f65e05]' : 'hover:bg-gray-100'}`}>
            <Settings className="w-4 h-4" /> Settings
          </NavLink>
        </nav>
        <div className="p-3 border-t">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;





