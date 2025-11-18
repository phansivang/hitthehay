import React, { useState, useMemo, useCallback, useRef } from 'react';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import TaskNameModal from './TaskNameModal';
import { ReactFlowProvider, useNodesState, useEdgesState, useReactFlow, Node } from 'reactflow';
import { useNodesContext } from '@/shared/context/NodesContext';
import { NodeCategory, NodeData } from '@/shared/types';
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

  const validation = useMemo(() => validateNodeWorkflow(nodes), [nodes]);
  const allowedCategories = useMemo(() => validation.allowedCategories, [validation]);

  const handleTaskNameSave = useCallback(async (taskName: string) => {
    try {
      const response = await tasksService.createTask(taskName);
      const taskIdValue = response.data.id;
      setTaskId(taskIdValue);
      sessionStorage.setItem('current_task_id', taskIdValue);
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
      
      if (!type || !reactFlowBounds) {
        return;
      }

      const nodeInfo = nodeLibrary.find((n) => n.type === type);
      if (!nodeInfo) {
        return;
      }

      if (nodeInfo.category === NodeCategory.Platforms) {
        const alreadyHasPlatform = nodes.some((node) => node.data.nodeType === nodeInfo.type);
        if (alreadyHasPlatform) {
          alert('This platform is already connected in the workflow.');
          return;
        }
      }

      const validationResult = canAddNode(nodes, nodeInfo.category);
      if (!validationResult.canAdd) {
        alert(validationResult.errorMessage);
        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const IconComponent = nodeInfo.icon;
      const iconElement = <IconComponent />;
      
      const newNode = createNodeFromSidebarNode(nodeInfo, position, getId, iconElement);
      const sourceNode = findSourceNode(nodes, newNode);

      setNodes((nds) => nds.concat(newNode));

      sourceNode && setEdges((eds) => addEdgeToEdges(eds, createEdge(sourceNode, newNode)));
    },
    [project, nodes, setNodes, setEdges, nodeLibrary, getId]
  );

  const updateNodeSettings = useCallback(
    async (nodeId: string, newSettings: NodeData['settings']) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        console.error('Node not found:', nodeId);
        return;
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, settings: newSettings } }
            : n
        )
      );

      setSelectedNode((prev) =>
        prev?.id === nodeId
          ? { ...prev, data: { ...prev.data, settings: newSettings } }
          : prev
      );

      if (node.data.nodeType === 'triggerTime') {
        if (!taskId) {
          console.error('Task ID is not available. Please create a task first.');
          return;
        }

        try {
          const triggerNodeId = getNodeIdByType('triggerTime');
          
          if (!triggerNodeId) {
            console.error('Time Trigger node ID not found in API nodes');
            return;
          }

          const triggerNodeCode = getNodeCodeByType('triggerTime');
          
          if (!triggerNodeCode) {
            console.error('Time Trigger node code not found in API nodes');
            return;
          }

          await workflowNodesService.createWorkflowNode(
            triggerNodeId,
            taskId,
            node.position,
            triggerNodeCode,
            'TIME',
            null,
            null,
            null
          );

          console.log('Successfully created workflow node');
        } catch (error) {
          console.error('Error creating workflow node:', error);
        }
      } else if (node.data.nodeType === 'videoUpload') {
        if (!taskId) {
          console.error('Task ID is not available. Please create a task first.');
          return;
        }

        const files = (newSettings as { files?: Array<{ key?: string; name?: string; url?: string }> })?.files;
        if (!files || files.length === 0) {
          console.log('No files uploaded yet for video upload node');
          return;
        }

        const filesWithKeys = files.filter((file) => file.key);
        if (filesWithKeys.length === 0) {
          console.log('No files with keys found');
          return;
        }

        try {
          const uploadNodeId = getNodeIdByType('videoUpload');
          
          if (!uploadNodeId) {
            console.error('Video Upload node ID not found in API nodes');
            return;
          }

          const uploadNodeCode = getNodeCodeByType('videoUpload');
          
          if (!uploadNodeCode) {
            console.error('Video Upload node code not found in API nodes');
            return;
          }

          const fileKeysObject: Record<string, string> = {};
          filesWithKeys.forEach((file, index) => {
            const orderNumber = String(index + 1);
            if (file.key) {
              fileKeysObject[orderNumber] = file.key;
            }
          });

          const attributes = { file: fileKeysObject };

          await workflowNodesService.createWorkflowNode(
            uploadNodeId,
            taskId,
            node.position,
            uploadNodeCode,
            'FILE',
            null,
            null,
            null,
            attributes
          );

          console.log('Successfully created workflow node for video upload');
        } catch (error) {
          console.error('Error creating workflow node for video upload:', error);
        }
      }
    },
    [setNodes, nodes, taskId, getNodeIdByType, getNodeCodeByType]
  );

  const disabledPlatformTypes = useMemo(
    () =>
      nodes
        .filter((node) => node.data.category === NodeCategory.Platforms)
        .map((node) => node.data.nodeType),
    [nodes]
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
          disabledNodeTypes={disabledPlatformTypes}
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
          taskId={taskId}
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


