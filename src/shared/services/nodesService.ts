import { apiClient } from '@/shared/lib/api-client';
import type { ApiNodesResponse } from '@/shared/types';

/**
 * Service for fetching nodes from the API
 */
export class NodesService {
  /**
   * Fetch all nodes from the API
   */
  async getNodes(): Promise<ApiNodesResponse> {
    return apiClient.get<ApiNodesResponse>('client/nodes');
  }
}

// Export singleton instance
export const nodesService = new NodesService();

