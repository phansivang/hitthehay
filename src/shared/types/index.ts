import type { ReactNode, ComponentType } from 'react';

export enum NodeCategory {
  Triggers = 'Triggers',
  VideoSource = 'Video Source',
  AIModels = 'AI Models',
  PromptConfig = 'Prompt Config',
  Platforms = 'Platforms',
}

/**
 * Node settings type - discriminated union for different node types
 */
export type NodeSettings =
  | { time: string } // triggerTime
  | { files: unknown[] } // videoUpload
  | { model: string; prompt: string } // aiModelSora2, aiModelSora2Pro, aiModelVeo3
  | { prompt: string } // promptConfig
  | { account: string; caption: string; hashtags: string } // platformTikTok
  | { account: string; title: string; description: string } // platformYouTube
  | { account: string; caption: string } // platformInstagram
  | { account: string; text: string }; // platformFacebook

export interface NodeData {
  readonly label: string;
  readonly icon: ReactNode;
  readonly description: string;
  readonly category: NodeCategory;
  readonly nodeType: string;
  readonly settings?: NodeSettings;
}

export interface SidebarNode {
  type: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  category: NodeCategory;
  defaultSettings: NodeSettings;
}

/**
 * API Node status type
 */
export type NodeStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED';

// API Response Types
export interface ApiNode {
  id: string;
  name: string;
  description: string;
  status: NodeStatus;
  sequence: number;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface ApiNodesResponse {
  data: ApiNode[];
  message: string;
}

