import React, { useCallback, useEffect, useMemo, useState } from 'react';

function App() {
  const apiBase = useMemo(() => {
    const raw = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
    const trimmed = raw.replace(/\/+$/, '');

    if (trimmed.endsWith('/api')) {
      return `${trimmed}/v1`;
    }

    return trimmed;
  }, []);

  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastChecked, setLastChecked] = useState('');

  const checkBackend = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBase}/health`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Health check failed');
      }

      setHealth(data);
      setLastChecked(new Date().toLocaleString());
    } catch (checkError) {
      setError(checkError.message || 'Could not connect to backend');
      setHealth(null);
      setLastChecked(new Date().toLocaleString());
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    checkBackend();
    const timer = setInterval(checkBackend, 30000);
    return () => clearInterval(timer);
  }, [checkBackend]);

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', margin: 24, lineHeight: 1.5 }}>
      <h1 style={{ marginBottom: 8 }}>University System Frontend</h1>
      <p style={{ marginTop: 0, color: '#555' }}>
        Frontend is running. Backend health check is enabled and refreshes every 30 seconds.
      </p>

      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, maxWidth: 720 }}>
        <p><strong>API Base:</strong> {apiBase}</p>
        <p><strong>Last Check:</strong> {lastChecked || 'Not checked yet'}</p>
        <p><strong>Status:</strong> {loading ? 'Checking...' : health ? 'Connected' : 'Disconnected'}</p>

        {health && (
          <div>
            <p><strong>Message:</strong> {health.message}</p>
            <p><strong>Environment:</strong> {health.environment || 'n/a'}</p>
            <p><strong>Database:</strong> {health.services?.database || 'unknown'}</p>
          </div>
        )}

        {error && <p style={{ color: '#b00020' }}><strong>Error:</strong> {error}</p>}

        <button
          type="button"
          onClick={checkBackend}
          disabled={loading}
          style={{ padding: '8px 12px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Checking...' : 'Check Now'}
        </button>
      </section>
    </main>
  );
}

export default App;
