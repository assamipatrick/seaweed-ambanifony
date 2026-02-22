// hooks/useSupabaseMutation.ts
// Hook for mutations (create, update, delete) with optimistic UI updates

import { useState, useCallback } from 'react';
import { insertRecord, updateRecord, deleteRecord } from '../services/supabaseService';

interface MutationState {
  loading: boolean;
  error: string | null;
}

interface UseMutationResult<T extends object> {
  insert: (record: T) => Promise<T | null>;
  update: (id: string, updates: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useSupabaseMutation<T extends object>(
  tableName: string
): UseMutationResult<T> {
  const [state, setState] = useState<MutationState>({ loading: false, error: null });

  const insert = useCallback(
    async (record: T): Promise<T | null> => {
      setState({ loading: true, error: null });
      try {
        const result = await insertRecord<T>(tableName, record);
        console.log(`[useSupabaseMutation] Inserted into ${tableName}`);
        setState({ loading: false, error: null });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Insert failed';
        console.error(`[useSupabaseMutation] Insert error in ${tableName}:`, message);
        setState({ loading: false, error: message });
        return null;
      }
    },
    [tableName]
  );

  const update = useCallback(
    async (id: string, updates: Partial<T>): Promise<T | null> => {
      setState({ loading: true, error: null });
      try {
        const result = await updateRecord<T>(tableName, id, updates);
        console.log(`[useSupabaseMutation] Updated ${tableName}[${id}]`);
        setState({ loading: false, error: null });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        console.error(`[useSupabaseMutation] Update error in ${tableName}[${id}]:`, message);
        setState({ loading: false, error: message });
        return null;
      }
    },
    [tableName]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setState({ loading: true, error: null });
      try {
        await deleteRecord(tableName, id);
        console.log(`[useSupabaseMutation] Deleted ${tableName}[${id}]`);
        setState({ loading: false, error: null });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        console.error(`[useSupabaseMutation] Delete error in ${tableName}[${id}]:`, message);
        setState({ loading: false, error: message });
        return false;
      }
    },
    [tableName]
  );

  return { insert, update, remove, loading: state.loading, error: state.error };
}
