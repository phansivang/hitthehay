import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { nodesService } from '@/shared/services/nodesService';
import { mapApiNodesToSidebarNodes } from '@/shared/lib/node-mapper';
import type { SidebarNode } from '@/shared/types';

interface NodesContextValue {
  nodes: SidebarNode[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const NodesContext = createContext<NodesContextValue | undefined>(undefined);

// Module-level cache to prevent duplicate API calls across StrictMode mounts
interface NodesCache {
  promise: Promise<SidebarNode[]> | null;
  data: SidebarNode[] | null;
  error: Error | null;
  timestamp: number | null;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
const nodesCache: NodesCache = {
  promise: null,
  data: null,
  error: null,
  timestamp: null,
};

const fetchNodesData = async (force = false): Promise<SidebarNode[]> => {
  // If there's an ongoing request and not forcing, wait for it (prevents duplicate requests)
  if (nodesCache.promise && !force) {
    return nodesCache.promise;
  }

  // If we have fresh cached data and not forcing, return it
  if (!force && nodesCache.data && nodesCache.timestamp) {
    const age = Date.now() - nodesCache.timestamp;
    if (age < CACHE_TTL) {
      return Promise.resolve(nodesCache.data);
    }
  }

  // Create a new fetch promise (this will be shared across all StrictMode mounts)
  nodesCache.promise = (async () => {
    try {
      const response = await nodesService.getNodes();
      const mappedNodes = mapApiNodesToSidebarNodes(response.data);
      nodesCache.data = mappedNodes;
      nodesCache.error = null;
      nodesCache.timestamp = Date.now();
      return mappedNodes;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch nodes');
      nodesCache.error = error;
      nodesCache.data = null;
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
  const [nodes, setNodes] = useState<SidebarNode[]>(nodesCache.data ?? []);
  // Loading is true if we don't have data yet (either no cache or promise in progress)
  const [loading, setLoading] = useState<boolean>(!nodesCache.data);
  const [error, setError] = useState<Error | null>(nodesCache.error ?? null);

  useEffect(() => {
    // If we already have cached data, use it immediately
    if (nodesCache.data && nodesCache.timestamp) {
      const age = Date.now() - nodesCache.timestamp;
      if (age < CACHE_TTL) {
        setNodes(nodesCache.data);
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
        setNodes(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error('Failed to fetch nodes');
        setError(error);
        setNodes([]);
        setLoading(false);
      });
  }, []);

  const refetch = async () => {
    // Clear cache to force a fresh fetch
    nodesCache.data = null;
    nodesCache.error = null;
    nodesCache.timestamp = null;
    nodesCache.promise = null; // Clear any ongoing promise

    setLoading(true);
    setError(null);
    try {
      const data = await fetchNodesData(true); // Force fresh fetch
      setNodes(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch nodes');
      setError(error);
      setNodes([]);
      setLoading(false);
    }
  };

  const value = useMemo<NodesContextValue>(
    () => ({
      nodes,
      loading,
      error,
      refetch,
    }),
    [nodes, loading, error]
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

