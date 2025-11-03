import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Node } from 'reactflow';
import type { NodeData } from '@/shared/types';

interface SettingsDrawerProps {
  node: Node<NodeData> | null;
  onClose: () => void;
  onSave: (nodeId: string, settings: any) => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ node, onClose, onSave }) => {
  const [settings, setSettings] = useState(node?.data.settings || {});

  useEffect(() => {
    setSettings(node?.data.settings || {});
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

    if (node.data.nodeType === 'videoUpload') {
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          const newFileNames = Array.from(e.target.files).map(file => file.name);
          setSettings((prev: any) => ({
            ...prev,
            files: [...(prev.files || []), ...newFileNames]
          }));
          e.target.value = '';
        }
      };

      const handleRemoveFile = (indexToRemove: number) => {
        setSettings((prev: any) => ({
          ...prev,
          files: prev.files.filter((_: string, index: number) => index !== indexToRemove)
        }));
      };

      const currentFiles: string[] = settings.files || [];

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
          
          {currentFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600">Selected files:</h4>
              <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {currentFiles.map((fileName, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm">
                    <span className="text-gray-800 truncate" title={fileName}>{fileName}</span>
                    <button onClick={() => handleRemoveFile(index)} className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
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
  );
};

export default SettingsDrawer;


