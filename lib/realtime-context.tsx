"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { ThreatEvent } from "./types";
import { THREATS } from "./mock-data";

export interface LiveEvent extends ThreatEvent {
  liveId: string;
  detectedAt: Date;
}

interface RealtimeCtx {
  liveFeed: LiveEvent[];
  failedLogins: number;
  scanCount: number;
  lastScan: Date | null;
  toasts: LiveEvent[];
  dismissToast: (liveId: string) => void;
  notifCount: number;
  clearNotifs: () => void;
}

const RealtimeContext = createContext<RealtimeCtx>({
  liveFeed: [],
  failedLogins: 12,
  scanCount: 1247,
  lastScan: null,
  toasts: [],
  dismissToast: () => {},
  notifCount: 0,
  clearNotifs: () => {},
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [liveFeed, setLiveFeed] = useState<LiveEvent[]>([]);
  const [failedLogins, setFailedLogins] = useState(12);
  const [scanCount, setScanCount] = useState(1247);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [toasts, setToasts] = useState<LiveEvent[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const idxRef = useRef(0);

  const addEvent = useCallback(() => {
    const threat = THREATS[idxRef.current % THREATS.length];
    idxRef.current++;
    const liveId = `live-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const event: LiveEvent = {
      ...threat,
      liveId,
      id: `LIVE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: Math.random() > 0.6 ? "active" : "investigating",
      detectedAt: new Date(),
    };
    setLiveFeed((prev) => [event, ...prev].slice(0, 30));
    setScanCount((prev) => prev + Math.floor(Math.random() * 4) + 1);
    setLastScan(new Date());
    setNotifCount((prev) => prev + 1);

    if (event.severity === "critical" || event.severity === "high") {
      setToasts((prev) => [event, ...prev].slice(0, 4));
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.liveId !== liveId)),
        7000,
      );
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(addEvent, 4000);

    let tid: ReturnType<typeof setTimeout>;
    const schedule = () => {
      tid = setTimeout(
        () => {
          addEvent();
          schedule();
        },
        9000 + Math.random() * 8000,
      );
    };
    const start = setTimeout(schedule, 4000);

    const loginTick = setInterval(
      () => {
        setFailedLogins((prev) => prev + Math.floor(Math.random() * 3) + 1);
      },
      18000 + Math.random() * 12000,
    );

    return () => {
      clearTimeout(first);
      clearTimeout(tid);
      clearTimeout(start);
      clearInterval(loginTick);
    };
  }, [addEvent]);

  const dismissToast = useCallback((liveId: string) => {
    setToasts((prev) => prev.filter((t) => t.liveId !== liveId));
  }, []);

  const clearNotifs = useCallback(() => setNotifCount(0), []);

  return (
    <RealtimeContext.Provider
      value={{
        liveFeed,
        failedLogins,
        scanCount,
        lastScan,
        toasts,
        dismissToast,
        notifCount,
        clearNotifs,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
//this is a comment
