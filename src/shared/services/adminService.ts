/**
 * Admin Service
 * Handles admin-related API calls
 */

import { apiClient } from '@/shared/lib/api-client';
import type {
  AdminRole,
  AdminUser,
  AnalyticsSummary,
  AuditLogEntry,
  ContentItem,
  ModerationTask,
  WorkflowSummary,
} from '@/shared/types/admin';

/**
 * Admin service for API calls
 */
export const adminService = {
  /**
   * Get analytics summary
   * GET /admin/analytics
   */
  async getAnalytics(): Promise<AnalyticsSummary> {
    return apiClient.get<AnalyticsSummary>('/admin/analytics');
  },

  // Users
  /**
   * List all users
   * GET /admin/users
   */
  async listUsers(): Promise<AdminUser[]> {
    return apiClient.get<AdminUser[]>('/admin/users');
  },

  /**
   * Create a new user
   * POST /admin/users
   */
  async createUser(data: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> {
    return apiClient.post<AdminUser>('/admin/users', data);
  },

  /**
   * Update a user
   * PUT /admin/users/:id
   */
  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    return apiClient.put<AdminUser>(`/admin/users/${id}`, data);
  },

  /**
   * Delete a user
   * DELETE /admin/users/:id
   */
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/users/${id}`);
  },

  // Roles
  /**
   * List all roles
   * GET /admin/roles
   */
  async listRoles(): Promise<AdminRole[]> {
    return apiClient.get<AdminRole[]>('/admin/roles');
  },

  // Workflows
  /**
   * List all workflows
   * GET /admin/workflows
   */
  async listWorkflows(): Promise<WorkflowSummary[]> {
    return apiClient.get<WorkflowSummary[]>('/admin/workflows');
  },

  // Moderation
  /**
   * List moderation tasks
   * GET /admin/moderation/tasks
   */
  async listModerationTasks(): Promise<ModerationTask[]> {
    return apiClient.get<ModerationTask[]>('/admin/moderation/tasks');
  },

  /**
   * Resolve a moderation task
   * PUT /admin/moderation/tasks/:id
   */
  async resolveModerationTask(id: string, status: 'approved' | 'rejected'): Promise<ModerationTask> {
    return apiClient.put<ModerationTask>(`/admin/moderation/tasks/${id}`, { status });
  },

  // Content
  /**
   * List content items
   * GET /admin/content
   */
  async listContent(): Promise<ContentItem[]> {
    return apiClient.get<ContentItem[]>('/admin/content');
  },

  // Audit
  /**
   * List audit logs
   * GET /admin/audit-logs
   */
  async listAuditLogs(): Promise<AuditLogEntry[]> {
    return apiClient.get<AuditLogEntry[]>('/admin/audit-logs');
  },
};

