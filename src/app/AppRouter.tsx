import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from '@/features/landing/Landing';
import WorkflowEditor from '@/features/editor/WorkflowEditor';
import TaskList from '@/features/tasks/TaskList';
import Navbar from '@/shared/components/Navbar';
import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import ForgotPassword from '@/features/auth/ForgotPassword';

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
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;


