import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from 'reactflow';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/features/editor/Sidebar';
import Canvas from '@/features/editor/Canvas';
import { useNodesContext } from '@/shared/context/NodesContext';
import type { NodeData, NodeSettings } from '@/shared/types';
import { NodeCategory } from '@/shared/types';
import {
  validateNodeWorkflow,
  canAddNode,
} from '@/features/editor/strategies/node-validation-strategy';
import {
  addEdgeToEdges,
  createEdge,
  createNodeFromSidebarNode,
  createNodeIdGenerator,
  findSourceNode,
} from '@/features/editor/utils/node-utils';
import {
  tasksService,
  type TaskDetailData,
  type TaskWorkflowNode,
  type TaskWorkflowNodeConfig,
} from '@/shared/services/tasksService';
import { workflowNodesService } from '@/shared/services/workflowNodesService';
import { getNodeConfigurationByName } from '@/shared/lib/node-mapper';

const TaskDetailContent: React.FC = () => {
  const { id: taskIdParam } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const { project } = useReactFlow();
  const getId = useRef(createNodeIdGenerator()).current;
  const {
    nodes: nodeLibrary,
    loading: nodeLibraryLoading,
    error: nodeLibraryError,
    getNodeIdByType,
    getNodeCodeByType,
  } = useNodesContext();

  useEffect(() => {
    if (!taskIdParam) {
      setError('Task ID is missing from the URL.');
      setIsLoading(false);
      return;
    }
    setTaskId(taskIdParam);
    sessionStorage.setItem('current_task_id', taskIdParam);
  }, [taskIdParam]);

  useEffect(() => {
    if (!taskIdParam) {
      return;
    }
    let isMounted = true;
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await tasksService.getTaskDetail(taskIdParam);
        if (!isMounted) {
          return;
        }
        setTask(response.data);
        const mappedNodes = response.data.workflow_nodes.map(mapWorkflowNodeToFlowNode);
        setNodes(mappedNodes);
        setEdges(buildEdgesFromSequence(response.data.workflow_nodes, mappedNodes));
        setSelectedNode(mappedNodes[0] ?? null);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error('Failed to load task detail:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load task detail. Please try again later.'
        );
        setTask(null);
        setNodes([]);
        setEdges([]);
        setSelectedNode(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTask();
    return () => {
      isMounted = false;
    };
  }, [taskIdParam, setEdges, setNodes]);

  const validation = useMemo(() => validateNodeWorkflow(nodes), [nodes]);
  const allowedCategories = useMemo(() => validation.allowedCategories, [validation]);
  const disabledPlatformTypes = useMemo(
    () =>
      nodes
        .filter((node) => node.data.category === NodeCategory.Platforms)
        .map((node) => node.data.nodeType),
    [nodes]
  );

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
        const alreadyHasPlatform = nodes.some((existingNode) => existingNode.data.nodeType === nodeInfo.type);
        if (alreadyHasPlatform) {
          alert('This platform is already connected in this task.');
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
      setSelectedNode(newNode);

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
            ? { ...n, data: { ...n.data, settings: newSettings, hasValidConfig: true } }
            : n
        )
      );

      setSelectedNode((prev) =>
        prev?.id === nodeId ? { ...prev, data: { ...prev.data, settings: newSettings } } : prev
      );

      if (!taskId) {
        console.error('Task ID is not available.');
        return;
      }

      if (node.data.nodeType === 'triggerTime') {
        try {
          const triggerNodeId = getNodeIdByType('triggerTime');
          const triggerNodeCode = getNodeCodeByType('triggerTime');

          if (!triggerNodeId || !triggerNodeCode) {
            console.error('Trigger node metadata missing');
            return;
          }

          await workflowNodesService.createWorkflowNode(
            triggerNodeId,
            taskId,
            node.position,
            triggerNodeCode,
            'TIME',
            (newSettings as { time?: string })?.time ?? null,
            null,
            null
          );
        } catch (err) {
          console.error('Error creating workflow node:', err);
        }
      } else if (node.data.nodeType === 'videoUpload') {
        const files = (newSettings as { files?: Array<{ key?: string }> })?.files;
        if (!files?.length) {
          return;
        }

        try {
          const uploadNodeId = getNodeIdByType('videoUpload');
          const uploadNodeCode = getNodeCodeByType('videoUpload');

          if (!uploadNodeId || !uploadNodeCode) {
            console.error('Upload node metadata missing');
            return;
          }

          const fileKeysObject: Record<string, string> = {};
          files.forEach((file, index) => {
            if (file.key) {
              fileKeysObject[String(index + 1)] = file.key;
            }
          });

          await workflowNodesService.createWorkflowNode(
            uploadNodeId,
            taskId,
            node.position,
            uploadNodeCode,
            'FILE',
            null,
            null,
            null,
            { file: fileKeysObject }
          );
        } catch (err) {
          console.error('Error creating workflow node for video upload:', err);
        }
      }
    },
    [nodes, setNodes, taskId, getNodeIdByType, getNodeCodeByType]
  );

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-gray-600">
        <Loader2 className="h-10 w-10 animate-spin text-[#f65e05]" />
        <p className="mt-4 text-sm">Loading task detail...</p>
      </div>
    );
  }

  if (error || !taskIdParam) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        <h2 className="text-lg font-semibold mb-2">Unable to load task</h2>
        <p>{error ?? 'Unknown error occurred.'}</p>
        <Link to="/tasks" className="mt-4 inline-flex text-[#f65e05] hover:underline">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f5f6fa]">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Task Detail</p>
          <h1 className="text-2xl font-bold text-gray-900">{task?.name ?? 'Untitled task'}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              task?.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {task?.status ?? 'UNKNOWN'}
          </span>
          <Link
            to="/tasks"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to tasks
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          allowedCategories={allowedCategories}
          nodeLibrary={nodeLibrary}
          loading={nodeLibraryLoading}
          error={nodeLibraryError}
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
    </div>
  );
};

const TaskDetail: React.FC = () => (
  <ReactFlowProvider>
    <TaskDetailContent />
  </ReactFlowProvider>
);

export default TaskDetail;

const mapWorkflowNodeToFlowNode = (workflowNode: TaskWorkflowNode): Node<NodeData> => {
  const config = getNodeConfigurationByName(workflowNode.node.name);
  const IconComponent = config?.icon;
  const nodeType = config?.type ?? workflowNode.node.code ?? '';

  return {
    id: workflowNode.id,
    type: 'custom',
    position: {
      x: workflowNode.position?.x ?? 0,
      y: workflowNode.position?.y ?? 0,
    },
    data: {
      label: workflowNode.node.name,
      description: workflowNode.node.description ?? 'No description provided.',
      icon: IconComponent ? <IconComponent /> : null,
      category: config?.category ?? NodeCategory.Triggers,
      nodeType,
      settings: buildNodeSettingsFromConfig(nodeType, workflowNode.node_config),
      hasValidConfig: Boolean(workflowNode.node_config),
      metadata: {
        workflowNodeId: workflowNode.id,
        nodeConfigId: workflowNode.node_config?.id ?? null,
      },
    },
  };
};

const buildEdgesFromSequence = (
  workflowNodes: TaskWorkflowNode[],
  flowNodes: Node<NodeData>[]
): Edge[] => {
  if (!workflowNodes.length) {
    return [];
  }

  const flowNodeMap = new Map(flowNodes.map((node) => [node.id, node]));
  const ordered = [...workflowNodes].sort((a, b) => a.node.sequence - b.node.sequence);

  const edges: Edge[] = [];
  for (let i = 1; i < ordered.length; i += 1) {
    const prev = flowNodeMap.get(ordered[i - 1].id);
    const current = flowNodeMap.get(ordered[i].id);
    if (prev && current) {
      edges.push(createEdge(prev, current));
    }
  }

  return edges;
};

const buildNodeSettingsFromConfig = (
  nodeType: string,
  config: TaskWorkflowNodeConfig | null
): NodeSettings | undefined => {
  if (!config) {
    if (nodeType === 'videoUpload') {
      return { files: [] };
    }
    if (nodeType === 'triggerTime') {
      return { time: '' };
    }
    return undefined;
  }

  if (nodeType === 'triggerTime') {
    return { time: convertHourStringToTimeInput(config.string_value) };
  }

  if (nodeType === 'videoUpload') {
    const files = extractFilesFromAttributes(config);
    return { files };
  }

  return undefined;
};

const convertHourStringToTimeInput = (value: string | null): string => {
  if (!value) {
    return '00:00';
  }
  if (value.includes(':')) {
    return value;
  }
  const hour = Math.max(0, Math.min(23, Number(value)));
  const hourString = Number.isNaN(hour) ? '00' : String(hour).padStart(2, '0');
  return `${hourString}:00`;
};

const extractFilesFromAttributes = (config: TaskWorkflowNodeConfig): Array<{
  name: string;
  key?: string;
  url?: string;
}> => {
  const fileAttributes = (config.attributes as { file?: Record<string, unknown> } | null)?.file;
  if (!fileAttributes) {
    return [];
  }

  return Object.entries(fileAttributes)
    .map(([order, path]) => ({
      order: Number(order),
      name: `File ${order}`,
      key: typeof path === 'string' ? path : String(path),
      url: typeof path === 'string' ? path : undefined,
    }))
    .sort((a, b) => a.order - b.order)
    .map(({ order, ...rest }) => rest);
};