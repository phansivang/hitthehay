import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from '@/features/landing/Landing';
import WorkflowEditor from '@/features/editor/WorkflowEditor';
import TaskList from '@/features/tasks/TaskList';
import TaskDetail from '@/features/tasks/TaskDetail';
import Navbar from '@/shared/components/Navbar';
import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import ForgotPassword from '@/features/auth/ForgotPassword';
import { AuthProvider, useAuthContext } from '@/shared/auth/AuthContext';
import AdminLayout from '@/features/admin/AdminLayout';
import Dashboard from '@/features/admin/Dashboard';
import Users from '@/features/admin/Users';
import Roles from '@/features/admin/Roles';
import Workflows from '@/features/admin/Workflows';
import TasksModeration from '@/features/admin/TasksModeration';
import ContentLibrary from '@/features/admin/ContentLibrary';
import AuditLogs from '@/features/admin/AuditLogs';
import Analytics from '@/features/admin/Analytics';
import Settings from '@/features/admin/Settings';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuthContext();
  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-gray-700">Unauthorized. Please log in as admin.</div>;
  }
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/editor"
          element={
            <div className="flex flex-col h-screen bg-[#f8f9fb] text-gray-800">
              <Navbar />
              <main className="flex-grow pt-14">
                <WorkflowEditor />
              </main>
            </div>
          }
        />
        <Route
          path="/tasks"
          element={
            <div className="flex flex-col h-screen bg-[#f8f9fb] text-gray-800">
              <Navbar />
              <main className="flex-grow pt-14">
                <TaskList />
              </main>
            </div>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <div className="flex flex-col h-screen bg-[#f8f9fb] text-gray-800">
              <Navbar />
              <main className="flex-grow pt-14">
                <TaskDetail />
              </main>
            </div>
          }
        />
      </Routes>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="moderation" element={<TasksModeration />} />
          <Route path="content" element={<ContentLibrary />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      {/* Dashboard route using TaskList as the main content */}
      <Routes>
        <Route
          path="/dashboard"
          element={
            <div className="flex flex-col h-screen bg-[#f8f9fb] text-gray-800">
              <Navbar />
              <main className="flex-grow pt-14">
                <TaskList />
              </main>
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;


