import { apiClient } from '@/shared/lib/api-client';

/**
 * Request body for workflow node creation
 */
export interface CreateWorkflowNodeRequest {
  node_id: string;
  task_id: string;
  position: {
    x: number;
    y: number;
  };
  node_type: string;
  node_key: string | null;
  string_value: string | null;
  numeric_value: number | null;
  timestamp_value: string | null;
  attributes?: Record<string, unknown> | null;
}

/**
 * Response type for workflow node creation
 */
export interface CreateWorkflowNodeResponse {
  data: unknown;
  message: string;
}

/**
 * Service for workflow node operations
 */
export class WorkflowNodesService {
  /**
   * Create a new workflow node
   */
  async createWorkflowNode(
    nodeId: string,
    taskId: string,
    position: { x: number; y: number },
    nodeType: string,
    nodeKey: string | null = null,
    stringValue: string | null = null,
    numericValue: number | null = null,
    timestampValue: string | null = null,
    attributes: Record<string, unknown> | null = null
  ): Promise<CreateWorkflowNodeResponse> {
    const requestBody: CreateWorkflowNodeRequest = {
      node_id: nodeId,
      task_id: taskId,
      position,
      node_type: nodeType,
      node_key: nodeKey,
      string_value: stringValue,
      numeric_value: numericValue,
      timestamp_value: timestampValue,
      ...(attributes && { attributes }),
    };
    return apiClient.post<CreateWorkflowNodeResponse>('client/workflow-nodes', requestBody);
  }
}

// Export singleton instance
export const workflowNodesService = new WorkflowNodesService();

