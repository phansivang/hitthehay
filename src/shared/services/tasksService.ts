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
}

// Export singleton instance
export const tasksService = new TasksService();

