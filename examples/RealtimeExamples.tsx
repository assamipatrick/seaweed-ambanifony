/**
 * Example Component: Real-Time Modules Dashboard
 * Demonstrates how to use the useRealtime hooks in a React component
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeQuery, useRealtimeSubscription, usePresence } from '../hooks/useRealtime';
import { supabase } from '../services/supabaseClient';

interface Module {
  id: string;
  code: string;
  site_id: string;
  zone_id: string;
  farmer_id: string | null;
  lines: number;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Example 1: Using useRealtimeQuery for automatic data fetching and updates
 */
export function ModulesListExample({ siteId }: { siteId: string }) {
  const { data: modules, loading, error, refetch } = useRealtimeQuery<Module>({
    table: 'modules',
    select: '*',
    filter: { site_id: siteId },
    orderBy: { column: 'code', ascending: true },
    realtime: true // Automatically subscribes to real-time updates
  });

  if (loading) return <div>Loading modules...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Modules (Real-Time)</h2>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {modules.map(module => (
          <li key={module.id}>
            {module.code} - {module.lines} lines
          </li>
        ))}
      </ul>
      <p>Total: {modules.length} modules</p>
    </div>
  );
}

/**
 * Example 2: Using useRealtimeSubscription for custom real-time logic
 */
export function ModuleNotificationsExample({ siteId }: { siteId: string }) {
  const [notifications, setNotifications] = useState<string[]>([]);

  const { status, error } = useRealtimeSubscription<Module>({
    table: 'modules',
    event: '*',
    filter: `site_id=eq.${siteId}`,
    onInsert: (payload) => {
      setNotifications(prev => [
        ...prev,
        `New module created: ${payload.new.code}`
      ]);
    },
    onUpdate: (payload) => {
      setNotifications(prev => [
        ...prev,
        `Module updated: ${payload.new.code}`
      ]);
    },
    onDelete: (payload) => {
      setNotifications(prev => [
        ...prev,
        `Module deleted: ${payload.old.code}`
      ]);
    }
  });

  return (
    <div>
      <h2>Module Notifications</h2>
      <p>Status: {status}</p>
      {error && <p>Error: {error.message}</p>}
      <ul>
        {notifications.slice(-5).reverse().map((notif, idx) => (
          <li key={idx}>{notif}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 3: Using usePresence for online users tracking
 */
export function OnlineUsersExample() {
  const { onlineUsers, updatePresence } = usePresence('operations-dashboard');
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Update presence when component mounts or page changes
    updatePresence({
      status: 'active',
      currentPage: currentPage,
      timestamp: Date.now()
    });
  }, [currentPage, updatePresence]);

  const userCount = Object.keys(onlineUsers).length;

  return (
    <div>
      <h2>Online Users: {userCount}</h2>
      <select value={currentPage} onChange={(e) => setCurrentPage(e.target.value)}>
        <option value="dashboard">Dashboard</option>
        <option value="operations">Operations</option>
        <option value="inventory">Inventory</option>
      </select>
      <ul>
        {Object.entries(onlineUsers).map(([key, presences]) => (
          <li key={key}>
            User {key}: {JSON.stringify(presences)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 4: Manual subscription with custom queries
 */
export function CultivationCyclesExample({ moduleId }: { moduleId: string }) {
  const [cycles, setCycles] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchCycles = async () => {
      const { data, error } = await supabase
        .from('cultivation_cycles')
        .select('*')
        .eq('module_id', moduleId)
        .order('planting_date', { ascending: false });

      if (data) setCycles(data);
    };

    fetchCycles();

    // Real-time subscription
    const channel = supabase
      .channel(`cycles-${moduleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cultivation_cycles',
          filter: `module_id=eq.${moduleId}`
        },
        (payload) => {
          console.log('Cycle change:', payload);
          fetchCycles(); // Re-fetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [moduleId]);

  return (
    <div>
      <h2>Cultivation Cycles</h2>
      <ul>
        {cycles.map(cycle => (
          <li key={cycle.id}>
            {cycle.planting_date} - Status: {cycle.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 5: Stock movements with real-time updates
 */
export function StockMovementsExample({ siteId }: { siteId: string }) {
  const [movements, setMovements] = useState<any[]>([]);
  const [stockLevel, setStockLevel] = useState({ kg: 0, bags: 0 });

  // Fetch initial data and calculate stock
  useEffect(() => {
    const fetchData = async () => {
      // Get movements
      const { data: movementData } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('site_id', siteId)
        .order('date', { ascending: false })
        .limit(10);

      if (movementData) setMovements(movementData);

      // Calculate stock level using database function
      const { data: stockData } = await supabase
        .rpc('calculate_site_stock', {
          p_site_id: siteId,
          p_seaweed_type_id: 'your-seaweed-type-id' // Replace with actual ID
        });

      if (stockData && stockData.length > 0) {
        setStockLevel({
          kg: stockData[0].total_kg,
          bags: stockData[0].total_bags
        });
      }
    };

    fetchData();
  }, [siteId]);

  // Subscribe to real-time updates
  useRealtimeSubscription({
    table: 'stock_movements',
    filter: `site_id=eq.${siteId}`,
    onChange: () => {
      // Re-fetch data when stock changes
      // In production, you'd optimize this to update state directly
      window.location.reload(); // Simple refresh for demo
    }
  });

  return (
    <div>
      <h2>Stock Movements (Real-Time)</h2>
      <div>
        <strong>Current Stock:</strong> {stockLevel.kg} kg ({stockLevel.bags} bags)
      </div>
      <ul>
        {movements.map(movement => (
          <li key={movement.id}>
            {movement.date}: {movement.type} - 
            {movement.in_kg && `+${movement.in_kg} kg`}
            {movement.out_kg && `-${movement.out_kg} kg`}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 6: Incidents with real-time alerts
 */
export function IncidentsAlertExample() {
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);

  useRealtimeSubscription({
    table: 'incidents',
    event: 'INSERT',
    onInsert: (payload) => {
      const incident = payload.new;
      
      // Show alert for critical incidents
      if (incident.severity === 'CRITICAL') {
        alert(`CRITICAL INCIDENT: ${incident.description}`);
      }

      // Add to recent incidents
      setRecentIncidents(prev => [incident, ...prev].slice(0, 5));

      // Could also trigger a notification system, sound, etc.
    }
  });

  return (
    <div>
      <h2>Recent Incidents (Real-Time Alerts)</h2>
      {recentIncidents.length === 0 ? (
        <p>No recent incidents</p>
      ) : (
        <ul>
          {recentIncidents.map(incident => (
            <li key={incident.id} className={incident.severity === 'CRITICAL' ? 'critical' : ''}>
              <strong>{incident.severity}</strong>: {incident.description}
              <br />
              <small>{new Date(incident.date).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Example 7: Complete dashboard with multiple real-time features
 */
export function RealtimeDashboard({ siteId, userId }: { siteId: string; userId: string }) {
  // Track online users
  const { onlineUsers, updatePresence } = usePresence('main-dashboard');

  // Subscribe to modules
  const { data: modules } = useRealtimeQuery({
    table: 'modules',
    filter: { site_id: siteId },
    realtime: true
  });

  // Subscribe to active cycles
  const { data: activeCycles } = useRealtimeQuery({
    table: 'cultivation_cycles',
    filter: { status: 'PLANTED' },
    realtime: true
  });

  // Subscribe to open incidents
  const { data: incidents } = useRealtimeQuery({
    table: 'incidents',
    filter: { status: 'OPEN' },
    realtime: true
  });

  useEffect(() => {
    // Update presence every minute
    const interval = setInterval(() => {
      updatePresence({
        user_id: userId,
        page: 'dashboard',
        last_activity: new Date().toISOString()
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [userId, updatePresence]);

  return (
    <div className="realtime-dashboard">
      <header>
        <h1>Real-Time Dashboard</h1>
        <div>Online Users: {Object.keys(onlineUsers).length}</div>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Modules</h3>
          <p className="stat">{modules?.length || 0}</p>
        </div>

        <div className="dashboard-card">
          <h3>Active Cycles</h3>
          <p className="stat">{activeCycles?.length || 0}</p>
        </div>

        <div className="dashboard-card">
          <h3>Open Incidents</h3>
          <p className="stat">{incidents?.length || 0}</p>
        </div>
      </div>

      <div className="live-indicator">
        <span className="pulse"></span> Live Updates Active
      </div>
    </div>
  );
}

// Export all examples
export default {
  ModulesListExample,
  ModuleNotificationsExample,
  OnlineUsersExample,
  CultivationCyclesExample,
  StockMovementsExample,
  IncidentsAlertExample,
  RealtimeDashboard
};
