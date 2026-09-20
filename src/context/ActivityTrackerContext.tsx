import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

export type SessionState = "ACTIVE" | "IDLE" | "ACTIVITY_CHECK" | "BREAK" | "LOGOUT_PENDING" | "COMPLETED";

export interface WorkSessionData {
  session_id: string;
  employee_id: number;
  started_at: string;
  ended_at?: string;
  status: "RUNNING" | "ON_BREAK" | "IDLE" | "VERIFICATION_REQUIRED" | "COMPLETED";
  current_state: SessionState;
  active_duration: number;
  idle_duration: number;
  break_duration: number;
  last_activity_at: string;
}

export interface ActiveBreakData {
  break_id: string;
  session_id: string;
  break_type: string;
  started_at: string;
  allocated_duration: number;
  details?: string;
}

export interface ActivityItem {
  type: string;
  timestamp: number;
  time: string;
  label: string;
  breakType?: string;
  details?: string;
}

export interface BreakHistoryItem {
  number: number;
  type: string;
  startTime: string;
  endTime: string;
  duration: string;
  details: string;
  efficiency: string;
  actualDuration?: number;
  allocatedDuration?: number;
  startedAt?: string;
}

export interface ActivitySettingsData {
  tracking_enabled: number;
  idle_threshold_seconds: number;
  verification_enabled: number;
  verification_interval_seconds: number;
  verification_timeout_seconds: number;
  max_attempts: number;
  heartbeat_interval_seconds: number;
  track_mouse: number;
  track_keyboard: number;
  track_scroll: number;
}

interface ActivityTrackerContextType {
  session: WorkSessionData | null;
  activeBreak: ActiveBreakData | null;
  currentState: SessionState;
  sessionTimeFormatted: string;
  workTimeFormatted: string;
  idleTimeFormatted: string;
  breakTimeFormatted: string;
  recentActivities: ActivityItem[];
  breakHistory: BreakHistoryItem[];
  settings: ActivitySettingsData;
  isVerificationOpen: boolean;
  verificationQuestion: string | null;
  verificationCheckId: number | string | null;
  isLogoutModalOpen: boolean;
  activityModalOpen: boolean;
  openActivityModal: () => void;
  closeActivityModal: () => void;
  triggerLogoutModal: () => void;
  closeLogoutModal: () => void;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  startBreak: (breakType: string, customDuration?: number, details?: any) => Promise<void>;
  endBreak: () => Promise<void>;
  submitVerification: (answer: string, responseTime: number) => Promise<{ success: boolean; message: string; attemptsExhausted?: boolean }>;
  timeoutVerification: () => Promise<void>;
}

const DEFAULT_SETTINGS: ActivitySettingsData = {
  tracking_enabled: 1,
  idle_threshold_seconds: 120, // 2 minutes inactivity popup
  verification_enabled: 1,
  verification_interval_seconds: 120,
  verification_timeout_seconds: 60,
  max_attempts: 2,
  heartbeat_interval_seconds: 30,
  track_mouse: 1,
  track_keyboard: 1,
  track_scroll: 1,
};

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ActivityTrackerContext = createContext<ActivityTrackerContextType | null>(null);

export const ActivityTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<WorkSessionData | null>(null);
  const [activeBreak, setActiveBreak] = useState<ActiveBreakData | null>(null);
  const [currentState, setCurrentState] = useState<SessionState>("ACTIVE");
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [breakHistory, setBreakHistory] = useState<BreakHistoryItem[]>([]);
  const [settings, setSettings] = useState<ActivitySettingsData>(DEFAULT_SETTINGS);

  const [activeDuration, setActiveDuration] = useState<number>(0);
  const [idleDuration, setIdleDuration] = useState<number>(0);
  const [breakDuration, setBreakDuration] = useState<number>(0);

  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  const [verificationQuestion, setVerificationQuestion] = useState<string | null>(null);
  const [verificationCheckId, setVerificationCheckId] = useState<number | string | null>(null);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [activityModalOpen, setActivityModalOpen] = useState<boolean>(false);

  const lastActivityTimestampRef = useRef<number>(Date.now());
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const secTimerRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Refs to avoid stale closures inside setInterval callbacks
  const currentStateRef = useRef<SessionState>(currentState);
  const sessionRef = useRef<WorkSessionData | null>(session);
  const isVerificationOpenRef = useRef<boolean>(isVerificationOpen);
  const activeBreakRef = useRef<ActiveBreakData | null>(activeBreak);
  const settingsRef = useRef<ActivitySettingsData>(settings);
  const activeDurationRef = useRef<number>(activeDuration);
  const idleDurationRef = useRef<number>(idleDuration);
  const breakDurationRef = useRef<number>(breakDuration);

  // Keep refs synced with state
  useEffect(() => { currentStateRef.current = currentState; }, [currentState]);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { activeDurationRef.current = activeDuration; }, [activeDuration]);
  useEffect(() => { idleDurationRef.current = idleDuration; }, [idleDuration]);
  useEffect(() => { breakDurationRef.current = breakDuration; }, [breakDuration]);
  useEffect(() => { isVerificationOpenRef.current = isVerificationOpen; }, [isVerificationOpen]);
  useEffect(() => { activeBreakRef.current = activeBreak; }, [activeBreak]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Helper duration formatter
  const formatSeconds = useCallback((sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, []);

  // Multi-tab channel setup
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("employee_activity_tracker_channel");
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === "USER_INTERACTION") {
            lastActivityTimestampRef.current = Date.now();
          } else if (event.data?.type === "STATE_CHANGED") {
            fetchCurrentSession();
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }
    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  // Sync state with server
  const fetchCurrentSession = useCallback(async () => {
    try {
      const user = getCurrentUser();
      const res = await api.get("/sessions/current", {
        params: user?.id ? { employeeId: user.id } : {},
      });
      const data = res.data;
      if (data?.success) {
        if (data.settings) setSettings(data.settings);
        if (data.hasActiveSession && data.session) {
          setSession(data.session);
          setCurrentState(data.session.current_state || "ACTIVE");
          setActiveDuration(data.session.active_duration || 0);
          setIdleDuration(data.session.idle_duration || 0);
          setBreakDuration(data.session.break_duration || 0);
          if (data.activeBreak) setActiveBreak(data.activeBreak);
          else setActiveBreak(null);

          if (data.recentEvents && data.recentEvents.length > 0) {
            const formattedEvents: ActivityItem[] = data.recentEvents.map((ev: any) => ({
              type: ev.event_type,
              timestamp: new Date(ev.timestamp).getTime(),
              time: new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              label: ev.metadata?.label || ev.event_type,
              breakType: ev.metadata?.breakType,
            }));
            setRecentActivities(formattedEvents);
          }

          if (data.breakHistory && data.breakHistory.length > 0) {
            const formattedBreaks: BreakHistoryItem[] = data.breakHistory.map((b: any, idx: number) => ({
              number: idx + 1,
              type: b.break_type,
              startTime: new Date(b.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              endTime: b.ended_at ? new Date(b.ended_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
              duration: `${Math.round((b.actual_duration || 0) / 60)}m`,
              details: b.details || "Standard break",
              efficiency: b.efficiency || "95%",
              actualDuration: Number(b.actual_duration || 0),
              allocatedDuration: Number(b.allocated_duration || 0) * 60,
              startedAt: b.started_at,
            }));
            setBreakHistory(formattedBreaks);
          }
          return true; // has active session
        } else {
          // No active session found - don't set COMPLETED, we'll auto-start
          return false;
        }
      }
      return false;
    } catch (err) {
      console.error("Error fetching current session:", err);
      return false;
    }
  }, []);

  // breakHistoryRef to avoid stale closures
  const breakHistoryRef = useRef<BreakHistoryItem[]>(breakHistory);
  useEffect(() => { breakHistoryRef.current = breakHistory; }, [breakHistory]);

  // Auto-persist state to localStorage every time state changes (user-scoped)
  useEffect(() => {
    if (!session || currentState === "COMPLETED") return;
    try {
      const currentUser = getCurrentUser();
      const currentUserId = currentUser?.id || session.employee_id;
      const storageKey = `employee_activity_tracker_state_v3_${currentUserId}`;
      const payload = {
        date: getTodayDateString(),
        session,
        activeBreak,
        currentState,
        activeDuration,
        idleDuration,
        breakDuration,
        recentActivities,
        breakHistory,
        lastSavedTimestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (e) {}
  }, [session, activeBreak, currentState, activeDuration, idleDuration, breakDuration, recentActivities, breakHistory]);

  // Auto-start / Restore session on mount
  useEffect(() => {
    const initSession = async () => {
      const currentUser = getCurrentUser();
      const currentUserId = currentUser?.id;
      const token = localStorage.getItem("token");

      if (!token || !currentUserId) {
        return;
      }

      const storageKey = `employee_activity_tracker_state_v3_${currentUserId}`;

      // 1. Try restoring today's saved session for THIS user from localStorage
      let restoredToday = false;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          const today = getTodayDateString();
          if (data.date === today && String(data.session?.employee_id) === String(currentUserId)) {
            console.log("[ActivityTracker] Restoring today's active session for user:", currentUserId);
            if (data.session) setSession(data.session);
            if (data.activeBreak) setActiveBreak(data.activeBreak);
            if (data.currentState) setCurrentState(data.currentState);
            if (typeof data.activeDuration === "number") setActiveDuration(data.activeDuration);
            if (typeof data.idleDuration === "number") setIdleDuration(data.idleDuration);
            if (typeof data.breakDuration === "number") setBreakDuration(data.breakDuration);
            if (Array.isArray(data.recentActivities) && data.recentActivities.length > 0) setRecentActivities(data.recentActivities);
            if (Array.isArray(data.breakHistory) && data.breakHistory.length > 0) setBreakHistory(data.breakHistory);

            if (data.lastSavedTimestamp && data.currentState === "BREAK") {
              const elapsedSec = Math.max(0, Math.floor((Date.now() - data.lastSavedTimestamp) / 1000));
              setBreakDuration((prev) => prev + elapsedSec);
            }
            restoredToday = true;
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      } catch (err) {
        console.warn("Could not parse localStorage activity tracker state:", err);
      }

      // 2. Fetch server session data to sync
      const hasSession = await fetchCurrentSession();
      if (!hasSession) {
        // Auto-start a new session for this logged-in user on the server
        console.log("[ActivityTracker] Starting new session for user:", currentUserId);
        try {
          const res = await api.post("/sessions/start", { employeeId: currentUserId });
          const data = res.data;
          if (data?.success && data?.session) {
            setSession(data.session);
            setCurrentState("ACTIVE");
            setActiveDuration(data.session.active_duration || 0);
            setIdleDuration(data.session.idle_duration || 0);
            setBreakDuration(data.session.break_duration || 0);
            lastActivityTimestampRef.current = Date.now();
            console.log("[ActivityTracker] Session auto-started for employee:", currentUserId, data.session.session_id);
          }
        } catch (err) {
          console.error("[ActivityTracker] Auto-start session failed:", err);
        }
      }
    };
    initSession();
  }, [fetchCurrentSession]);

  // Non-intrusive activity listeners (mousemove, mousedown, keydown, scroll)
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    lastActivityTimestampRef.current = now;
    broadcastChannelRef.current?.postMessage({ type: "USER_INTERACTION", timestamp: now });

    // If currently IDLE, transition back to ACTIVE
    if (currentState === "IDLE" && session) {
      setCurrentState("ACTIVE");
      api.post("/sessions/activity", {
        sessionId: session.session_id,
        eventType: "IDLE_ENDED",
        metadata: { label: "Activity resumed work" },
      }).catch((e) => console.warn("Log activity error:", e));
    }
  }, [currentState, session]);

  useEffect(() => {
    if (!settings.tracking_enabled || currentState === "BREAK" || currentState === "COMPLETED") {
      return;
    }

    const events: string[] = [];
    if (settings.track_mouse) events.push("mousemove", "mousedown");
    if (settings.track_keyboard) events.push("keydown");
    if (settings.track_scroll) events.push("scroll", "touchstart");

    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          handleUserActivity();
        }, 1000);
      }
    };

    events.forEach((evt) => window.addEventListener(evt, throttledHandler, { passive: true }));
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, throttledHandler));
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [handleUserActivity, settings, currentState]);

  // Trigger math activity verification check (uses refs to avoid stale closures)
  const triggerActivityCheck = useCallback(async () => {
    const currentSession = sessionRef.current;
    const state = currentStateRef.current;
    const verOpen = isVerificationOpenRef.current;
    const brk = activeBreakRef.current;

    console.log("[ActivityTracker] triggerActivityCheck called", { state, verOpen, hasSession: !!currentSession, hasBreak: !!brk });

    if (!currentSession || verOpen || state === "BREAK" || state === "ACTIVITY_CHECK") {
      return;
    }

    // Approved work break types skip math verification popup
    if (brk) {
      return;
    }

    // Generate local math question as fallback
    const num1 = Math.floor(Math.random() * 15) + 1;
    const num2 = Math.floor(Math.random() * 15) + 1;
    const isAdd = Math.random() > 0.5;
    const localQ = isAdd ? `${num1} + ${num2} = ?` : `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;

    try {
      const res = await api.post("/sessions/activity-check/start", { sessionId: currentSession.session_id });
      const data = res.data;
      if (data?.success) {
        setVerificationCheckId(data.checkId);
        setVerificationQuestion(data.question);
      } else {
        setVerificationCheckId("local-check-" + Date.now());
        setVerificationQuestion(localQ);
      }
    } catch (err) {
      console.warn("Error starting activity check via API, using fallback question:", err);
      setVerificationCheckId("local-check-" + Date.now());
      setVerificationQuestion(localQ);
    } finally {
      setIsVerificationOpen(true);
      setCurrentState("ACTIVITY_CHECK");
      console.log("[ActivityTracker] Verification modal opened!");
    }
  }, []); // no deps needed — uses refs

  // Main 1-second ticker for duration increment & idle detection
  // Uses refs so the interval callback always reads fresh state
  useEffect(() => {
    if (!session || currentState === "COMPLETED") return;

    secTimerRef.current = setInterval(() => {
      const now = Date.now();
      const idleSecs = Math.floor((now - lastActivityTimestampRef.current) / 1000);
      const state = currentStateRef.current;
      const stg = settingsRef.current;

      if (state === "ACTIVE") {
        setActiveDuration((prev) => prev + 1);
        if (stg.verification_enabled && idleSecs >= stg.idle_threshold_seconds) {
          console.log(`[ActivityTracker] Idle threshold reached: ${idleSecs}s >= ${stg.idle_threshold_seconds}s. Triggering verification.`);
          setCurrentState("IDLE");
          triggerActivityCheck();
        }
      } else if (state === "IDLE" || state === "ACTIVITY_CHECK") {
        setIdleDuration((prev) => prev + 1);
      } else if (state === "BREAK") {
        setBreakDuration((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (secTimerRef.current) clearInterval(secTimerRef.current);
    };
  }, [session, currentState, triggerActivityCheck]);

  // Real-time Heartbeat loop to backend (syncs durations to MySQL)
  const sendHeartbeat = useCallback(async () => {
    const curSession = sessionRef.current;
    if (!curSession || currentStateRef.current === "COMPLETED") return;

    const idleSecs = Math.floor((Date.now() - lastActivityTimestampRef.current) / 1000);
    try {
      const user = getCurrentUser();
      await api.post("/sessions/heartbeat", {
        sessionId: curSession.session_id,
        idleSeconds: idleSecs,
        state: currentStateRef.current,
        activeDuration: activeDurationRef.current,
        idleDuration: idleDurationRef.current,
        breakDuration: breakDurationRef.current,
        employeeId: user?.id || curSession.employee_id,
      });
    } catch (err) {
      console.warn("Heartbeat error:", err);
    }
  }, []);

  useEffect(() => {
    if (!session || currentState === "COMPLETED") return;

    // Send immediate sync on start
    sendHeartbeat();

    // Fast sync every 15 seconds so admin dashboard is always up-to-date
    heartbeatTimerRef.current = setInterval(() => {
      sendHeartbeat();
    }, 15000);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [session, currentState, sendHeartbeat]);

  // Start Work Session
  const startSession = async () => {
    const user = getCurrentUser();
    try {
      const res = await api.post("/sessions/start", { employeeId: user?.id });
      const data = res.data;
      if (data?.success && data?.session) {
        setSession(data.session);
        setCurrentState("ACTIVE");
        setActiveDuration(data.session.active_duration || 0);
        setIdleDuration(data.session.idle_duration || 0);
        setBreakDuration(data.session.break_duration || 0);
        lastActivityTimestampRef.current = Date.now();
        broadcastChannelRef.current?.postMessage({ type: "STATE_CHANGED" });
        return;
      }
    } catch (err) {
      console.warn("Error starting session via API, using fallback session:", err);
    }

    // Fallback session if backend API failed or MySQL table missing
    const fallbackSession: WorkSessionData = {
      session_id: `SES-${Date.now()}`,
      employee_id: user?.id || 1,
      started_at: new Date().toISOString(),
      status: "RUNNING",
      current_state: "ACTIVE",
      active_duration: 0,
      idle_duration: 0,
      break_duration: 0,
      last_activity_at: new Date().toISOString(),
    };
    setSession(fallbackSession);
    setCurrentState("ACTIVE");
    setActiveDuration(0);
    setIdleDuration(0);
    setBreakDuration(0);
    lastActivityTimestampRef.current = Date.now();
    broadcastChannelRef.current?.postMessage({ type: "STATE_CHANGED" });
  };

  // Start Smart Break
  const startBreak = async (breakType: string, customDuration?: number, details?: any) => {
    if (!session) return;

    const startAct: ActivityItem = {
      type: "BREAK_START",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      label: `Started ${breakType}`,
      breakType,
    };
    setRecentActivities((prev) => [startAct, ...prev]);

    try {
      const res = await api.post("/sessions/break/start", {
        sessionId: session.session_id,
        breakType,
        customDuration,
        details,
      });
      const data = res.data;
      if (data?.success) {
        setActiveBreak(data.break);
        setCurrentState("BREAK");
        setIsVerificationOpen(false);
        broadcastChannelRef.current?.postMessage({ type: "STATE_CHANGED" });
        await fetchCurrentSession();
        return;
      }
    } catch (err) {
      console.warn("Error starting break via API, using local fallback:", err);
    }

    // Fallback break
    const localBreak: ActiveBreakData = {
      break_id: `BRK-${Date.now()}`,
      session_id: session.session_id,
      break_type: breakType,
      allocated_duration: customDuration || 15,
      started_at: new Date().toISOString(),
    };
    setActiveBreak(localBreak);
    setCurrentState("BREAK");
    setIsVerificationOpen(false);
  };

  // End Smart Break / Resume Work
  const endBreak = async () => {
    if (!session) return;

    const currentBreak = activeBreak;
    if (currentBreak) {
      const startTime = new Date(currentBreak.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const endTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const elapsedMs = Date.now() - new Date(currentBreak.started_at).getTime();
      const durMin = Math.max(1, Math.round(elapsedMs / 60000));

      const newHistoryItem: BreakHistoryItem = {
        number: breakHistoryRef.current.length + 1,
        type: currentBreak.break_type,
        startTime,
        endTime,
        duration: `${durMin}m`,
        details: "Completed break",
        efficiency: "95%",
      };
      setBreakHistory((prev) => [newHistoryItem, ...prev]);

      const breakEndActivity: ActivityItem = {
        type: "BREAK_END",
        timestamp: Date.now(),
        time: endTime,
        label: `Ended ${currentBreak.break_type} (${durMin}m)`,
        breakType: currentBreak.break_type,
      };
      setRecentActivities((prev) => [breakEndActivity, ...prev]);
    }

    try {
      const res = await api.post("/sessions/break/end", {
        sessionId: session.session_id,
        breakId: activeBreak?.break_id,
      });
      const data = res.data;
      if (data?.success) {
        setActiveBreak(null);
        setCurrentState("ACTIVE");
        lastActivityTimestampRef.current = Date.now();
        broadcastChannelRef.current?.postMessage({ type: "STATE_CHANGED" });
        await fetchCurrentSession();
        return;
      }
    } catch (err) {
      console.warn("Error ending break via API, using local fallback:", err);
    }

    setActiveBreak(null);
    setCurrentState("ACTIVE");
    lastActivityTimestampRef.current = Date.now();
  };

  // End Session
  const endSession = async () => {
    try {
      const user = getCurrentUser();
      const currentUserId = user?.id || session?.employee_id;
      if (currentUserId) {
        localStorage.removeItem(`employee_activity_tracker_state_v3_${currentUserId}`);
      }
      localStorage.removeItem("employee_activity_tracker_state_v3");
    } catch (e) {}

    if (session) {
      try {
        await api.post("/sessions/end", {
          sessionId: session.session_id,
          activeDuration: activeDurationRef.current,
          idleDuration: idleDurationRef.current,
          breakDuration: breakDurationRef.current,
        });
      } catch (err) {
        console.error("Error ending work session API:", err);
      }
    }
    setSession(null);
    setActiveBreak(null);
    setCurrentState("COMPLETED");
    setIsLogoutModalOpen(false);
    broadcastChannelRef.current?.postMessage({ type: "STATE_CHANGED" });
  };

  // Verification submission
  const submitVerification = async (answer: string, responseTime: number) => {
    if (!verificationCheckId) {
      return { success: false, message: "No active verification check ID" };
    }

    const checkLocalAnswer = () => {
      if (verificationQuestion) {
        const cleanQ = verificationQuestion.replace(" = ?", "").trim();
        const parts = cleanQ.split(" ");
        const n1 = parseInt(parts[0], 10);
        const op = parts[1];
        const n2 = parseInt(parts[2], 10);
        const expected = op === "+" ? n1 + n2 : n1 - n2;
        if (parseInt(answer.trim(), 10) === expected) {
          setIsVerificationOpen(false);
          setVerificationCheckId(null);
          setVerificationQuestion(null);
          setCurrentState("ACTIVE");
          lastActivityTimestampRef.current = Date.now();
          return { success: true, message: "Verification passed! Resuming active work." };
        }
      }
      return { success: false, message: "Incorrect answer, please try again." };
    };

    if (String(verificationCheckId).startsWith("local-check-")) {
      return checkLocalAnswer();
    }

    try {
      const res = await api.post("/sessions/activity-check/submit", {
        checkId: verificationCheckId,
        answer,
        responseTime,
      });
      const data = res.data;
      if (data.success) {
        setIsVerificationOpen(false);
        setVerificationCheckId(null);
        setVerificationQuestion(null);
        setCurrentState("ACTIVE");
        lastActivityTimestampRef.current = Date.now();
        return { success: true, message: data.message };
      } else {
        const localRes = checkLocalAnswer();
        if (localRes.success) return localRes;
        if (data.attemptsExhausted) {
          setIsVerificationOpen(false);
          setCurrentState("IDLE");
        }
        return { success: false, message: data.message || "Incorrect answer, please try again.", attemptsExhausted: data.attemptsExhausted };
      }
    } catch (err: any) {
      const localRes = checkLocalAnswer();
      if (localRes.success) return localRes;
      return { success: false, message: "Incorrect answer, please try again." };
    }
  };

  const timeoutVerification = async () => {
    if (!verificationCheckId) return;
    try {
      await api.post("/sessions/activity-check/submit", {
        checkId: verificationCheckId,
        timeout: true,
        responseTime: 60,
      });
    } catch (err) {
      console.error("Error submitting timeout:", err);
    } finally {
      setIsVerificationOpen(false);
      setVerificationCheckId(null);
      setVerificationQuestion(null);
      setCurrentState("IDLE");
    }
  };

  const totalSessionSec = activeDuration + idleDuration + breakDuration;

  return (
    <ActivityTrackerContext.Provider
      value={{
        session,
        activeBreak,
        currentState,
        sessionTimeFormatted: formatSeconds(totalSessionSec),
        workTimeFormatted: formatSeconds(activeDuration),
        idleTimeFormatted: formatSeconds(idleDuration),
        breakTimeFormatted: formatSeconds(breakDuration),
        recentActivities,
        breakHistory,
        settings,
        isVerificationOpen,
        verificationQuestion,
        verificationCheckId,
        isLogoutModalOpen,
        activityModalOpen,
        openActivityModal: () => setActivityModalOpen(true),
        closeActivityModal: () => setActivityModalOpen(false),
        triggerLogoutModal: () => setIsLogoutModalOpen(true),
        closeLogoutModal: () => setIsLogoutModalOpen(false),
        startSession,
        endSession,
        startBreak,
        endBreak,
        submitVerification,
        timeoutVerification,
      }}
    >
      {children}
    </ActivityTrackerContext.Provider>
  );
};

export const useActivityTracker = () => {
  const context = useContext(ActivityTrackerContext);
  if (!context) {
    throw new Error("useActivityTracker must be used within an ActivityTrackerProvider");
  }
  return context;
};
