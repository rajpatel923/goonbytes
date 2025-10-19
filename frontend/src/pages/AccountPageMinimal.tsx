import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Minimal AccountPage for debugging - strips everything down to basics
 * Use this to isolate where the white screen is coming from
 */
export default function AccountPageMinimal() {
  const [testState, setTestState] = useState("Initial");
  const { user, loading } = useAuth();

  console.log('[AccountPageMinimal] Rendering...', { user: !!user, loading });

  useEffect(() => {
    console.log('[AccountPageMinimal] Mount effect running');
    setTestState("Mounted");
    return () => {
      console.log('[AccountPageMinimal] Cleanup running');
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'white', backgroundColor: '#000', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white', backgroundColor: '#000', minHeight: '100vh' }}>
      <h1 style={{ color: '#4CAF50' }}>✅ AccountPage Minimal Test</h1>
      <p>If you see this, React is rendering fine!</p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#222', borderRadius: '8px' }}>
        <h2>Debug Info:</h2>
        <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Test State:</strong> {testState}</p>
      </div>
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
        <p>Check console for [AccountPageMinimal] logs</p>
        <p>If this works, the issue is in the full AccountPage component</p>
      </div>
    </div>
  );
}
