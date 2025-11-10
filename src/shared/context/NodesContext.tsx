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
  getNodeCodeByType: (nodeType: string) => string | null;
}

const NodesContext = createContext<NodesContextValue | undefined>(undefined);

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
  if (nodesCache.promise && !force) {
    return nodesCache.promise;
  }

  if (!force && nodesCache.sidebarNodes && nodesCache.apiNodes && nodesCache.timestamp) {
    const age = Date.now() - nodesCache.timestamp;
    if (age < CACHE_TTL) {
      return Promise.resolve({
        sidebarNodes: nodesCache.sidebarNodes,
        apiNodes: nodesCache.apiNodes,
      });
    }
  }

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
  const [loading, setLoading] = useState<boolean>(!nodesCache.sidebarNodes);
  const [error, setError] = useState<Error | null>(nodesCache.error ?? null);

  useEffect(() => {
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
    nodesCache.sidebarNodes = null;
    nodesCache.apiNodes = null;
    nodesCache.error = null;
    nodesCache.timestamp = null;
    nodesCache.promise = null;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchNodesData(true);
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

  const getNodeIdByType = useCallback((nodeType: string): string | null => {
    const sidebarNode = nodes.find((n) => n.type === nodeType);
    if (!sidebarNode) {
      return null;
    }

    const apiNode = apiNodes.find((n) => n.name === sidebarNode.label);
    return apiNode?.id ?? null;
  }, [nodes, apiNodes]);

  const getNodeCodeByType = useCallback((nodeType: string): string | null => {
    const sidebarNode = nodes.find((n) => n.type === nodeType);
    if (!sidebarNode) {
      return null;
    }

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
      getNodeCodeByType,
    }),
    [nodes, loading, error, getNodeIdByType, getNodeCodeByType]
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

