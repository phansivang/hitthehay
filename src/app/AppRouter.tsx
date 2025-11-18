import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '@/features/landing/Landing';
import WorkflowEditor from '@/features/editor/WorkflowEditor';
import TaskList from '@/features/tasks/TaskList';
import TaskDetail from '@/features/tasks/TaskDetail';
import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import ForgotPassword from '@/features/auth/ForgotPassword';
import TermsOfService from '@/features/legal/TermsOfService';
import PrivacyPolicy from '@/features/legal/PrivacyPolicy';
import PlatformConfirmed from '@/features/platform/PlatformConfirmed';
import { NodesProvider } from '@/shared/context/NodesContext';
import { Layout } from '@/shared/components/Layout';

const AppRouter: React.FC = () => {
  const basePath = import.meta.env.BASE_URL || '/';

  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/platform/confirmed" element={<PlatformConfirmed />} />
        <Route
          path="/editor"
          element={
            <NodesProvider>
              <Layout>
                <WorkflowEditor />
              </Layout>
            </NodesProvider>
          }
        />
        <Route
          path="/tasks"
          element={
            <Layout>
              <TaskList />
            </Layout>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <NodesProvider>
              <Layout>
                <TaskDetail />
              </Layout>
            </NodesProvider>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <TaskList />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;


