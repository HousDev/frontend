import React, { createContext, useContext, useState, useEffect } from 'react';

// Activity Context
const ActivityContext = createContext({
    workTime: 0,
    breakTime: 0,
    totalTime: 0,
    isOnBreak: false,
    isLoggedIn: false,
    sessionStartTime: null,
    breakStartTime: null,
    startBreak: () => { },
    endBreak: () => { },
    login: () => { },
    logout: () => { },
    leadsViewed: 0,
    leadsContacted: 0,
    followUpsCompleted: 0,
    notesAdded: 0,
    incrementLead: (type) => { },
});

export const useActivity = () => {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error('useActivity must be used within ActivityProvider');
    }
    return context;
};

export const ActivityProvider = ({ children }) => {
    const [workTime, setWorkTime] = useState(0);
    const [breakTime, setBreakTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [breakStartTime, setBreakStartTime] = useState(null);
    const [totalBreakTime, setTotalBreakTime] = useState(0);

    // Productivity metrics
    const [leadsViewed, setLeadsViewed] = useState(0);
    const [leadsContacted, setLeadsContacted] = useState(0);
    const [followUpsCompleted, setFollowUpsCompleted] = useState(0);
    const [notesAdded, setNotesAdded] = useState(0);

    // Check for existing session on mount
    useEffect(() => {
        const savedStartTime = localStorage.getItem("sessionStartTime");
        const savedDate = localStorage.getItem("loginDate");
        const today = new Date().toDateString();

        if (savedStartTime && savedDate === today) {
            setIsLoggedIn(true);
            setSessionStartTime(parseInt(savedStartTime));

            // Load saved metrics
            const savedMetrics = JSON.parse(localStorage.getItem("todayMetrics") || "{}");
            setLeadsViewed(savedMetrics.leadsViewed || 0);
            setLeadsContacted(savedMetrics.leadsContacted || 0);
            setFollowUpsCompleted(savedMetrics.followUpsCompleted || 0);
            setNotesAdded(savedMetrics.notesAdded || 0);
            setTotalBreakTime(savedMetrics.totalBreakTime || 0);
        }
    }, []);

    // Timer logic
    useEffect(() => {
        if (!isLoggedIn || !sessionStartTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - sessionStartTime) / 1000);
            setTotalTime(elapsed);

            if (isOnBreak && breakStartTime) {
                // Update current break time
                const currentBreakDuration = Math.floor((now - breakStartTime) / 1000);
                setBreakTime(totalBreakTime + currentBreakDuration);
                setWorkTime(elapsed - (totalBreakTime + currentBreakDuration));
            } else {
                // Update work time
                setWorkTime(elapsed - totalBreakTime);
                setBreakTime(totalBreakTime);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoggedIn, sessionStartTime, isOnBreak, breakStartTime, totalBreakTime]);

    // Save metrics to localStorage
    useEffect(() => {
        if (isLoggedIn) {
            const metrics = {
                leadsViewed,
                leadsContacted,
                followUpsCompleted,
                notesAdded,
                totalBreakTime
            };
            localStorage.setItem("todayMetrics", JSON.stringify(metrics));
        }
    }, [leadsViewed, leadsContacted, followUpsCompleted, notesAdded, totalBreakTime, isLoggedIn]);

    const login = () => {
        const now = Date.now();
        setIsLoggedIn(true);
        setSessionStartTime(now);
        setWorkTime(0);
        setBreakTime(0);
        setTotalTime(0);
        setTotalBreakTime(0);

        // Save to localStorage
        localStorage.setItem("sessionStartTime", now.toString());
        localStorage.setItem("loginDate", new Date().toDateString());

        // Initialize timeline
        const timeline = [{
            id: now,
            label: "Session Started",
            type: "login",
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }),
            timestamp: now
        }];
        localStorage.setItem("todayTimeline", JSON.stringify(timeline));

        // Reset daily metrics
        setLeadsViewed(0);
        setLeadsContacted(0);
        setFollowUpsCompleted(0);
        setNotesAdded(0);
    };

    const logout = () => {
        // Add logout event to timeline
        const timeline = JSON.parse(localStorage.getItem("todayTimeline") || "[]");
        timeline.push({
            id: Date.now(),
            label: "Session Ended",
            type: "logout",
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }),
            timestamp: Date.now()
        });
        localStorage.setItem("todayTimeline", JSON.stringify(timeline));

        setIsLoggedIn(false);
        setSessionStartTime(null);
        setBreakStartTime(null);
        setIsOnBreak(false);

        // Clear session data but keep metrics for the day
        localStorage.removeItem("sessionStartTime");
        localStorage.removeItem("loginDate");
    };

    const startBreak = () => {
        if (!isOnBreak) {
            const now = Date.now();
            setIsOnBreak(true);
            setBreakStartTime(now);
        }
    };

    const endBreak = () => {
        if (isOnBreak && breakStartTime) {
            const now = Date.now();
            const breakDuration = Math.floor((now - breakStartTime) / 1000);
            setTotalBreakTime(prev => prev + breakDuration);
            setIsOnBreak(false);
            setBreakStartTime(null);
        }
    };

    const incrementLead = (type) => {
        switch (type) {
            case 'viewed':
                setLeadsViewed(prev => prev + 1);
                break;
            case 'contacted':
                setLeadsContacted(prev => prev + 1);
                break;
            case 'followup':
                setFollowUpsCompleted(prev => prev + 1);
                break;
            case 'note':
                setNotesAdded(prev => prev + 1);
                break;
        }
    };

    return (
        <ActivityContext.Provider
            value={{
                workTime,
                breakTime,
                totalTime,
                isOnBreak,
                isLoggedIn,
                sessionStartTime,
                breakStartTime,
                startBreak,
                endBreak,
                login,
                logout,
                leadsViewed,
                leadsContacted,
                followUpsCompleted,
                notesAdded,
                incrementLead
            }}
        >
            {children}
        </ActivityContext.Provider>
    );
};