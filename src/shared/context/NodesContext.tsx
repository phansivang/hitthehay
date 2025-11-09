import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { nodesService } from '@/shared/services/nodesService';
import { mapApiNodesToSidebarNodes } from '@/shared/lib/node-mapper';
import type { SidebarNode, ApiNode } from '@/shared/types';

interface NodesContextValue {
  nodes: SidebarNode[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getNodeIdByType: (nodeType: string) => string | null;
  getNodeIdByName: (nodeName: string) => string | null;
  getNodeCodeByType: (nodeType: string) => string | null;
}

const NodesContext = createContext<NodesContextValue | undefined>(undefined);

// Module-level cache to prevent duplicate API calls across StrictMode mounts
interface NodesCache {
  promise: Promise<{ sidebarNodes: SidebarNode[]; apiNodes: ApiNode[] }> | null;
  sidebarNodes: SidebarNode[] | null;
  apiNodes: ApiNode[] | null;
  error: Error | null;
  timestamp: number | null;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
const nodesCache: NodesCache = {
  promise: null,
  sidebarNodes: null,
  apiNodes: null,
  error: null,
  timestamp: null,
};

const fetchNodesData = async (force = false): Promise<{ sidebarNodes: SidebarNode[]; apiNodes: ApiNode[] }> => {
  // If there's an ongoing request and not forcing, wait for it (prevents duplicate requests)
  if (nodesCache.promise && !force) {
    return nodesCache.promise;
  }

  // If we have fresh cached data and not forcing, return it
  if (!force && nodesCache.sidebarNodes && nodesCache.apiNodes && nodesCache.timestamp) {
    const age = Date.now() - nodesCache.timestamp;
    if (age < CACHE_TTL) {
      return Promise.resolve({
        sidebarNodes: nodesCache.sidebarNodes,
        apiNodes: nodesCache.apiNodes,
      });
    }
  }

  // Create a new fetch promise (this will be shared across all StrictMode mounts)
  nodesCache.promise = (async () => {
    try {
      const response = await nodesService.getNodes();
      const mappedNodes = mapApiNodesToSidebarNodes(response.data);
      nodesCache.sidebarNodes = mappedNodes;
      nodesCache.apiNodes = response.data;
      nodesCache.error = null;
      nodesCache.timestamp = Date.now();
      return {
        sidebarNodes: mappedNodes,
        apiNodes: response.data,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch nodes');
      nodesCache.error = error;
      nodesCache.sidebarNodes = null;
      nodesCache.apiNodes = null;
      nodesCache.timestamp = Date.now();
      console.error('Error fetching nodes:', error);
      throw error;
    } finally {
      nodesCache.promise = null;
    }
  })();

  return nodesCache.promise;
};

export const NodesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<SidebarNode[]>(nodesCache.sidebarNodes ?? []);
  const [apiNodes, setApiNodes] = useState<ApiNode[]>(nodesCache.apiNodes ?? []);
  // Loading is true if we don't have data yet (either no cache or promise in progress)
  const [loading, setLoading] = useState<boolean>(!nodesCache.sidebarNodes);
  const [error, setError] = useState<Error | null>(nodesCache.error ?? null);

  useEffect(() => {
    // If we already have cached data, use it immediately
    if (nodesCache.sidebarNodes && nodesCache.apiNodes && nodesCache.timestamp) {
      const age = Date.now() - nodesCache.timestamp;
      if (age < CACHE_TTL) {
        setNodes(nodesCache.sidebarNodes);
        setApiNodes(nodesCache.apiNodes);
        setLoading(false);
        setError(null);
        return;
      }
    }

    // Fetch data - if another mount already started fetching, this will wait for the same promise
    setLoading(true);
    setError(null);
    fetchNodesData()
      .then((data) => {
        setNodes(data.sidebarNodes);
        setApiNodes(data.apiNodes);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error('Failed to fetch nodes');
        setError(error);
        setNodes([]);
        setApiNodes([]);
        setLoading(false);
      });
  }, []);

  const refetch = async () => {
    // Clear cache to force a fresh fetch
    nodesCache.sidebarNodes = null;
    nodesCache.apiNodes = null;
    nodesCache.error = null;
    nodesCache.timestamp = null;
    nodesCache.promise = null; // Clear any ongoing promise

    setLoading(true);
    setError(null);
    try {
      const data = await fetchNodesData(true); // Force fresh fetch
      setNodes(data.sidebarNodes);
      setApiNodes(data.apiNodes);
      setLoading(false);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch nodes');
      setError(error);
      setNodes([]);
      setApiNodes([]);
      setLoading(false);
    }
  };

  // Create mapping from nodeType to node_id
  const getNodeIdByType = useCallback((nodeType: string): string | null => {
    // Find the SidebarNode by type to get the label (name)
    const sidebarNode = nodes.find((n) => n.type === nodeType);
    if (!sidebarNode) {
      return null;
    }

    // Find the ApiNode by name to get the id
    const apiNode = apiNodes.find((n) => n.name === sidebarNode.label);
    return apiNode?.id ?? null;
  }, [nodes, apiNodes]);

  // Create mapping from nodeName to node_id
  const getNodeIdByName = useCallback((nodeName: string): string | null => {
    const apiNode = apiNodes.find((n) => n.name === nodeName);
    return apiNode?.id ?? null;
  }, [apiNodes]);

  // Create mapping from nodeType to node code
  const getNodeCodeByType = useCallback((nodeType: string): string | null => {
    // Find the SidebarNode by type to get the label (name)
    const sidebarNode = nodes.find((n) => n.type === nodeType);
    if (!sidebarNode) {
      return null;
    }

    // Find the ApiNode by name to get the code
    const apiNode = apiNodes.find((n) => n.name === sidebarNode.label);
    return apiNode?.code ?? null;
  }, [nodes, apiNodes]);

  const value = useMemo<NodesContextValue>(
    () => ({
      nodes,
      loading,
      error,
      refetch,
      getNodeIdByType,
      getNodeIdByName,
      getNodeCodeByType,
    }),
    [nodes, loading, error, getNodeIdByType, getNodeIdByName, getNodeCodeByType]
  );

  return <NodesContext.Provider value={value}>{children}</NodesContext.Provider>;
};

export const useNodesContext = (): NodesContextValue => {
  const ctx = useContext(NodesContext);
  if (!ctx) {
    throw new Error('useNodesContext must be used within NodesProvider');
  }
  return ctx;
};

