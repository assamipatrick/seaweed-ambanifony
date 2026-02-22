// hooks/useSupabaseSync.ts
// Custom hook for real-time Supabase synchronization with auto-cleanup

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { fetchTable } from '../services/supabaseService';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseSyncOptions {
  enabled?: boolean;
}

interface UseSyncResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSupabaseSync<T extends { id: string }>(
  tableName: string,
  options: UseSyncOptions = {}
): UseSyncResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const records = await fetchTable<T>(tableName);
      setData(records);
      console.log(`[useSupabaseSync] Loaded ${records.length} records from ${tableName}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      console.error(`[useSupabaseSync] Failed to fetch ${tableName}:`, message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [tableName, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`realtime:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log(`[useSupabaseSync] Real-time event on ${tableName}:`, payload.eventType);

          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new as T;
            setData((prev) => {
              const existingIds = new Set(prev.map((r) => r.id));
              if (existingIds.has(newRecord.id)) return prev;
              return [...prev, newRecord];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as T;
            setData((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setData((prev) => prev.filter((r) => r.id !== deleted.id));
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useSupabaseSync] Subscription status for ${tableName}:`, status);
      });

    return () => {
      console.log(`[useSupabaseSync] Cleaning up subscription for ${tableName}`);
      supabase.removeChannel(channel);
    };
  }, [tableName, enabled]);

  return { data, loading, error, refetch: fetchData };
}
