/**
 * Custom React Hook for Real-Time Supabase Subscriptions
 * Provides easy-to-use real-time functionality for the SeaFarm application
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Types for better TypeScript support
export type SupabaseTable = 
  | 'modules'
  | 'cultivation_cycles'
  | 'stock_movements'
  | 'farmer_deliveries'
  | 'site_transfers'
  | 'incidents'
  | 'farmers'
  | 'employees'
  | 'service_providers'
  | 'periodic_tests'
  | 'pest_observations'
  | 'farmer_credits'
  | 'repayments'
  | 'monthly_payments'
  | 'gallery_photos'
  | 'message_logs'
  | 'sites'
  | 'zones'
  | 'seaweed_types'
  | 'credit_types'
  | 'roles';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface UseRealtimeOptions<T = any> {
  table: SupabaseTable;
  event?: RealtimeEvent;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/**
 * Hook for subscribing to real-time changes on a Supabase table
 * 
 * @example
 * ```tsx
 * const { status, error } = useRealtimeSubscription({
 *   table: 'modules',
 *   event: '*',
 *   filter: `site_id=eq.${siteId}`,
 *   onChange: (payload) => {
 *     console.log('Change detected:', payload);
 *     // Update local state
 *   }
 * });
 * ```
 */
export function useRealtimeSubscription<T = any>(options: UseRealtimeOptions<T>) {
  const { table, event = '*', filter, onInsert, onUpdate, onDelete, onChange } = options;
  
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create a unique channel name
    const channelName = `${table}-${filter || 'all'}-${Date.now()}`;
    
    // Create channel
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Set up postgres changes listener
    channel.on(
      'postgres_changes',
      {
        event: event,
        schema: 'public',
        table: table,
        filter: filter
      },
      (payload: RealtimePostgresChangesPayload<T>) => {
        // Call specific handlers
        if (payload.eventType === 'INSERT' && onInsert) {
          onInsert(payload);
        } else if (payload.eventType === 'UPDATE' && onUpdate) {
          onUpdate(payload);
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload);
        }
        
        // Call general change handler
        if (onChange) {
          onChange(payload);
        }
      }
    );

    // Subscribe and handle status
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setStatus('connected');
        setError(null);
      } else if (status === 'CHANNEL_ERROR') {
        setStatus('error');
        setError(new Error('Channel subscription error'));
      } else if (status === 'TIMED_OUT') {
        setStatus('error');
        setError(new Error('Connection timed out'));
      } else if (status === 'CLOSED') {
        setStatus('disconnected');
      }
    });

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, filter, onInsert, onUpdate, onDelete, onChange]);

  return { status, error };
}

/**
 * Hook for managing user presence in real-time
 * 
 * @example
 * ```tsx
 * const { onlineUsers, updatePresence } = usePresence('dashboard');
 * 
 * // Update presence
 * updatePresence({ status: 'active', currentPage: 'operations' });
 * ```
 */
export function usePresence(channelName: string = 'online-users') {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Subscribe to presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelName]);

  const updatePresence = useCallback((presenceData: any) => {
    if (channelRef.current) {
      channelRef.current.track({
        ...presenceData,
        online_at: new Date().toISOString(),
      });
    }
  }, []);

  return { onlineUsers, updatePresence };
}

/**
 * Hook for broadcasting messages to other clients
 * 
 * @example
 * ```tsx
 * const { broadcast, messages } = useBroadcast('notifications');
 * 
 * // Send a broadcast message
 * broadcast({ type: 'alert', message: 'New incident reported' });
 * ```
 */
export function useBroadcast<T = any>(channelName: string) {
  const [messages, setMessages] = useState<T[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'message' }, (payload) => {
        setMessages(prev => [...prev, payload.payload as T]);
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelName]);

  const broadcast = useCallback((message: T) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      });
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { broadcast, messages, clearMessages };
}

/**
 * Hook for real-time data fetching with automatic updates
 * Combines initial data fetch with real-time subscriptions
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useRealtimeQuery({
 *   table: 'modules',
 *   select: '*',
 *   filter: { site_id: currentSiteId },
 *   realtime: true
 * });
 * ```
 */
export interface UseRealtimeQueryOptions {
  table: SupabaseTable;
  select?: string;
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  realtime?: boolean;
}

export function useRealtimeQuery<T = any>(options: UseRealtimeQueryOptions) {
  const { table, select = '*', filter = {}, orderBy, limit, realtime = true } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select(select);

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(fetchedData as T[]);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [table, select, JSON.stringify(filter), orderBy, limit]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useRealtimeSubscription<T>({
    table,
    event: '*',
    onChange: () => {
      // Refetch data when changes occur
      fetchData();
    }
  });

  return { data, loading, error, refetch: fetchData };
}

export default {
  useRealtimeSubscription,
  usePresence,
  useBroadcast,
  useRealtimeQuery
};
