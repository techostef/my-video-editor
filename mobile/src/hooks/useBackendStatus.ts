import { useEffect, useRef, useState } from 'react';
import { checkHealth } from '../api/client';

type Status = 'checking' | 'connected' | 'disconnected';

const POLL_INTERVAL_MS = 10_000;

export function useBackendStatus(): Status {
  const [status, setStatus] = useState<Status>('checking');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ping = async () => {
    const ok = await checkHealth();
    setStatus(ok ? 'connected' : 'disconnected');
  };

  useEffect(() => {
    ping();
    intervalRef.current = setInterval(ping, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return status;
}
