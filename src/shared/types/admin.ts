export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'creator' | 'viewer';
  status: 'active' | 'suspended' | 'invited';
  createdAt: string;
}

export interface AdminRole {
  id: string;
  name: 'admin' | 'moderator' | 'creator' | 'viewer';
  permissions: string[];
  description?: string;
}

export interface WorkflowSummary {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  lastRunAt?: string;
}

export interface ModerationTask {
  id: string;
  contentId: string;
  type: 'video' | 'caption' | 'comment';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook';
  status: 'scheduled' | 'posted' | 'failed';
  scheduledAt?: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeWorkflows: number;
  postsLast7d: number;
  avgProcessingTimeMs: number;
}

