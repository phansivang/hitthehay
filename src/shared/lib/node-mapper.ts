/**
 * Node Mapper
 * Maps API nodes to SidebarNodes using TypeScript discriminated unions and const assertions
 */

import React from 'react';
import { Clock, UploadCloud, Cpu, Bot, Youtube, Instagram, Facebook, FileText } from 'lucide-react';
import TiktokIcon from '@/shared/icons/TiktokIcon';
import type { ApiNode, SidebarNode, NodeSettings } from '@/shared/types';
import { NodeCategory } from '@/shared/types';

/**
 * Node type definitions using const assertions for type safety
 */
type NodeType = 
  | 'triggerTime'
  | 'videoUpload'
  | 'aiModelSora2'
  | 'aiModelSora2Pro'
  | 'aiModelVeo3'
  | 'promptConfig'
  | 'platformTikTok'
  | 'platformYouTube'
  | 'platformInstagram'
  | 'platformFacebook';

type NodeName = 
  | 'Time Trigger'
  | 'Upload Video'
  | 'Sora 2'
  | 'Sora 2 Pro'
  | 'Veo 3'
  | 'Prompt Config'
  | 'Post to TikTok'
  | 'Post to YouTube'
  | 'Post to Instagram'
  | 'Post to Facebook';

/**
 * Node configuration using discriminated union pattern
 */
export interface NodeConfiguration {
  readonly name: NodeName;
  readonly type: NodeType;
  readonly category: NodeCategory;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly defaultSettings: NodeSettings;
}

/**
 * Centralized node configuration mapping
 * Uses const assertion for type safety and immutability
 */
const NODE_CONFIGURATIONS: Readonly<Record<NodeName, NodeConfiguration>> = {
  'Time Trigger': {
    name: 'Time Trigger',
    type: 'triggerTime',
    category: NodeCategory.Triggers,
    icon: Clock,
    defaultSettings: { time: '06:00' },
  },
  'Upload Video': {
    name: 'Upload Video',
    type: 'videoUpload',
    category: NodeCategory.VideoSource,
    icon: UploadCloud,
    defaultSettings: { files: [] },
  },
  'Sora 2': {
    name: 'Sora 2',
    type: 'aiModelSora2',
    category: NodeCategory.AIModels,
    icon: Cpu,
    defaultSettings: { model: 'Sora 2', prompt: '' },
  },
  'Sora 2 Pro': {
    name: 'Sora 2 Pro',
    type: 'aiModelSora2Pro',
    category: NodeCategory.AIModels,
    icon: Cpu,
    defaultSettings: { model: 'Sora 2 Pro', prompt: '' },
  },
  'Veo 3': {
    name: 'Veo 3',
    type: 'aiModelVeo3',
    category: NodeCategory.AIModels,
    icon: Bot,
    defaultSettings: { model: 'Veo 3', prompt: '' },
  },
  'Prompt Config': {
    name: 'Prompt Config',
    type: 'promptConfig',
    category: NodeCategory.PromptConfig,
    icon: FileText,
    defaultSettings: { prompt: 'A cinematic shot of...' },
  },
  'Post to TikTok': {
    name: 'Post to TikTok',
    type: 'platformTikTok',
    category: NodeCategory.Platforms,
    icon: TiktokIcon,
    defaultSettings: {},
  },
  'Post to YouTube': {
    name: 'Post to YouTube',
    type: 'platformYouTube',
    category: NodeCategory.Platforms,
    icon: Youtube,
    defaultSettings: { account: '', title: '', description: '' },
  },
  'Post to Instagram': {
    name: 'Post to Instagram',
    type: 'platformInstagram',
    category: NodeCategory.Platforms,
    icon: Instagram,
    defaultSettings: { account: '', caption: '' },
  },
  'Post to Facebook': {
    name: 'Post to Facebook',
    type: 'platformFacebook',
    category: NodeCategory.Platforms,
    icon: Facebook,
    defaultSettings: { account: '', text: '' },
  },
} as const;

/**
 * Type guard to check if node name is valid
 */
const isValidNodeName = (name: string): name is NodeName => {
  return name in NODE_CONFIGURATIONS;
};

/**
 * Type guard to check if node status is ACTIVE
 */
const isActiveNode = (status: string): status is 'ACTIVE' => {
  return status === 'ACTIVE';
};

/**
 * Get node configuration by name
 */
const getNodeConfig = (name: string): NodeConfiguration | null => {
  return isValidNodeName(name) ? NODE_CONFIGURATIONS[name] : null;
};

export const getNodeConfigurationByName = (name: string): NodeConfiguration | null => {
  return getNodeConfig(name);
};

/**
 * Converts an API node to a SidebarNode
 * Uses type guards instead of if statements for better type safety
 */
export const mapApiNodeToSidebarNode = (apiNode: ApiNode): SidebarNode | null => {
  // Type guard: only process ACTIVE nodes
  if (!isActiveNode(apiNode.status)) {
    return null;
  }

  // Type guard: check if node name is valid
  const config = getNodeConfig(apiNode.name);
  if (!config) {
    console.warn(`No mapping found for node: ${apiNode.name}`);
    return null;
  }

  return {
    type: config.type,
    label: config.name,
    description: apiNode.description,
    icon: config.icon,
    category: config.category,
    defaultSettings: config.defaultSettings,
  };
};

/**
 * Converts an array of API nodes to SidebarNodes
 * Preserves the sequence order from the API while grouping by category
 */
export const mapApiNodesToSidebarNodes = (apiNodes:  readonly ApiNode[]): SidebarNode[] => {
  // Map and filter nodes while preserving the original API order
  const mappedNodes = apiNodes
    .map((apiNode, index) => ({
      sidebarNode: mapApiNodeToSidebarNode(apiNode),
      sequence: apiNode.sequence,
      originalIndex: index,
    }))
    .filter(
      (item): item is { sidebarNode: SidebarNode; sequence: number; originalIndex: number } =>
        item.sidebarNode !== null
    );

  // Sort by category first, then by sequence from API
  return mappedNodes
    .sort((a, b) => {
      // Sort by category first
      const categoryComparison = a.sidebarNode.category.localeCompare(b.sidebarNode.category);
      return categoryComparison !== 0 ? categoryComparison : a.sequence - b.sequence;
    })
    .map((item) => item.sidebarNode);
};
