/**
 * useWebsocketMock Hook
 * 
 * Mock websocket hook for local development. Simulates leaderboard updates
 * when enabled. Can be replaced with real websocket connection.
 * 
 * @param {boolean} enabled - Whether to start the mock websocket
 * @param {Function} onMessage - Callback when a message is received
 * @param {Array} initialData - Initial leaderboard data
 * @returns {Object} { connected, send, disconnect }
 */
import { useEffect, useRef, useState } from 'react';

export function useWebsocketMock(enabled = false, onMessage, initialData = []) {
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef(null);
  const dataRef = useRef(initialData);

  useEffect(() => {
    dataRef.current = initialData;
  }, [initialData]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setConnected(false);
      return;
    }

    // Simulate connection
    setConnected(true);

    // Send initial data
    if (onMessage && dataRef.current.length > 0) {
      setTimeout(() => {
        onMessage({
          type: 'leaderboard',
          data: dataRef.current,
        });
      }, 100);
    }

    // Simulate periodic updates
    intervalRef.current = setInterval(() => {
      if (!onMessage) return;

      // Shuffle positions slightly
      const shuffled = shuffleLeaderboard(dataRef.current);
      dataRef.current = shuffled;

      onMessage({
        type: 'leaderboard',
        data: shuffled,
      });
    }, 1500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setConnected(false);
    };
  }, [enabled, onMessage]);

  const send = (message) => {
    // Mock send - in real implementation, this would send via WebSocket
    console.log('Mock websocket send:', message);
  };

  const disconnect = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setConnected(false);
  };

  return { connected, send, disconnect };
}

/**
 * Shuffles leaderboard positions slightly for demo purposes
 */
function shuffleLeaderboard(data) {
  if (!Array.isArray(data) || data.length < 2) return data;

  const shuffled = [...data];
  
  // Randomly swap 1-2 adjacent pairs
  const swaps = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < swaps; i++) {
    const index = Math.floor(Math.random() * (shuffled.length - 1));
    const temp = shuffled[index];
    shuffled[index] = { ...shuffled[index + 1], pos: index + 1 };
    shuffled[index + 1] = { ...temp, pos: index + 2 };
  }

  // Update times slightly
  return shuffled.map((entry, idx) => ({
    ...entry,
    pos: idx + 1,
    time: entry.time || generateRandomTime(),
  }));
}

function generateRandomTime() {
  const mins = 1;
  const secs = 28 + Math.random() * 2;
  return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
}

