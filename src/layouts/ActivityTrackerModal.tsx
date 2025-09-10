import React, { useState, useEffect, useCallback } from "react";
import {
    X,
    Clock,
    Activity,
    Coffee,
    User,
    TrendingUp,
    Play,
    Square,
} from "lucide-react";
import BreakTypesModal from "./BreakTypeModal";

type BreakDetails = {
    meetingNotes?: string;
    meetingPurpose?: string;
    [key: string]: any;
};

type ActivityItem = {
    type: "start_session" | "end_session" | "start_break" | "end_break";
    timestamp: number;
    time: string;
    label: string;
    breakType?: string;
    details?: string;
    [key: string]: any;
};

type BreakHistoryItem = {
    number: number;
    type: string;
    startTime: string;
    endTime: string;
    duration: string;
    details: string;
    efficiency: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    sessionTime: string;
    workTime: string;
    isOnBreak: boolean;
    onStartBreak: (breakType: string, breakDetails: BreakDetails) => void;
    onEndBreak: () => void;
    loginTime?: number | null;
};

const ActivityTrackerModal: React.FC<Props> = ({
    isOpen,
    onClose,
    sessionTime,
    workTime,
    isOnBreak,
    onStartBreak,
    onEndBreak,
    loginTime,
}) => {
    const [activityHistory, setActivityHistory] = useState<ActivityItem[]>([]);
    const [breakHistory, setBreakHistory] = useState<BreakHistoryItem[]>([]);
    const [isBreakTypesOpen, setIsBreakTypesOpen] = useState(false);
    const [totalBreakDuration, setTotalBreakDuration] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);

    const formatDuration = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    }, []);

    // Auto-start session when modal opens
    useEffect(() => {
        if (isOpen) {
            const sessionStatus = localStorage.getItem("sessionActive");
            if (sessionStatus !== "true") {
                handleStartSession();
            } else {
                setIsSessionActive(true);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            try {
                const history: ActivityItem[] = JSON.parse(
                    localStorage.getItem("activityHistory") || "[]"
                );
                setActivityHistory(history.slice(-3));

                const breaks: BreakHistoryItem[] = [];
                let breakCount = 1;
                let totalBreaks = 0;

                for (let i = 0; i < history.length; i++) {
                    if (history[i].type === "start_break") {
                        const endBreak = history.find(
                            (item, index) => index > i && item.type === "end_break"
                        );
                        if (endBreak) {
                            const duration = Math.floor(
                                (endBreak.timestamp - history[i].timestamp) / 1000
                            );
                            totalBreaks += duration;

                            breaks.push({
                                number: breakCount++,
                                type: history[i].breakType || "Regular Break",
                                startTime: history[i].time,
                                endTime: endBreak.time,
                                duration: formatDuration(duration),
                                details: history[i].details || "Standard break",
                                efficiency: calculateEfficiency(duration),
                            });
                        }
                    }
                }

                setBreakHistory(breaks);
                setTotalBreakDuration(totalBreaks);

                const sessionStatus = localStorage.getItem("sessionActive");
                setIsSessionActive(sessionStatus === "true");
            } catch (error) {
                console.error("Error loading activity history:", error);
            }
        }
    }, [isOpen, formatDuration]);

    const calculateEfficiency = (duration: number): string => {
        if (duration <= 300) return "95%";
        if (duration <= 900) return "85%";
        return "75%";
    };

    const handleStartSession = () => {
        const sessionData: ActivityItem = {
            type: "start_session",
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            label: "Started new session",
        };

        const history: ActivityItem[] = JSON.parse(localStorage.getItem("activityHistory") || "[]");
        history.push(sessionData);
        localStorage.setItem("activityHistory", JSON.stringify(history));
        localStorage.setItem("sessionActive", "true");
        localStorage.setItem("sessionStartTime", Date.now().toString());

        setIsSessionActive(true);
        setActivityHistory((prev) => [...prev.slice(-2), sessionData]);
    };

    const handleEndSession = () => {
        const sessionData: ActivityItem = {
            type: "end_session",
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            label: "Ended session",
        };

        const history: ActivityItem[] = JSON.parse(localStorage.getItem("activityHistory") || "[]");
        history.push(sessionData);
        localStorage.setItem("activityHistory", JSON.stringify(history));
        localStorage.setItem("sessionActive", "false");

        setIsSessionActive(false);
        setActivityHistory((prev) => [...prev.slice(-2), sessionData]);
    };

    const handleStartBreak = (breakType: string, breakDetails: BreakDetails) => {
        const breakData: ActivityItem = {
            type: "start_break",
            breakType,
            details: breakDetails.meetingNotes || breakDetails.meetingPurpose || "",
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            label: `Started ${breakType} break`,
            ...breakDetails,
        };

        const history: ActivityItem[] = JSON.parse(localStorage.getItem("activityHistory") || "[]");
        history.push(breakData);
        localStorage.setItem("activityHistory", JSON.stringify(history));

        onStartBreak(breakType, breakDetails);
        setIsBreakTypesOpen(false);
    };

    const handleEndBreak = () => {
        const endBreakData: ActivityItem = {
            type: "end_break",
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            label: "Ended break",
        };

        const history: ActivityItem[] = JSON.parse(localStorage.getItem("activityHistory") || "[]");
        history.push(endBreakData);
        localStorage.setItem("activityHistory", JSON.stringify(history));

        onEndBreak();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Smart Time Tracking & Analytics
                    </h2>
                    <div className="flex items-center space-x-3">
                        {/* New Session - Shows status */}
                        <button
                            onClick={handleStartSession}
                            disabled={isSessionActive}
                            className={`flex items-center space-x-2 px-4 py-2 text-white text-sm rounded-lg transition-colors shadow-sm font-medium ${isSessionActive
                                    ? 'bg-green-500 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            <Play className="h-3 w-3" />
                            <span>{isSessionActive ? 'Session Active' : 'New Session'}</span>
                        </button>

                        {/* Smart Break / End Break Button */}
                        <button
                            onClick={() => {
                                if (isOnBreak) {
                                    handleEndBreak();
                                } else {
                                    setIsBreakTypesOpen(true);
                                }
                            }}
                            className={`flex items-center space-x-2 px-4 py-2 text-white text-sm rounded-lg transition-colors shadow-sm font-medium ${isOnBreak
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-orange-500 hover:bg-orange-600"
                                }`}
                        >
                            <Coffee className="h-3 w-3" />
                            <span>{isOnBreak ? "End Break" : "Smart Break"}</span>
                        </button>

                        {/* End Session */}
                        <button
                            onClick={handleEndSession}
                            disabled={!isSessionActive}
                            className={`flex items-center space-x-2 px-4 py-2 text-white text-sm rounded-lg transition-colors shadow-sm font-medium ${isSessionActive
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Square className="h-3 w-3" />
                            <span>End Session</span>
                        </button>

                        {/* Close Modal */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Session Status Indicator */}
                {isSessionActive && (
                    <div className="px-6 py-2 bg-green-50 border-b border-green-200">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-700 font-medium">
                                Session is running...
                            </span>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="p-3 grid grid-cols-6 gap-4">
                    {/* Total Session */}
                    <div className="bg-white border-l-4 border-l-blue-400 border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between mb-3">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <span className="text-[10px] text-gray-500">
                                Login:{" "}
                                {loginTime
                                    ? new Date(loginTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : "--:--"}
                            </span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-1">
                            {sessionTime}
                        </div>
                        <div className="text-xs text-gray-500">Total Session</div>
                    </div>

                    {/* Active Work Time */}
                    <div className="bg-white border-l-4 border-l-green-400 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-1">
                            {workTime}
                        </div>
                        <div className="text-xs text-gray-500">Active Work Time</div>
                    </div>

                    {/* Break Time */}
                    <div className="bg-white border-l-4 border-l-orange-400 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <Coffee className="h-5 w-5 text-orange-500" />
                            <span className="text-xs text-gray-500">
                                {breakHistory.length} breaks
                            </span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-1">
                            {formatDuration(totalBreakDuration)}
                        </div>
                        <div className="text-xs text-gray-500">Break Time</div>
                    </div>

                    {/* Activity Types */}
                    <div className="bg-white border-l-4 border-l-purple-400 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <Activity className="h-5 w-5 text-purple-500" />
                            <span className="text-xs text-gray-500">Today</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-1">
                            {activityHistory.length}
                        </div>
                        <div className="text-xs text-gray-500">Activity Types</div>
                    </div>

                    {/* Productivity Score */}
                    <div className="bg-white border-l-4 border-l-blue-400 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <User className="h-5 w-5 text-blue-500" />
                            <span className="text-xs text-green-500 font-medium">
                                Excellent
                            </span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-1">100%</div>
                        <div className="text-xs text-gray-500">Productivity Score</div>
                    </div>

                    {/* Session Status */}
                    <div className="bg-white border-l-4 border-l-red-400 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <User className="h-5 w-5 text-red-500" />
                            <span className={`text-xs font-medium ${isSessionActive ? 'text-green-500' : 'text-red-500'}`}>
                                {isSessionActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-1">
                            {isSessionActive ? 'Running' : 'Stopped'}
                        </div>
                        <div className="text-xs text-gray-500">Session Status</div>
                    </div>
                </div>

                {/* Recent Activities / Smart Break / Insights */}
                <div className="p-6 pt-0 grid grid-cols-3 gap-6 max-h-80 overflow-hidden">
                    {/* Recent Activities Card */}
                    <div className="bg-white border border-gray-200 rounded-xl">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Recent Activities
                            </h3>
                        </div>
                        <div className="p-4 space-y-3 overflow-y-auto">
                            {activityHistory.length > 0 ? (
                                activityHistory.map((activity, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'start_session' ? 'bg-green-500' :
                                                activity.type === 'end_session' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                            }`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.label}
                                            </p>
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {activity.type === 'start_session' ? 'Started' :
                                                activity.type === 'end_session' ? 'Ended' : 'Active'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No recent activities</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Analysis */}
                    <div className="bg-white border border-gray-200 rounded-xl">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Activity Breakdown
                            </h3>
                        </div>
                        <div className="p-4 flex items-center justify-center h-32">
                            {breakHistory.length > 0 ? (
                                <p className="text-sm text-gray-700">
                                    {breakHistory.length} breaks taken today
                                </p>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Coffee className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No Activity Breakdown today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Insights */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Activity Insights
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>📈 Productivity: <span className="font-semibold">High</span></p>
                            <p>⏳ Avg Break Duration: <span className="font-semibold">{breakHistory.length > 0 ? breakHistory[0].duration : "0s"}</span></p>
                            <p>⚡ Efficiency Trend: <span className="font-semibold">Stable</span></p>
                            <p>🎯 Session: <span className={`font-semibold ${isSessionActive ? 'text-green-600' : 'text-red-600'}`}>
                                {isSessionActive ? 'Active' : 'Inactive'}
                            </span></p>
                        </div>
                    </div>
                </div>

                {/* Break History Table */}
                <div className="p-6 pt-0">
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Smart Break History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Break #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Start Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            End Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Efficiency
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {breakHistory.length > 0 ? (
                                        breakHistory.map((breakItem, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {breakItem.number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {breakItem.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {breakItem.startTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {breakItem.endTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {breakItem.duration}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {breakItem.details}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                    {breakItem.efficiency}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <Coffee className="h-12 w-12 text-gray-300" />
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        No breaks taken today
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Break Types Modal */}
            {isBreakTypesOpen && (
                <BreakTypesModal
                    isOpen={isBreakTypesOpen}
                    onClose={() => setIsBreakTypesOpen(false)}
                    onSelectBreak={handleStartBreak}
                />
            )}
        </div>
    );
};

export default ActivityTrackerModal;