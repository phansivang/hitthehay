/**
 * Node Utilities
 * Utility functions for node and edge creation
 */

import type { ReactNode } from 'react';
import type { Node, Edge } from 'reactflow';
import { addEdge } from 'reactflow';
import type { NodeData } from '@/shared/types';
import { NodeCategory } from '@/shared/types';
import type { SidebarNode } from '@/shared/types';

/**
 * Node ID generator using closure pattern
 */
export const createNodeIdGenerator = () => {
  let counter = 1;
  return () => `dnd-node_${counter++}`;
};

/**
 * Create a new node from sidebar node info
 * Note: Icon element should be created in the React component where this is called
 */
export const createNodeFromSidebarNode = (
  nodeInfo: SidebarNode,
  position: { x: number; y: number },
  getId: () => string,
  iconElement: ReactNode
): Node<NodeData> => {
  return {
    id: getId(),
    type: 'custom',
    position,
    data: {
      label: nodeInfo.label,
      icon: iconElement,
      description: nodeInfo.description,
      category: nodeInfo.category,
      nodeType: nodeInfo.type,
      settings: { ...nodeInfo.defaultSettings },
    },
  };
};

/**
 * Find source node for edge creation
 */
export const findSourceNode = (
  nodes: Node<NodeData>[],
  newNode: Node<NodeData>
): Node<NodeData> | null => {
  if (nodes.length === 0) {
    return null;
  }

  // For platform nodes, find the last non-platform node
  if (newNode.data.category === NodeCategory.Platforms) {
    return [...nodes].reverse().find((n) => n.data.category !== NodeCategory.Platforms) ?? null;
  }

  // Otherwise, use the last node
  return nodes[nodes.length - 1] ?? null;
};

/**
 * Create edge between source and target nodes
 */
export const createEdge = (sourceNode: Node<NodeData>, targetNode: Node<NodeData>): Edge => {
  return {
    id: `e${sourceNode.id}-${targetNode.id}`,
    source: sourceNode.id,
    target: targetNode.id,
    type: 'smoothstep',
    animated: true,
  };
};

/**
 * Add edge to edges array
 */
export const addEdgeToEdges = (edges: Edge[], newEdge: Edge): Edge[] => {
  return addEdge(newEdge, edges);
};

