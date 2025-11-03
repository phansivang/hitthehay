import React, { useRef, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';
import { Plus, Save, Play } from 'lucide-react';
import CustomNode from './CustomNode';
import SettingsDrawer from './SettingsDrawer';
import type { NodeData } from '@/shared/types';

interface CanvasProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onDrop: (event: React.DragEvent, ref: React.RefObject<HTMLDivElement>) => void;
  selectedNode: Node<NodeData> | null;
  setSelectedNode: Dispatch<SetStateAction<Node<NodeData> | null>>;
  updateNodeSettings: (nodeId: string, newSettings: any) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  nodes, edges, onNodesChange, onEdgesChange, onDrop, 
  selectedNode, setSelectedNode, updateNodeSettings 
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDrop = useCallback((event: React.DragEvent) => {
    onDrop(event, reactFlowWrapper);
  }, [onDrop]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#f8f9fb]"
      >
        <Controls />
        <Background gap={16} />
      </ReactFlow>
      
      <div className="absolute top-4 right-4 flex space-x-2">
        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50">
            <Play className="w-4 h-4 mr-2" />
            Run Test
        </button>
        <button className="flex items-center px-4 py-2 bg-[#f65e05] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#dd5504]">
            <Save className="w-4 h-4 mr-2" />
            Save Flow
        </button>
      </div>

      <button className="absolute bottom-6 right-6 w-14 h-14 bg-[#f65e05] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#dd5504] transition-transform hover:scale-105">
        <Plus className="w-8 h-8" />
      </button>

      <SettingsDrawer 
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSave={updateNodeSettings}
      />
    </div>
  );
};

export default Canvas;


