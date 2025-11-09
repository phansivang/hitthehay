import React, { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { tasksService, type Task } from '@/shared/services/tasksService';

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await tasksService.getTasks();
        setTasks(response.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Flows</h1>
        <Link to="/editor" className="px-4 py-2 bg-[#f65e05] text-white rounded-md shadow-sm font-medium hover:bg-[#dd5504]">
          + Create New Flow
        </Link>
      </div>
      {isLoading ? (
        <div className="bg-white shadow-md rounded-lg p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#f65e05] rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      ) : error ? (
        <div className="bg-white shadow-md rounded-lg p-12 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-12 text-center">
          <p className="text-gray-600">No tasks found. Create your first task flow to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => {
                const isActive = task.status === 'ACTIVE';
                const createdAt = new Date(task.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
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
                      <div className="text-sm text-gray-500">{task.schedule}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                        <span className="text-sm text-gray-700">{task.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4 border-r-2 border-transparent group-hover:border-[#f65e05]">
                      <Link 
                        to="/editor" 
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#f65e05] hover:text-[#c44c04] inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1"/> Edit Flow
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement delete functionality
                        }}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1"/> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskList;



