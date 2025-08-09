import { useEffect, useState, useRef } from 'react';

const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    // إنشاء اتصال WebSocket
    const socketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${url}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('فشل الاتصال بالخادم');
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { data, isConnected, error, sendMessage };
};

export default useWebSocket;