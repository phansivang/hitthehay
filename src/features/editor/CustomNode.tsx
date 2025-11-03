import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { NodeData } from '@/shared/types';

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div className={`w-64 bg-white rounded-lg border-2 ${selected ? 'border-[#f65e05] shadow-xl' : 'border-gray-200 shadow-md'} transition-all duration-150`}>
      <div className="flex items-center space-x-3 p-3 border-b border-gray-200">
        <div className="w-8 h-8 flex items-center justify-center bg-orange-50 text-[#f65e05] rounded-md">
           {React.isValidElement(data.icon) ? React.createElement(data.icon.type, { className: 'w-5 h-5' }) : null}
        </div>
        <div className="flex-grow">
            <h3 className="font-bold text-sm text-gray-800">{data.label}</h3>
        </div>
      </div>
      <div className="p-3 text-xs text-gray-500">
        <p>{data.description}</p>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  );
};

export default memo(CustomNode);


