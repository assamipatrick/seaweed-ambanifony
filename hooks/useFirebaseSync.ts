import { useEffect } from 'react';
import { subscribeToCollection } from '../lib/firebaseService';

/**
 * Hook to sync ALL collections with Firebase Realtime Database
 * Provides real-time synchronization for all 26 entities
 */

interface CollectionConfig<T> {
  collectionName: string;
  data: T[];
  setData: (data: T[]) => void;
}

interface UseFirebaseSyncProps {
  collections: CollectionConfig<any>[];
}

/**
 * Generic hook that syncs multiple collections with Firebase
 * Usage:
 * ```
 * useFirebaseSync({
 *   collections: [
 *     { collectionName: 'sites', data: sites, setData: setSites },
 *     { collectionName: 'employees', data: employees, setData: setEmployees },
 *     ...
 *   ]
 * });
 * ```
 */
export function useFirebaseSync({ collections }: UseFirebaseSyncProps) {
  
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    
    // Subscribe to all collections
    collections.forEach(({ collectionName, setData }) => {
      console.log(`[Firebase] Setting up real-time subscription for ${collectionName}...`);
      
      const unsubscribe = subscribeToCollection<any>(collectionName, (data) => {
        console.log(`[Firebase] Received ${data.length} ${collectionName} from Firebase`);
        if (data.length > 0) {
          setData(data);
        } else {
          console.log(`[Firebase] No ${collectionName} in Firebase, keeping local data`);
        }
      });
      
      unsubscribers.push(unsubscribe);
    });
    
    // Cleanup all subscriptions on unmount
    return () => {
      console.log(`[Firebase] Cleaning up ${collections.length} subscriptions`);
      unsubscribers.forEach(unsub => unsub());
    };
  }, []); // Empty dependency array - setup once on mount
  
  // Return status
  return {
    isConnected: true,
    isLoading: false,
    collectionsCount: collections.length
  };
}
