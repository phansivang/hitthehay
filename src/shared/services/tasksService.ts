import { apiClient } from '@/shared/lib/api-client';

/**
 * Response type for task creation
 */
export interface CreateTaskResponse {
  data: {
    id: string;
  };
  message: string;
}

/**
 * Request body for task creation
 */
export interface CreateTaskRequest {
  name: string;
}

/**
 * Task data from API
 */
export interface Task {
  id: string;
  name: string;
  schedule: string;
  status: string;
  created_at: string;
}

/**
 * Workflow node configuration returned as part of task detail response
 */
export interface TaskWorkflowNodeConfig {
  id: string;
  workflow_node_id: string;
  node_type: string;
  node_key: string;
  string_value: string | null;
  numeric_value: number | null;
  timestamp_value: string | null;
  attributes: Record<string, unknown> | null;
}

export interface TaskWorkflowNodePosition {
  x: number;
  y: number;
}

export interface TaskWorkflowNode {
  id: string;
  node_id: string;
  task_id: string;
  position: TaskWorkflowNodePosition;
  node: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    status: string;
    sequence: number;
    attribute: unknown;
    created_at: string;
    updated_at: string;
  };
  node_config: TaskWorkflowNodeConfig | null;
}

export interface TaskDetailData {
  id: string;
  user_id: string;
  name: string;
  status: string;
  created_at: string;
  workflow_nodes: TaskWorkflowNode[];
}

export interface TaskDetailResponse {
  data: TaskDetailData;
  message: string;
}

/**
 * Response type for fetching tasks list
 */
export interface GetTasksResponse {
  data: Task[];
  message: string;
}

/**
 * Service for task operations
 */
export class TasksService {
  /**
   * Create a new task
   */
  async createTask(name: string): Promise<CreateTaskResponse> {
    const requestBody: CreateTaskRequest = { name };
    return apiClient.post<CreateTaskResponse>('client/tasks', requestBody);
  }

  /**
   * Get all tasks
   */
  async getTasks(): Promise<GetTasksResponse> {
    return apiClient.get<GetTasksResponse>('client/tasks');
  }

  /**
   * Get a single task detail including workflow nodes
   */
  async getTaskDetail(taskId: string): Promise<TaskDetailResponse> {
    return apiClient.get<TaskDetailResponse>(`client/tasks/${taskId}`);
  }
}

// Export singleton instance
export const tasksService = new TasksService();

