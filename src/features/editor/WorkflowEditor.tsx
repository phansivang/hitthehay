import React, { useState, useMemo, useCallback, useRef } from 'react';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import TaskNameModal from './TaskNameModal';
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
import { tasksService } from '@/shared/services/tasksService';
import { workflowNodesService } from '@/shared/services/workflowNodesService';

const InnerEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const { nodes: nodeLibrary, loading, error, getNodeIdByType, getNodeCodeByType } = useNodesContext();
  const getId = useRef(createNodeIdGenerator()).current;
  const [taskId, setTaskId] = useState<string | null>(null);
  const [showTaskNameModal, setShowTaskNameModal] = useState(true);

  // Use validation strategy instead of complex if statements
  const validation = useMemo(() => validateNodeWorkflow(nodes), [nodes]);
  const allowedCategories = useMemo(() => validation.allowedCategories, [validation]);

  // Handle task name submission
  const handleTaskNameSave = useCallback(async (taskName: string) => {
    try {
      const response = await tasksService.createTask(taskName);
      setTaskId(response.data.id);
      setShowTaskNameModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, []);

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
    async (nodeId: string, newSettings: NodeData['settings']) => {
      // Find the node before updating to get its current state
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        console.error('Node not found:', nodeId);
        return;
      }

      // Update the node settings in the state
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, settings: newSettings } }
            : n
        )
      );

      // Update selected node if it's the one being updated
      setSelectedNode((prev) =>
        prev?.id === nodeId
          ? { ...prev, data: { ...prev.data, settings: newSettings } }
          : prev
      );

      // Handle API calls for different node types
      if (node.data.nodeType === 'triggerTime') {
        if (!taskId) {
          console.error('Task ID is not available. Please create a task first.');
          return;
        }

        try {
          // Get node_id from context using nodeType
          const triggerNodeId = getNodeIdByType('triggerTime');
          
          if (!triggerNodeId) {
            console.error('Time Trigger node ID not found in API nodes');
            return;
          }

          // Get node code from context using nodeType
          const triggerNodeCode = getNodeCodeByType('triggerTime');
          
          if (!triggerNodeCode) {
            console.error('Time Trigger node code not found in API nodes');
            return;
          }

          // Create workflow node with all required fields
          // For trigger nodes, node_key is "TIME"
          await workflowNodesService.createWorkflowNode(
            triggerNodeId,
            taskId,
            node.position,
            triggerNodeCode, // node_type (from code)
            'TIME', // node_key for trigger nodes
            null, // string_value (leave null for now)
            null, // numeric_value (leave null for now)
            null // timestamp_value (leave null for now)
          );

          console.log('Successfully created workflow node');
        } catch (error) {
          console.error('Error creating workflow node:', error);
          // You might want to show a user-friendly error message here
        }
      } else if (node.data.nodeType === 'videoUpload') {
        if (!taskId) {
          console.error('Task ID is not available. Please create a task first.');
          return;
        }

        // Check if files are uploaded
        const files = (newSettings as { files?: Array<{ key?: string; name?: string; url?: string }> })?.files;
        if (!files || files.length === 0) {
          console.log('No files uploaded yet for video upload node');
          return;
        }

        // Filter only successfully uploaded files with keys
        const filesWithKeys = files.filter((file) => file.key);
        if (filesWithKeys.length === 0) {
          console.log('No files with keys found');
          return;
        }

        try {
          // Get node_id from context using nodeType
          const uploadNodeId = getNodeIdByType('videoUpload');
          
          if (!uploadNodeId) {
            console.error('Video Upload node ID not found in API nodes');
            return;
          }

          // Get node code from context using nodeType
          const uploadNodeCode = getNodeCodeByType('videoUpload');
          
          if (!uploadNodeCode) {
            console.error('Video Upload node code not found in API nodes');
            return;
          }

          // Create attributes object with file keys in upload order
          // Format: {"file": {"1": "<key>", "2": "<key>", ...}}
          const fileKeysObject: Record<string, string> = {};
          filesWithKeys.forEach((file, index) => {
            // Index + 1 because order starts from 1
            const orderNumber = String(index + 1);
            if (file.key) {
              fileKeysObject[orderNumber] = file.key;
            }
          });

          const attributes = { file: fileKeysObject };

          // Create workflow node with all required fields
          // For upload nodes, node_key is "FILE" and attributes contains the file keys object
          await workflowNodesService.createWorkflowNode(
            uploadNodeId,
            taskId,
            node.position,
            uploadNodeCode, // node_type (from code)
            'FILE', // node_key for upload nodes
            null, // string_value (not used for upload nodes)
            null, // numeric_value (leave null for now)
            null, // timestamp_value (leave null for now)
            attributes // attributes with file keys object
          );

          console.log('Successfully created workflow node for video upload');
        } catch (error) {
          console.error('Error creating workflow node for video upload:', error);
          // You might want to show a user-friendly error message here
        }
      }
    },
    [setNodes, nodes, taskId, getNodeIdByType, getNodeCodeByType]
  );

  return (
    <>
      <TaskNameModal 
        isOpen={showTaskNameModal && !taskId}
        onSave={handleTaskNameSave}
      />
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
    </>
  );
}

const WorkflowEditor: React.FC = () => (
  <ReactFlowProvider>
    <InnerEditor />
  </ReactFlowProvider>
);

export default WorkflowEditor;


