import type { ReactNode, ComponentType } from 'react';

export interface NodeData {
  label: string;
  icon: ReactNode;
  description: string;
  category: NodeCategory;
  nodeType: string;
  settings?: Record<string, any>;
}

export enum NodeCategory {
  Triggers = 'Triggers',
  VideoSource = 'Video Source',
  AIModels = 'AI Models',
  PromptConfig = 'Prompt Config',
  Platforms = 'Platforms',
}

export interface SidebarNode {
  type: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  category: NodeCategory;
  defaultSettings: Record<string, any>;
}

