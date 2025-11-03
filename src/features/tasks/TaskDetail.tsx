import React, { useMemo, useState } from 'react';
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

const mockTaskDetails: TaskWithLogsData[] = [
  {
    id: 1,
    name: 'Daily Morning Video Post',
    logs: [
      {
        logId: '1a',
        title: 'Morning Highlights 10/26',
        description: 'Latest highlights with captions and upbeat track.',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        publishedAt: '2023-10-26T08:30:00Z',
        platform: 'tiktok',
      },
      {
        logId: '1b',
        title: 'Morning Highlights 10/25',
        description: 'Clipped best reactions, auto-subtitled and color corrected.',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        publishedAt: '2023-10-25T08:30:00Z',
        platform: 'instagram',
      },
    ],
  },
  {
    id: 2,
    name: 'Weekly YouTube Compilation',
    logs: [
      {
        logId: '2a',
        title: 'Week 43 Compilation',
        description: 'Top moments stitched with AI transitions and background score.',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        publishedAt: '2023-10-24T12:00:00Z',
        platform: 'youtube',
      },
    ],
  },
  {
    id: 3,
    name: 'Ad Campaign - Fall 2023',
    logs: [
      {
        logId: '3a',
        title: 'Ad Variant B',
        description: 'Hook-first variant optimized for watch-through.',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        publishedAt: '2023-10-22T15:45:00Z',
        platform: 'facebook',
      },
      {
        logId: '3b',
        title: 'Ad Variant A',
        description: 'Primary CTA placement near 4s with end slate.',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        publishedAt: '2023-10-21T10:10:00Z',
        platform: 'instagram',
      },
    ],
  },
  {
    id: 4,
    name: 'Experimental Content Flow',
    logs: [
      {
        logId: '4a',
        title: 'Template V3 Test',
        description: 'Testing new intro motion and color scheme.',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        publishedAt: '2023-10-20T17:15:00Z',
        platform: 'tiktok',
      },
    ],
  },
];

const platformIconSrc: Record<Platform, string> = {
  youtube: '/youtube_icon.png',
  tiktok: '/tiktok_icon.png',
  instagram: '/instagram_icon.png',
  facebook: '/facebook_icon.png',
};

const TaskDetail: React.FC = () => {
  const params = useParams();
  const id = Number(params.id);
  const task = mockTaskDetails.find((t) => t.id === id);
  const [openVideoUrl, setOpenVideoUrl] = useState<string | null>(null);
  const formattedLogs = useMemo(() => task?.logs ?? [], [task]);

  if (!task) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-6">
          <Link to="/tasks" className="text-[#f65e05] hover:underline">← Back to Tasks</Link>
        </div>
        <h1 className="text-2xl font-semibold">Task not found</h1>
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


