import React, { useState, useMemo, useCallback } from 'react';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import { ReactFlowProvider, useNodesState, useEdgesState, useReactFlow, Node, Edge, addEdge } from 'reactflow';
import { NODE_LIBRARY } from '@/shared/lib/constants';
import { NodeCategory, NodeData } from '@/shared/types';

let id = 1;
const getId = () => `dnd-node_${id++}`;

const InnerEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  const allowedCategories = useMemo(() => {
    if (nodes.length === 0) {
      return [NodeCategory.Triggers];
    }
    const hasNodeFromCategory = (category: NodeCategory) => nodes.some(n => n.data.category === category);
    if (!hasNodeFromCategory(NodeCategory.Triggers)) return [];

    const hasVideoSource = hasNodeFromCategory(NodeCategory.VideoSource);
    const hasAiModel = hasNodeFromCategory(NodeCategory.AIModels);

    if (hasVideoSource || hasAiModel) {
      if (hasAiModel && !hasNodeFromCategory(NodeCategory.PromptConfig)) {
        return [NodeCategory.PromptConfig];
      }
      return [NodeCategory.Platforms];
    }
    return [NodeCategory.VideoSource, NodeCategory.AIModels];
  }, [nodes]);

  const onDrop = useCallback(
    (event: React.DragEvent, reactFlowWrapper: React.RefObject<HTMLDivElement>) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !reactFlowBounds) return;
      
      const nodeInfo = NODE_LIBRARY.find(n => n.type === type);
      if (!nodeInfo || !allowedCategories.includes(nodeInfo.category)) {
          alert(`Invalid node. Please add a node from one of the following categories: ${allowedCategories.join(', ')}`);
          return;
      }
      
      const hasVideoSource = nodes.some(n => n.data.category === NodeCategory.VideoSource);
      const hasAiModel = nodes.some(n => n.data.category === NodeCategory.AIModels);
      if((hasVideoSource || hasAiModel) && (nodeInfo.category === NodeCategory.VideoSource || nodeInfo.category === NodeCategory.AIModels)) {
          alert('A Video Source or AI Model has already been added. You can only have one.');
          return;
      }

      const position = project({ x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top });
      const newNode: Node<NodeData> = {
        id: getId(),
        type: 'custom',
        position,
        data: {
          label: nodeInfo.label,
          icon: <nodeInfo.icon />,
          description: nodeInfo.description,
          category: nodeInfo.category,
          nodeType: nodeInfo.type,
          settings: { ...nodeInfo.defaultSettings },
        },
      };

      let sourceNode = null;
      if (nodes.length > 0) {
        if (newNode.data.category === NodeCategory.Platforms) {
          sourceNode = [...nodes].reverse().find(n => n.data.category !== NodeCategory.Platforms) || null;
        } else {
          sourceNode = nodes[nodes.length - 1];
        }
      }
      
      setNodes((nds) => nds.concat(newNode));

      if (sourceNode) {
        const newEdge = {
          id: `e${sourceNode.id}-${newNode.id}`,
          source: sourceNode.id,
          target: newNode.id,
          type: 'smoothstep',
          animated: true,
        };
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [project, nodes, setNodes, setEdges, allowedCategories]
  );
  
  const updateNodeSettings = useCallback((nodeId: string, newSettings: any) => {
    setNodes((nds) =>
      nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, settings: newSettings } } : node)
    );
     if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? ({ ...prev, data: { ...prev.data, settings: newSettings } }) : null);
    }
  }, [setNodes, selectedNode]);

  return (
    <div className="flex h-full w-full">
      <Sidebar allowedCategories={allowedCategories} />
      <Canvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDrop={onDrop}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        updateNodeSettings={updateNodeSettings}
      />
    </div>
  );
}

const WorkflowEditor: React.FC = () => (
  <ReactFlowProvider>
    <InnerEditor />
  </ReactFlowProvider>
);

export default WorkflowEditor;


