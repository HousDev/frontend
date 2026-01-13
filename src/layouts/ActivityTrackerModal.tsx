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

// import React, { useState, useEffect, useCallback } from 'react';
// import { X, Clock, Activity, Coffee, User, TrendingUp, Play, Square } from 'lucide-react';

// // Break Types Modal Component
// const BreakTypesModal = ({ isOpen, onClose, onSelectBreak }) => {
//     const [selectedType, setSelectedType] = useState('');
//     const [notes, setNotes] = useState('');

//     const breakTypes = [
//         { id: 'lunch', name: 'Lunch Break', icon: '🍽️', color: 'bg-orange-500' },
//         { id: 'tea', name: 'Tea Break', icon: '☕', color: 'bg-yellow-500' },
//         { id: 'meeting', name: 'Meeting', icon: '👥', color: 'bg-blue-500' },
//         { id: 'personal', name: 'Personal Work', icon: '📱', color: 'bg-purple-500' },
//         { id: 'washroom', name: 'Washroom', icon: '🚻', color: 'bg-green-500' },
//     ];

//     const handleSubmit = () => {
//         if (selectedType) {
//             onSelectBreak(selectedType, { meetingNotes: notes });
//             setSelectedType('');
//             setNotes('');
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4">
//                 <div className="flex justify-between items-center mb-6">
//                     <h3 className="text-xl font-bold text-gray-900">Select Break Type</h3>
//                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3 mb-4">
//                     {breakTypes.map((type) => (
//                         <button
//                             key={type.id}
//                             onClick={() => setSelectedType(type.name)}
//                             className={`p-4 rounded-xl border-2 transition-all ${selectedType === type.name
//                                     ? 'border-blue-500 bg-blue-50'
//                                     : 'border-gray-200 hover:border-gray-300'
//                                 }`}
//                         >
//                             <div className="text-3xl mb-2">{type.icon}</div>
//                             <div className="text-sm font-medium text-gray-900">{type.name}</div>
//                         </button>
//                     ))}
//                 </div>

//                 <textarea
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     placeholder="Add notes (optional)..."
//                     className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     rows={3}
//                 />

//                 <button
//                     onClick={handleSubmit}
//                     disabled={!selectedType}
//                     className={`w-full py-3 rounded-lg font-medium transition-colors ${selectedType
//                             ? 'bg-blue-500 hover:bg-blue-600 text-white'
//                             : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                         }`}
//                 >
//                     Start Break
//                 </button>
//             </div>
//         </div>
//     );
// };

// // Main Activity Tracker Component
// const ActivityTrackerModal = () => {
//     const [isOpen, setIsOpen] = useState(true);
//     const [activityHistory, setActivityHistory] = useState([]);
//     const [breakHistory, setBreakHistory] = useState([]);
//     const [isBreakTypesOpen, setIsBreakTypesOpen] = useState(false);
//     const [totalBreakDuration, setTotalBreakDuration] = useState(0);
//     const [isSessionActive, setIsSessionActive] = useState(false);
//     const [isOnBreak, setIsOnBreak] = useState(false);
//     const [loginTime, setLoginTime] = useState(Date.now());
//     const [sessionStartTime, setSessionStartTime] = useState(null);
//     const [breakStartTime, setBreakStartTime] = useState(null);
//     const [currentTime, setCurrentTime] = useState(Date.now());

//     const formatDuration = useCallback((seconds) => {
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = seconds % 60;

//         if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
//         if (minutes > 0) return `${minutes}m ${secs}s`;
//         return `${secs}s`;
//     }, []);

//     const calculateEfficiency = (duration) => {
//         if (duration <= 300) return "95%";
//         if (duration <= 900) return "85%";
//         return "75%";
//     };

//     // Update current time every second
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentTime(Date.now());
//         }, 1000);
//         return () => clearInterval(interval);
//     }, []);

//     // Calculate session time
//     const getSessionTime = () => {
//         if (!sessionStartTime) return '0h 0m 0s';
//         const duration = Math.floor((currentTime - sessionStartTime) / 1000);
//         return formatDuration(duration);
//     };

//     // Calculate work time (excluding breaks)
//     const getWorkTime = () => {
//         if (!sessionStartTime) return '0h 0m 0s';
//         let workDuration = Math.floor((currentTime - sessionStartTime) / 1000) - totalBreakDuration;
//         if (isOnBreak && breakStartTime) {
//             workDuration -= Math.floor((currentTime - breakStartTime) / 1000);
//         }
//         return formatDuration(Math.max(0, workDuration));
//     };

//     const handleStartSession = () => {
//         const now = Date.now();
//         const sessionData = {
//             type: 'start_session',
//             timestamp: now,
//             time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             label: 'Started new session',
//         };

//         setIsSessionActive(true);
//         setSessionStartTime(now);
//         setLoginTime(now);
//         setActivityHistory(prev => [sessionData, ...prev].slice(0, 20));
//     };

//     const handleEndSession = () => {
//         const now = Date.now();
//         const sessionData = {
//             type: 'end_session',
//             timestamp: now,
//             time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             label: 'Ended session',
//         };

//         setIsSessionActive(false);
//         if (isOnBreak) {
//             handleEndBreak();
//         }
//         setActivityHistory(prev => [sessionData, ...prev].slice(0, 20));
//     };

//     const handleStartBreak = (breakType, breakDetails) => {
//         const now = Date.now();
//         const breakData = {
//             type: 'start_break',
//             breakType,
//             details: breakDetails.meetingNotes || '',
//             timestamp: now,
//             time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             label: `Started ${breakType}`,
//         };

//         setIsOnBreak(true);
//         setBreakStartTime(now);
//         setActivityHistory(prev => [breakData, ...prev].slice(0, 20));
//         setIsBreakTypesOpen(false);
//     };

//     const handleEndBreak = () => {
//         const now = Date.now();
//         const endBreakData = {
//             type: 'end_break',
//             timestamp: now,
//             time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             label: 'Ended break',
//         };

//         if (breakStartTime) {
//             const duration = Math.floor((now - breakStartTime) / 1000);
//             const lastBreak = activityHistory.find(a => a.type === 'start_break');

//             const newBreak = {
//                 number: breakHistory.length + 1,
//                 type: lastBreak?.breakType || 'Regular Break',
//                 startTime: new Date(breakStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//                 endTime: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//                 duration: formatDuration(duration),
//                 details: lastBreak?.details || 'Standard break',
//                 efficiency: calculateEfficiency(duration),
//             };

//             setBreakHistory(prev => [...prev, newBreak]);
//             setTotalBreakDuration(prev => prev + duration);
//         }

//         setIsOnBreak(false);
//         setBreakStartTime(null);
//         setActivityHistory(prev => [endBreakData, ...prev].slice(0, 20));
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
//                     <h2 className="text-3xl font-bold text-gray-900">
//                         Smart Time Tracking & Analytics
//                     </h2>
//                     <div className="flex items-center space-x-3">
//                         {/* New Session */}
//                         <button
//                             onClick={handleStartSession}
//                             disabled={isSessionActive}
//                             className={`flex items-center space-x-2 px-5 py-2.5 text-white text-sm rounded-xl transition-all shadow-lg font-medium ${isSessionActive
//                                     ? 'bg-green-500 cursor-not-allowed opacity-75'
//                                     : 'bg-blue-500 hover:bg-blue-600 hover:shadow-xl'
//                                 }`}
//                         >
//                             <Play className="h-4 w-4" />
//                             <span>{isSessionActive ? 'Session Active' : 'New Session'}</span>
//                         </button>

//                         {/* Smart Break / End Break */}
//                         <button
//                             onClick={() => {
//                                 if (isOnBreak) {
//                                     handleEndBreak();
//                                 } else {
//                                     setIsBreakTypesOpen(true);
//                                 }
//                             }}
//                             disabled={!isSessionActive}
//                             className={`flex items-center space-x-2 px-5 py-2.5 text-white text-sm rounded-xl transition-all shadow-lg font-medium ${!isSessionActive
//                                     ? 'bg-gray-400 cursor-not-allowed'
//                                     : isOnBreak
//                                         ? 'bg-red-500 hover:bg-red-600'
//                                         : 'bg-orange-500 hover:bg-orange-600'
//                                 }`}
//                         >
//                             <Coffee className="h-4 w-4" />
//                             <span>{isOnBreak ? 'End Break' : 'Smart Break'}</span>
//                         </button>

//                         {/* End Session */}
//                         <button
//                             onClick={handleEndSession}
//                             disabled={!isSessionActive}
//                             className={`flex items-center space-x-2 px-5 py-2.5 text-white text-sm rounded-xl transition-all shadow-lg font-medium ${isSessionActive
//                                     ? 'bg-red-500 hover:bg-red-600'
//                                     : 'bg-gray-400 cursor-not-allowed'
//                                 }`}
//                         >
//                             <Square className="h-4 w-4" />
//                             <span>End Session</span>
//                         </button>

//                         {/* Close */}
//                         <button
//                             onClick={() => setIsOpen(false)}
//                             className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//                         >
//                             <X className="h-6 w-6 text-gray-500" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Session Status Banner */}
//                 {isSessionActive && (
//                     <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
//                         <div className="flex items-center space-x-3">
//                             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
//                             <span className="text-sm text-green-700 font-semibold">
//                                 🎯 Session is running... Keep up the great work!
//                             </span>
//                         </div>
//                     </div>
//                 )}

//                 {/* Stats Cards */}
//                 <div className="p-6 grid grid-cols-2 md:grid-cols-6 gap-4">
//                     {/* Total Session */}
//                     <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow">
//                         <div className="flex justify-between mb-3">
//                             <Clock className="h-5 w-5 text-blue-600" />
//                             <span className="text-[10px] text-gray-600 font-medium">
//                                 Login: {new Date(loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </span>
//                         </div>
//                         <div className="text-lg font-bold text-gray-900 mb-1">
//                             {getSessionTime()}
//                         </div>
//                         <div className="text-xs text-gray-600 font-medium">Total Session</div>
//                     </div>

//                     {/* Active Work Time */}
//                     <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow">
//                         <div className="flex items-center space-x-2 mb-3">
//                             <TrendingUp className="h-5 w-5 text-green-600" />
//                             <div className={`w-2.5 h-2.5 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
//                         </div>
//                         <div className="text-lg font-bold text-gray-900 mb-1">
//                             {getWorkTime()}
//                         </div>
//                         <div className="text-xs text-gray-600 font-medium">Active Work Time</div>
//                     </div>

//                     {/* Break Time */}
//                     <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow">
//                         <div className="flex items-center justify-between mb-3">
//                             <Coffee className="h-5 w-5 text-orange-600" />
//                             <span className="text-xs text-gray-600 font-medium">
//                                 {breakHistory.length} breaks
//                             </span>
//                         </div>
//                         <div className="text-lg font-bold text-gray-900 mb-1">
//                             {formatDuration(totalBreakDuration + (isOnBreak && breakStartTime ? Math.floor((currentTime - breakStartTime) / 1000) : 0))}
//                         </div>
//                         <div className="text-xs text-gray-600 font-medium">Break Time</div>
//                     </div>

//                     {/* Activity Types */}
//                     <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow">
//                         <div className="flex items-center space-x-2 mb-3">
//                             <Activity className="h-5 w-5 text-purple-600" />
//                             <span className="text-xs text-gray-600 font-medium">Today</span>
//                         </div>
//                         <div className="text-lg font-bold text-gray-900 mb-1">
//                             {activityHistory.length}
//                         </div>
//                         <div className="text-xs text-gray-600 font-medium">Activities</div>
//                     </div>

//                     {/* Productivity Score */}
//                     <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-indigo-500 rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow">
//                         <div className="flex items-center space-x-2 mb-3">
//                             <User className="h-5 w-5 text-indigo-600" />
//                             <span className="text-xs text-green-600 font-bold">
//                                 Excellent
//                             </span>
//                         </div>
//                         <div className="text-lg font-bold text-gray-900 mb-1">100%</div>
//                         <div className="text-xs text-gray-600 font-medium">Productivity</div>
//                     </div>

//                     {/* Session Status */}
//                     <div className={`bg-gradient-to-br ${isSessionActive ? 'from-green-50 to-green-100 border-green-500' : 'from-red-50 to-red-100 border-red-500'} border-l-4 rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow`}>
//                         <div className="flex items-center space-x-2 mb-3">
//                             <User
//                                 className={`h-5 w-5 ${isSessionActive ? 'text-green-600' : 'text-red-600'}`}
//                             />
//                             <span className={`text-xs font-bold ${isSessionActive ? 'text-green-600' : 'text-red-600'}`}>
//                                 {isSessionActive ? 'ACTIVE' : 'INACTIVE'}
//                             </span>
//                         </div>
//                         <div className="text-lg font-bold text-gray-900 mb-1">
//                             {isSessionActive ? 'Running' : 'Stopped'}
//                         </div>
//                         <div className="text-xs text-gray-600 font-medium">Status</div>
//                     </div>
//                 </div>

//                 {/* Activity Grid */}
//                 <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {/* Recent Activities */}
//                     <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
//                         <div className="p-5 bg-gradient-to-r from-blue-500 to-blue-600 border-b">
//                             <h3 className="text-lg font-bold text-white">Recent Activities</h3>
//                         </div>
//                         <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
//                             {activityHistory.length > 0 ? (
//                                 activityHistory.slice(0, 10).map((activity, index) => (
//                                     <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                                         <div className={`w-3 h-3 rounded-full mt-1.5 ${activity.type === 'start_session' ? 'bg-green-500' :
//                                                 activity.type === 'end_session' ? 'bg-red-500' :
//                                                     activity.type === 'start_break' ? 'bg-orange-500' :
//                                                         'bg-blue-500'
//                                             }`}></div>
//                                         <div className="flex-1 min-w-0">
//                                             <p className="text-sm font-semibold text-gray-900">{activity.label}</p>
//                                             <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
//                                             {activity.details && (
//                                                 <p className="text-xs text-gray-600 mt-1 italic">{activity.details}</p>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className="text-center text-gray-500 py-12">
//                                     <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//                                     <p className="text-sm font-medium">No activities yet</p>
//                                     <p className="text-xs text-gray-400 mt-1">Start a session to begin tracking</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Activity Breakdown */}
//                     <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
//                         <div className="p-5 bg-gradient-to-r from-purple-500 to-purple-600">
//                             <h3 className="text-lg font-bold text-white">Activity Breakdown</h3>
//                         </div>
//                         <div className="p-5 flex flex-col items-center justify-center h-64">
//                             {breakHistory.length > 0 ? (
//                                 <div className="text-center">
//                                     <div className="text-5xl font-bold text-purple-600 mb-2">{breakHistory.length}</div>
//                                     <p className="text-sm text-gray-700 font-medium">Breaks taken today</p>
//                                     <div className="mt-4 space-y-2">
//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-600">Total Break Time:</span>
//                                             <span className="font-bold text-gray-900">{formatDuration(totalBreakDuration)}</span>
//                                         </div>
//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-600">Avg Break:</span>
//                                             <span className="font-bold text-gray-900">{formatDuration(Math.floor(totalBreakDuration / breakHistory.length))}</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="text-center">
//                                     <Coffee className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//                                     <p className="text-sm text-gray-500 font-medium">No breaks taken yet</p>
//                                     <p className="text-xs text-gray-400 mt-1">Take breaks to stay productive!</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Activity Insights */}
//                     <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
//                         <div className="p-5 bg-gradient-to-r from-green-500 to-green-600">
//                             <h3 className="text-lg font-bold text-white">Activity Insights</h3>
//                         </div>
//                         <div className="p-5">
//                             <div className="space-y-4">
//                                 <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
//                                     <span className="text-sm text-gray-700 font-medium">📈 Productivity</span>
//                                     <span className="text-sm font-bold text-green-600">High</span>
//                                 </div>
//                                 <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
//                                     <span className="text-sm text-gray-700 font-medium">⏳ Avg Break</span>
//                                     <span className="text-sm font-bold text-blue-600">
//                                         {breakHistory.length > 0 ? formatDuration(Math.floor(totalBreakDuration / breakHistory.length)) : '0m'}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
//                                     <span className="text-sm text-gray-700 font-medium">⚡ Efficiency</span>
//                                     <span className="text-sm font-bold text-purple-600">Stable</span>
//                                 </div>
//                                 <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
//                                     <span className="text-sm text-gray-700 font-medium">🎯 Session</span>
//                                     <span className={`text-sm font-bold ${isSessionActive ? 'text-green-600' : 'text-red-600'}`}>
//                                         {isSessionActive ? 'Active' : 'Inactive'}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Break History Table */}
//                 <div className="px-6 pb-6">
//                     <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
//                         <div className="p-5 bg-gradient-to-r from-orange-500 to-orange-600">
//                             <h3 className="text-lg font-bold text-white">Smart Break History</h3>
//                         </div>
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                                     <tr>
//                                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Break #</th>
//                                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
//                                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Start Time</th>
//                                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">End Time</th>
//                                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Duration</th>
//                                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
//                                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Efficiency</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {breakHistory.length > 0 ? (
//                                         breakHistory.map((breakItem, index) => (
//                                             <tr key={index} className="hover:bg-gray-50 transition-colors">
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{breakItem.number}</td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
//                                                         {breakItem.type}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{breakItem.startTime}</td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{breakItem.endTime}</td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{breakItem.duration}</td>
//                                                 <td className="px-6 py-4 text-sm text-gray-600">{breakItem.details}</td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
//                                                         {breakItem.efficiency}
//                                                     </span>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={7} className="px-6 py-20 text-center">
//                                                 <Coffee className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                                                 <p className="text-sm text-gray-500 font-semibold mb-1">No breaks taken today</p>
//                                                 <p className="text-xs text-gray-400">Start working and take breaks when needed</p>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Break Types Modal */}
//             {isBreakTypesOpen && (
//                 <BreakTypesModal
//                     isOpen={isBreakTypesOpen}
//                     onClose={() => setIsBreakTypesOpen(false)}
//                     onSelectBreak={handleStartBreak}
//                 />
//             )}
//         </div>
//     );
// };

// export default ActivityTrackerModal;