
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import WorkflowEditor from './components/WorkflowEditor';
import TaskList from './components/TaskList';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
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

export default App;
