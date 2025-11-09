import React, { useState, useMemo, useCallback, useRef } from 'react';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import { ReactFlowProvider, useNodesState, useEdgesState, useReactFlow, Node } from 'reactflow';
import { useNodesContext } from '@/shared/context/NodesContext';
import { NodeData } from '@/shared/types';
import { validateNodeWorkflow, canAddNode } from './strategies/node-validation-strategy';
import {
  createNodeIdGenerator,
  createNodeFromSidebarNode,
  findSourceNode,
  createEdge,
  addEdgeToEdges,
} from './utils/node-utils';

const InnerEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const { nodes: nodeLibrary, loading, error } = useNodesContext();
  const getId = useRef(createNodeIdGenerator()).current;

  // Use validation strategy instead of complex if statements
  const validation = useMemo(() => validateNodeWorkflow(nodes), [nodes]);
  const allowedCategories = useMemo(() => validation.allowedCategories, [validation]);

  const onDrop = useCallback(
    (event: React.DragEvent, reactFlowWrapper: React.RefObject<HTMLDivElement>) => {
      event.preventDefault();
      
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      // Type guard: validate input
      if (!type || !reactFlowBounds) {
        return;
      }

      const nodeInfo = nodeLibrary.find((n) => n.type === type);
      if (!nodeInfo) {
        return;
      }

      // Use validation strategy
      const validationResult = canAddNode(nodes, nodeInfo.category);
      if (!validationResult.canAdd) {
        alert(validationResult.errorMessage);
        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create icon element in React component context
      const IconComponent = nodeInfo.icon;
      const iconElement = <IconComponent />;
      
      const newNode = createNodeFromSidebarNode(nodeInfo, position, getId, iconElement);
      const sourceNode = findSourceNode(nodes, newNode);

      setNodes((nds) => nds.concat(newNode));

      // Create edge if source node exists
      sourceNode && setEdges((eds) => addEdgeToEdges(eds, createEdge(sourceNode, newNode)));
    },
    [project, nodes, setNodes, setEdges, nodeLibrary, getId]
  );

  const updateNodeSettings = useCallback(
    (nodeId: string, newSettings: NodeData['settings']) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, settings: newSettings } }
            : node
        )
      );

      // Update selected node if it's the one being updated
      setSelectedNode((prev) =>
        prev?.id === nodeId
          ? { ...prev, data: { ...prev.data, settings: newSettings } }
          : prev
      );
    },
    [setNodes]
  );

  return (
    <div className="flex h-full w-full">
      <Sidebar 
        allowedCategories={allowedCategories} 
        nodeLibrary={nodeLibrary}
        loading={loading}
        error={error}
      />
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


