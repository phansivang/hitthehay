import React from 'react';
import { NavLink } from 'react-router-dom';
import { Workflow } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Workflow className="w-8 h-8 text-[#f65e05]" />
          <span className="font-bold text-xl text-gray-800">TaskFlow</span>
        </div>
        <nav className="hidden md:flex items-center space-x-2">
          <NavLink to="/editor" className={({ isActive }) => `px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'text-[#f65e05] bg-orange-50' : 'text-gray-600 hover:bg-gray-100'}`}>
            Editor
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'text-[#f65e05] bg-orange-50' : 'text-gray-600 hover:bg-gray-100'}`}>
            Tasks
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        
      </div>
    </header>
  );
};

export default Navbar;



