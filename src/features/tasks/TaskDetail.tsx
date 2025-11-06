import React, {useEffect, useMemo, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'facebook';

interface TaskLogItem {
  logId: string;
  title: string;
  description: string;
  videoUrl: string;
  publishedAt: string;
  platform: Platform;
}

interface TaskWithLogsData {
  id: number;
  name: string;
  logs: TaskLogItem[];
}

// TODO: Replace with API call when backend is ready
// Example: const task = await taskService.getTaskDetail(id);

const platformIconSrc: Record<Platform, string> = {
  youtube: '/assets/platforms/youtube_icon.png',
  tiktok: '/assets/platforms/tiktok_icon.png',
  instagram: '/assets/platforms/instagram_icon.png',
  facebook: '/assets/platforms/facebook_icon.png',
};

const TaskDetail: React.FC = () => {
  const params = useParams();
  const id = Number(params.id);
  const [task, setTask] = useState<TaskWithLogsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openVideoUrl, setOpenVideoUrl] = useState<string | null>(null);
  const formattedLogs = useMemo(() => task?.logs ?? [], [task]);

  // TODO: Replace with actual API call when backend is ready
  // useEffect(() => {
  //   taskService.getTaskDetail(id).then(setTask).catch(console.error).finally(() => setIsLoading(false));
  // }, [id]);

  useEffect(() => {
    // Simulate loading - remove when API is ready
    setIsLoading(false);
    setTask(null);
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-6">
          <Link to="/tasks" className="text-[#f65e05] hover:underline">← Back to Tasks</Link>
        </div>
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#f65e05] rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-6">
          <Link to="/tasks" className="text-[#f65e05] hover:underline">← Back to Tasks</Link>
        </div>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-2">Task not found</h1>
          <p className="text-gray-600">The task with ID {id} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{task.name}</h1>
        <Link to="/tasks" className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Back
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {formattedLogs.map((log) => (
            <div
              key={log.logId}
              className="w-full px-6 py-4 flex items-center space-x-4 hover:ring-2 hover:ring-inset hover:ring-[#f65e05] cursor-pointer"
            >
              <button
                type="button"
                onClick={() => setOpenVideoUrl(log.videoUrl)}
                className="text-[#f65e05] hover:text-[#c44c04]"
                aria-label={`Play ${log.title}`}
              >
                <PlayCircle className="w-6 h-6" />
              </button>
              <div className="flex-1 min-w-0 flex items-center space-x-3">
                <img src={platformIconSrc[log.platform]} alt={log.platform} className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0 text-sm text-gray-800">
                  <span className="font-medium mr-2 truncate inline-block max-w-[30%] align-middle">{log.title}</span>
                  <span className="text-gray-500 truncate inline-block align-middle max-w-[50%]">{log.description}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 flex-shrink-0">
                {new Date(log.publishedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {openVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpenVideoUrl(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-[90vw] max-w-3xl p-4">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setOpenVideoUrl(null)}
              aria-label="Close video"
            >
              ✕
            </button>
            <video className="w-full rounded-md" src={openVideoUrl} controls autoPlay />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;


