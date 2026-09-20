import { useState, useEffect, useRef, useCallback } from 'react';
import { liveApi } from '../services/api';

export function useLiveState(eventId) {
  const [liveState, setLiveState] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // streaming | polling | disconnected
  const [lastUpdate, setLastUpdate] = useState(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0); // client ms - server ms

  const eventSourceRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const fetchSnapshot = useCallback(async () => {
    if (!eventId) return;
    try {
      const data = await liveApi.getLiveState(eventId);
      if (data && data.server_time) {
        const serverMs = new Date(data.server_time).getTime();
        setServerTimeOffset(Date.now() - serverMs);
      }
      setLiveState(data);
    } catch (err) {
      console.warn('[useLiveState] Polling fetch error:', err.message);
    }
  }, [eventId]);

  const startPollingFallback = useCallback(() => {
    if (pollIntervalRef.current) return;
    setConnectionStatus('polling');
    fetchSnapshot();
    pollIntervalRef.current = setInterval(fetchSnapshot, 4000);
  }, [fetchSnapshot]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!eventId) return;

    let isSubscribed = true;

    // Fetch initial snapshot immediately
    fetchSnapshot();

    // Setup SSE connection
    try {
      const streamUrl = `/api/events/${eventId}/stream`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!isSubscribed) return;
        setConnectionStatus('streaming');
        stopPolling();
      };

      es.addEventListener('live_state', (e) => {
        if (!isSubscribed) return;
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.server_time) {
            setServerTimeOffset(Date.now() - new Date(parsed.server_time).getTime());
          }
          setLiveState(parsed);
          setConnectionStatus('streaming');
        } catch (err) {
          console.error('[SSE] Error parsing live_state:', err);
        }
      });

      es.addEventListener('update', (e) => {
        if (!isSubscribed) return;
        try {
          const parsed = JSON.parse(e.data);
          setLastUpdate(parsed);
        } catch (err) {
          console.error('[SSE] Error parsing update event:', err);
        }
      });

      es.onerror = () => {
        if (!isSubscribed) return;
        // Switch to polling if SSE has an issue
        startPollingFallback();
      };
    } catch (err) {
      console.warn('[SSE] EventSource init failed, using polling:', err);
      startPollingFallback();
    }

    return () => {
      isSubscribed = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      stopPolling();
    };
  }, [eventId, fetchSnapshot, startPollingFallback, stopPolling]);

  return {
    liveState,
    connectionStatus,
    lastUpdate,
    serverTimeOffset,
    refresh: fetchSnapshot
  };
}
