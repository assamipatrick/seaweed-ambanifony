import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 
  | 'sites' 
  | 'employees' 
  | 'farmers' 
  | 'service_providers' 
  | 'credit_types'
  | 'seaweed_types'
  | 'modules'
  | 'cultivation_cycles'
  | 'farmer_credits'
  | 'repayments'
  | 'monthly_payments'
  | 'stock_movements'
  | 'pressing_slips'
  | 'pressed_stock_movements'
  | 'export_documents'
  | 'site_transfers'
  | 'cutting_operations'
  | 'farmer_deliveries'
  | 'incidents'
  | 'incident_types'
  | 'incident_severities'
  | 'roles'
  | 'periodic_tests'
  | 'pest_observations'
  | 'users'
  | 'invitations'
  | 'message_logs'
  | 'gallery_photos';

interface SupabaseSyncOptions<T> {
  table: TableName;
  localData: T[];
  setLocalData: (data: T[]) => void;
  enabled?: boolean;
}

/**
 * Hook to sync local state with Supabase and listen to real-time changes
 */
export function useSupabaseSync<T extends { id: string }>({
  table,
  localData,
  setLocalData,
  enabled = true,
}: SupabaseSyncOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const initialLoadDone = useRef(false);

  // Load initial data from Supabase
  const loadInitialData = useCallback(async () => {
    if (!enabled || initialLoadDone.current) return;

    try {
      console.log(`[${table}] Loading initial data from Supabase...`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.error(`[${table}] Error loading data:`, error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`[${table}] Loaded ${data.length} records from Supabase`);
        setLocalData(data as T[]);
      } else {
        console.log(`[${table}] No data in Supabase, keeping local data`);
      }
      
      initialLoadDone.current = true;
    } catch (error) {
      console.error(`[${table}] Exception loading data:`, error);
    }
  }, [table, enabled, setLocalData]);

  // Setup real-time subscription
  useEffect(() => {
    if (!enabled) return;

    // Load initial data
    loadInitialData();

    // Setup real-time subscription
    console.log(`[${table}] Setting up real-time subscription...`);
    
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`[${table}] Real-time change:`, payload);

          switch (payload.eventType) {
            case 'INSERT':
              setLocalData((prev) => {
                const exists = prev.some((item) => item.id === payload.new.id);
                if (exists) return prev;
                return [...prev, payload.new as T];
              });
              break;

            case 'UPDATE':
              setLocalData((prev) =>
                prev.map((item) =>
                  item.id === payload.new.id ? (payload.new as T) : item
                )
              );
              break;

            case 'DELETE':
              setLocalData((prev) =>
                prev.filter((item) => item.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log(`[${table}] Subscription status:`, status);
      });

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      console.log(`[${table}] Cleaning up real-time subscription...`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, enabled, loadInitialData, setLocalData]);

  // Function to sync local changes to Supabase
  const syncToSupabase = useCallback(
    async (operation: 'insert' | 'update' | 'delete', data: Partial<T> | string) => {
      if (!enabled) return { success: true };

      try {
        switch (operation) {
          case 'insert':
            const { error: insertError } = await supabase
              .from(table)
              .insert([data as T]);
            if (insertError) throw insertError;
            break;

          case 'update':
            const updateData = data as T;
            const { error: updateError } = await supabase
              .from(table)
              .update(updateData)
              .eq('id', updateData.id);
            if (updateError) throw updateError;
            break;

          case 'delete':
            const id = data as string;
            const { error: deleteError } = await supabase
              .from(table)
              .delete()
              .eq('id', id);
            if (deleteError) throw deleteError;
            break;
        }

        console.log(`[${table}] Sync ${operation} successful`);
        return { success: true };
      } catch (error) {
        console.error(`[${table}] Sync ${operation} failed:`, error);
        return { success: false, error };
      }
    },
    [table, enabled]
  );

  return { syncToSupabase, initialLoadDone: initialLoadDone.current };
}
