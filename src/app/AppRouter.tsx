import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '@/features/landing/Landing';
import WorkflowEditor from '@/features/editor/WorkflowEditor';
import TaskList from '@/features/tasks/TaskList';
import TaskDetail from '@/features/tasks/TaskDetail';
import Navbar from '@/shared/components/Navbar';
import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import ForgotPassword from '@/features/auth/ForgotPassword';
import TermsOfService from '@/features/legal/TermsOfService';
import PrivacyPolicy from '@/features/legal/PrivacyPolicy';

const AppRouter: React.FC = () => {
  // Use Vite's BASE_URL for GitHub Pages compatibility
  // Vite's BASE_URL already includes the correct base path
  const basePath = import.meta.env.BASE_URL;
  
  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
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
    </BrowserRouter>
  );
};

export default AppRouter;


