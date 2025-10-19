import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Minimal test component to verify Supabase connection works
 * 
 * Usage:
 * 1. Temporarily replace AccountPage import in your router with this component
 * 2. Navigate to the page
 * 3. Check browser console for test results
 * 4. If this works, the issue is in AccountPage logic, not Supabase setup
 */
export default function SupabaseTestPage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[SupabaseTest] Starting tests...');
    
    const runTests = async () => {
      try {
        // Test 1: Check if supabase client exists
        if (!supabase) {
          throw new Error('Supabase client is null');
        }
        console.log('[SupabaseTest] ✅ Supabase client exists');
        setStatus('Supabase client OK');

        // Test 2: Try to fetch from events table
        console.log('[SupabaseTest] Attempting to fetch events...');
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .limit(5);

        if (error) {
          console.error('[SupabaseTest] ❌ Fetch error:', error);
          throw new Error(`Fetch failed: ${error.message}`);
        }

        console.log('[SupabaseTest] ✅ Fetch successful, got', data?.length || 0, 'events');
        setEvents(data || []);
        setStatus(`Fetched ${data?.length || 0} events`);

        // Test 3: Set up realtime subscription
        console.log('[SupabaseTest] Setting up realtime subscription...');
        const channel = supabase
          .channel('test-channel')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'events' },
            (payload) => {
              console.log('[SupabaseTest] 🎉 Realtime event received:', payload);
              setEvents(prev => [payload.new, ...prev]);
            }
          )
          .subscribe((status) => {
            console.log('[SupabaseTest] Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setStatus('✅ All tests passed! Realtime active.');
            }
          });

        return () => {
          console.log('[SupabaseTest] Cleaning up...');
          supabase.removeChannel(channel);
        };
      } catch (err: any) {
        console.error('[SupabaseTest] ❌ Test failed:', err);
        setError(err.message);
        setStatus('❌ Test failed - check console');
      }
    };

    runTests();
  }, []);

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'monospace',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#4CAF50', marginBottom: '1rem' }}>
        🧪 Supabase Connection Test
      </h1>
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2>Status: {status}</h2>
        {error && (
          <div style={{ 
            color: '#ff5555', 
            padding: '1rem', 
            backgroundColor: '#3a1a1a',
            borderRadius: '4px',
            marginTop: '1rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#2a2a2a',
        borderRadius: '8px'
      }}>
        <h3>Events ({events.length}):</h3>
        {events.length === 0 ? (
          <p style={{ color: '#888' }}>No events yet. Try inserting one in Supabase SQL editor.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {events.map((event, i) => (
              <div key={i} style={{ 
                padding: '0.5rem', 
                marginBottom: '0.5rem',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                <div><strong>ID:</strong> {event.id}</div>
                <div><strong>Camera:</strong> {event.camera_id}</div>
                <div><strong>Score:</strong> {event.combined_score}</div>
                <div><strong>Severity:</strong> {event.severity}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h3>Next Steps:</h3>
        <ul>
          <li>✅ If you see "All tests passed!" - Supabase works! Issue is in AccountPage.</li>
          <li>❌ If you see an error - Check the error message above</li>
          <li>📝 Check browser console for detailed logs with [SupabaseTest] prefix</li>
          <li>🧪 Try inserting a test event (see QUICK_REF.md)</li>
        </ul>
      </div>
    </div>
  );
}
