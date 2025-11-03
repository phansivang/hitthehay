import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const mockTasks = [
  { id: 1, name: 'Daily Morning Video Post', createdAt: '2023-10-26', active: true },
  { id: 2, name: 'Weekly YouTube Compilation', createdAt: '2023-10-24', active: false },
  { id: 3, name: 'Ad Campaign - Fall 2023', createdAt: '2023-10-22', active: true },
  { id: 4, name: 'Experimental Content Flow', createdAt: '2023-10-20', active: false },
];

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Flows</h1>
        <Link to="/editor" className="px-4 py-2 bg-[#f65e05] text-white rounded-md shadow-sm font-medium hover:bg-[#dd5504]">
          + Create New Flow
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="group cursor-pointer hover:bg-orange-50"
                role="button"
                aria-label={`Open ${task.name}`}
              >
                <td className="px-6 py-4 whitespace-nowrap border-l-2 border-transparent group-hover:border-[#f65e05]">
                  <div className="text-sm font-medium text-gray-900">{task.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{task.createdAt}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${task.active ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                        {task.active ? 'Active' : 'Inactive'}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4 border-r-2 border-transparent group-hover:border-[#f65e05]">
                  <Link to="/editor" className="text-[#f65e05] hover:text-[#c44c04] inline-flex items-center">
                    <Edit className="w-4 h-4 mr-1"/> Edit Flow
                  </Link>
                  <button className="text-red-600 hover:text-red-900 inline-flex items-center">
                    <Trash2 className="w-4 h-4 mr-1"/> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;



