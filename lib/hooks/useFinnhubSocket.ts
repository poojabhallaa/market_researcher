'use client';
import { useState, useEffect, useRef } from 'react';

export function useFinnhubSocket(symbol: string) {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsKey = process.env.NEXT_PUBLIC_FINNHUB_WS_KEY;
    if (!wsKey || !symbol) return;

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${wsKey}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'trade' && data.data?.[0]?.p) {
          setLivePrice(data.data[0].p);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
      }
      ws.close();
      wsRef.current = null;
    };
  }, [symbol]);

  return livePrice;
}
