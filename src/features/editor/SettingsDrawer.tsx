import React, { useEffect, useState } from 'react';
import { X, Loader2, Play } from 'lucide-react';
import { Node } from 'reactflow';
import type {NodeData, NodeSettings} from '@/shared/types';
import { fileUploadService } from '@/shared/services/fileUploadService';
import { openTikTokAuthWindow } from '@/shared/lib/tiktok-auth';
import { useNodesContext } from '@/shared/context/NodesContext';

interface SettingsDrawerProps {
  node: Node<NodeData> | null;
  onClose: () => void;
  onSave: (nodeId: string, settings: any) => void;
  taskId: string | null;
}

interface UploadedFile {
  id?: string;
  name: string;
  url?: string;
  key?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

function hasFiles(s: NodeSettings | undefined): s is { files: (string | UploadedFile)[] } {
  return !!s && 'files' in s && Array.isArray((s as any).files);
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ node, onClose, onSave, taskId }) => {
  const [settings, setSettings] = useState(node?.data.settings || {});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [loadingVideoUrl, setLoadingVideoUrl] = useState(false);
  const { getNodeIdByType, getNodeCodeByType } = useNodesContext();

  useEffect(() => {
    setSettings(node?.data.settings || {});

    if (hasFiles(node?.data.settings)) {
      const files = node!.data.settings!.files.map((file: string | UploadedFile) =>
          typeof file === 'string' ? { name: file, status: 'success' as const } : file
      );
      setUploadedFiles(files);
    } else {
      setUploadedFiles([]);
    }
  }, [node]);

  if (!node) {
    return null;
  } 
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    onSave(node.id, settings);
    onClose();
  };

  const renderSettings = () => {
    if (!settings) return <p>No settings available for this node.</p>;

    if (node.data.nodeType === 'platformTikTok') {
      const metadata = node.data.metadata as { nodeConfigId?: string } | undefined;
      const isConnected = Boolean(metadata?.nodeConfigId || node.data.hasValidConfig);

      const handleTikTokConnect = () => {
        const currentTaskId = taskId || sessionStorage.getItem('current_task_id');
        
        if (!currentTaskId) {
          alert('Please create a task first before connecting TikTok.');
          return;
        }

        const nodeId = getNodeIdByType('platformTikTok');
        const nodeType = getNodeCodeByType('platformTikTok');

        if (!nodeId || !nodeType) {
          alert('TikTok node configuration not found. Please refresh the page.');
          return;
        }

        const tiktokContext = {
          taskId: currentTaskId,
          nodeId,
          nodeType,
          position: node.position,
        };
        
        try {
          localStorage.setItem('tiktok_oauth_context', JSON.stringify(tiktokContext));
          openTikTokAuthWindow();
        } catch (error) {
          console.error('Error storing TikTok OAuth context:', error);
          alert('Failed to prepare OAuth connection. Please try again.');
        }
      };

      if (isConnected) {
        return (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-semibold">APP IS CONNECTED</p>
            <p className="text-xs text-green-700 mt-1">
              This TikTok account is already connected for this task. Reconnect only if you need to refresh the credentials.
            </p>
          </div>
        );
      }

      return (
        <div>
          <p className="text-sm text-gray-700 mb-3">
            Connect your TikTok account to continue.
          </p>
          <button
            type="button"
            onClick={handleTikTokConnect}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md shadow-sm hover:opacity-90"
          >
            Connect to app
          </button>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            Ensure the redirect URI and scopes are configured in environment variables.
          </div>
        </div>
      );
    }

    if (node.data.nodeType === 'videoUpload') {
      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
          return;
        }

        const files = Array.from(e.target.files);
        setUploading(true);

        setUploadedFiles((prev) => {
          const newFiles: UploadedFile[] = files.map(file => ({
            name: file.name,
            status: 'pending' as const,
          }));
          return [...prev, ...newFiles];
        });

        const uploadPromises = files.map(async (file) => {
          setUploadedFiles((prev) => {
            return prev.map((f) =>
              f.name === file.name ? { ...f, status: 'uploading' as const } : f
            );
          });

          try {
            const response = await fileUploadService.uploadFile(file);

            setUploadedFiles((prev) => {
              return prev.map((f) =>
                f.name === file.name
                  ? {
                      name: file.name,
                      status: 'success' as const,
                      id: response.data.key,
                      url: response.data.url,
                      key: response.data.key,
                    }
                  : f
              );
            });

            setSettings((prevSettings: any) => {
              const currentFiles = prevSettings.files || [];
              const fileInfo = {
                name: file.name,
                key: response.data.key,
                url: response.data.url,
              };
              return {
                ...prevSettings,
                files: [...currentFiles, fileInfo],
              };
            });
          } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';

            setUploadedFiles((prev) => {
              return prev.map((f) =>
                f.name === file.name
                  ? {
                      ...f,
                      status: 'error' as const,
                      error: errorMessage,
                    }
                  : f
              );
            });
          }
        });

        await Promise.all(uploadPromises);
        setUploading(false);
        e.target.value = '';
      };

      const handleRemoveFile = (indexToRemove: number) => {
        setUploadedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
        setSettings((prev: any) => {
          const currentFiles = prev.files || [];
          return {
            ...prev,
            files: currentFiles.filter((_: unknown, index: number) => index !== indexToRemove),
          };
        });
      };

      const handlePreviewVideo = async (file: UploadedFile) => {
        if (!file.key) {
          console.error('File key is missing');
          return;
        }

        setLoadingVideoUrl(true);
        try {
          const videoUrl = await fileUploadService.getFileViewUrl(file.key);
          setVideoPreviewUrl(videoUrl);
        } catch (error) {
          console.error('Error fetching video URL:', error);
          if (file.url) {
            setVideoPreviewUrl(file.url);
          }
        } finally {
          setLoadingVideoUrl(false);
        }
      };

      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 capitalize mb-2">
            Video Files
          </label>
          <div className="mt-1 p-4 border-2 border-dashed border-gray-300 rounded-md">
            <div className="text-center">
              <input
                type="file"
                id="file-upload"
                name="files"
                multiple
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer font-medium text-[#f65e05] hover:text-[#c44c04] focus-within:outline-none"
              >
                <span>Click to upload videos</span>
              </label>
              <p className="text-xs text-gray-500">MP4, MOV, AVI, etc.</p>
            </div>
          </div>
          
          {uploading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading files...
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600">Uploaded files:</h4>
              <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <li 
                    key={file.id || `${file.name}-${index}`} 
                    className={`flex items-center justify-between p-2 rounded-md text-sm ${
                      file.status === 'error' 
                        ? 'bg-red-50 border border-red-200' 
                        : file.status === 'uploading'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-800 truncate block" title={file.name}>
                        {file.name}
                      </span>
                      {file.status === 'uploading' && (
                        <span className="text-xs text-blue-600">Uploading...</span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-xs text-red-600">{file.error || 'Upload failed'}</span>
                      )}
                      {file.status === 'success' && (
                        <span className="text-xs text-green-600">Uploaded successfully</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {file.status === 'success' && file.key && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewVideo(file);
                          }}
                          className="text-[#f65e05] hover:text-[#c44c04] flex-shrink-0 p-1 rounded hover:bg-orange-50 transition-colors"
                          title="Preview video"
                          disabled={loadingVideoUrl}
                        >
                          {loadingVideoUrl ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(index);
                        }} 
                        className="text-red-500 hover:text-red-700 flex-shrink-0 p-1 rounded hover:bg-red-50 transition-colors"
                        disabled={file.status === 'uploading'}
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return Object.entries(settings).map(([key, value]) => (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
          {key.replace(/([A-Z])/g, ' $1')}
        </label>
        {node.data.nodeType === 'triggerTime' && key === 'time' ? (
           <input
                type="time"
                name={key}
                value={value as string}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#f65e05] focus:border-[#f65e05] text-sm bg-white text-gray-900"
            />
        ) : key.toLowerCase().includes('prompt') || key.toLowerCase().includes('description') || key.toLowerCase().includes('caption') ? (
            <textarea
                name={key}
                value={value as string}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#f65e05] focus:border-[#f65e05] text-sm bg-white text-gray-900"
            />
        ) : (
            <input
                type="text"
                name={key}
                value={value as string}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#f65e05] focus:border-[#f65e05] text-sm bg-white text-gray-900"
            />
        )}
      </div>
    ));
  };

  return (
    <>
      <div className={`absolute top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-10 transform transition-transform duration-300 ease-in-out ${node ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center bg-orange-50 text-[#f65e05] rounded-md">
                 {React.isValidElement(node.data.icon) ? React.createElement(node.data.icon.type, { className: 'w-5 h-5' }) : null}
              </div>
              <h2 className="text-lg font-semibold">{node.data.label} Settings</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-grow p-6 overflow-y-auto">
            {renderSettings()}
            <div className="mt-5 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
              {node.data.description}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-[#f65e05] border border-transparent rounded-md shadow-sm hover:bg-[#dd5504]">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {videoPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setVideoPreviewUrl(null)}
          />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] p-4 z-10">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              onClick={() => setVideoPreviewUrl(null)}
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <video 
                className="w-full h-auto max-h-[80vh] rounded-md" 
                src={videoPreviewUrl} 
                controls 
                autoPlay
                onError={(e) => {
                  console.error('Error loading video:', e);
                  setVideoPreviewUrl(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsDrawer;


