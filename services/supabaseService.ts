// services/supabaseService.ts
// CRUD operations and data management for Supabase

import { supabase } from './supabaseClient';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      const attempt = MAX_RETRIES - retries + 1;
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * RETRY_DELAY_MS));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

// Generic fetch with retry
export async function fetchTable<T>(
  tableName: string,
  query?: Record<string, string | number | boolean>
): Promise<T[]> {
  return withRetry(async () => {
    let builder = supabase.from(tableName).select('*');
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        builder = builder.eq(key, value) as typeof builder;
      }
    }
    const { data, error } = await builder;
    if (error) {
      console.error(`[SupabaseService] Error fetching ${tableName}:`, error.message);
      throw error;
    }
    console.log(`[SupabaseService] Fetched ${data?.length ?? 0} records from ${tableName}`);
    return (data ?? []) as T[];
  });
}

// Generic insert with retry
export async function insertRecord<T extends object>(
  tableName: string,
  record: T
): Promise<T> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from(tableName)
      .insert(record)
      .select()
      .single();
    if (error) {
      console.error(`[SupabaseService] Error inserting into ${tableName}:`, error.message);
      throw error;
    }
    console.log(`[SupabaseService] Inserted record into ${tableName}:`, (data as Record<string, unknown>)?.id);
    return data as T;
  });
}

// Generic update with retry
export async function updateRecord<T extends object>(
  tableName: string,
  id: string,
  updates: Partial<T>
): Promise<T> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error(`[SupabaseService] Error updating ${tableName} [${id}]:`, error.message);
      throw error;
    }
    console.log(`[SupabaseService] Updated record in ${tableName}:`, id);
    return data as T;
  });
}

// Generic delete with retry
export async function deleteRecord(
  tableName: string,
  id: string
): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    if (error) {
      console.error(`[SupabaseService] Error deleting from ${tableName} [${id}]:`, error.message);
      throw error;
    }
    console.log(`[SupabaseService] Deleted record from ${tableName}:`, id);
  });
}

// Check connection health
export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('sites').select('id').limit(1);
    if (error) {
      console.warn('[SupabaseService] Connection health check failed:', error.message);
      return false;
    }
    console.log('[SupabaseService] Connection health check passed');
    return true;
  } catch {
    console.warn('[SupabaseService] Connection health check error');
    return false;
  }
}
