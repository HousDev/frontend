import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Mail, Phone, MessageSquare, Calendar, Users, Send, 
  TrendingUp, Clock, CheckCircle, ArrowRight, 
  Smartphone, Video, FileText, AlertCircle,
  Activity, BarChart3, Target, Award, MessagesSquare, LayoutDashboard,
  Bot, Sparkles
} from 'lucide-react';
import { ExecutiveChatDesk } from './components/ExecutiveChatDesk';
import { AdminChatMonitor } from './components/AdminChatMonitor';
import { RexAiSessionsMonitor } from './components/RexAiSessionsMonitor';

import { useLocation, useNavigate } from 'react-router-dom';

// Resale Theme Colors
const RESALE = {
  navy: '#0f2b3d',
  navyLight: '#f8fafc',
  navyDark: '#0c3854',
  orange: '#e87722',
  orangeLight: '#f39c12',
  orangeDark: '#d35400',
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, change, changeType, color }: any) => (
  <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow" style={{ borderColor: '#e2e8f0' }}>
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      {change && (
        <span className={`text-xs font-medium flex items-center gap-0.5 ${changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
          <TrendingUp size={12} className={changeType === 'down' ? 'rotate-180' : ''} />
          {change}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// Communication Item Component
const CommunicationItem = ({ icon: Icon, title, subtitle, time, color, bgColor }: any) => (
  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: bgColor }}>
      <Icon size={16} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 truncate">{subtitle}</p>
    </div>
    <div className="text-xs text-gray-400 whitespace-nowrap">{time}</div>
  </div>
);

// Tool Card Component
const ToolCard = ({ icon: Icon, title, description, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className="flex items-start space-x-3 p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer group" 
    style={{ borderColor: '#e2e8f0' }}
  >
    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 group-hover" style={{ color: RESALE.navy }}>{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
  </div>
);

const CommunicationHubPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = String(user?.role || '').toLowerCase().trim();
  const isAdmin = ['admin', 'super_admin'].includes(userRole);

  const isAiSessions = location.pathname.includes('/communication/ai-sessions');
  const isChat = location.pathname.includes('/communication/chat') || isAiSessions;

  // Stats data
  const stats = [
    { icon: Mail, label: "Email Campaigns", value: "24", change: "+2", changeType: "up", color: "#3b82f6" },
    { icon: Phone, label: "Phone Calls", value: "148", change: "+12%", changeType: "up", color: "#10b981" },
    { icon: MessageSquare, label: "Messages", value: "573", change: "+8%", changeType: "up", color: "#8b5cf6" },
    { icon: Calendar, label: "Meetings", value: "89", change: "+5", changeType: "up", color: RESALE.orange },
  ];

  // Recent communications
  const recentCommunications = [
    { icon: Mail, title: "Email to John Smith", subtitle: "Property inquiry follow-up", time: "2h ago", color: "#3b82f6", bgColor: "#3b82f615" },
    { icon: Phone, title: "Call with Sarah Johnson", subtitle: "Property viewing scheduled", time: "4h ago", color: "#10b981", bgColor: "#10b98115" },
    { icon: MessageSquare, title: "Message from Mike Wilson", subtitle: "Contract negotiation update", time: "6h ago", color: "#8b5cf6", bgColor: "#8b5cf615" },
    { icon: Video, title: "Video Call - Team Meeting", subtitle: "Weekly sales review", time: "1d ago", color: RESALE.orange, bgColor: `${RESALE.orange}15` },
  ];

  // Communication tools
  const tools = [
    { icon: Bot, title: "REX AI Sessions", description: "Monitor active AI client interactions", color: "#e87722", onClick: () => navigate("/dashboard/communication/ai-sessions") },
    { icon: MessageSquare, title: "Property Chat Desk", description: "Direct 1-on-1 human property inquiries", color: "#8b5cf6", onClick: () => navigate("/dashboard/communication/chat") },
    { icon: Mail, title: "Email Templates", description: "Create and manage email templates", color: "#3b82f6" },
    { icon: MessageSquare, title: "SMS Campaigns", description: "Send bulk SMS to leads", color: "#10b981" },
    { icon: Calendar, title: "Schedule Meeting", description: "Book meetings with clients", color: "#f59e0b" },
    { icon: Smartphone, title: "WhatsApp Integration", description: "Connect via WhatsApp", color: "#25D366", onClick: () => navigate("/dashboard/whatsapp-crm") },
  ];

  // Quick stats
  const quickStats = [
    { label: "Response Rate", value: "92%", icon: CheckCircle, color: "#10b981" },
    { label: "Avg Response Time", value: "2.4h", icon: Clock, color: "#f59e0b" },
    { label: "Open Rate", value: "68%", icon: Activity, color: "#3b82f6" },
    { label: "Conversion", value: "24%", icon: Target, color: RESALE.orange },
  ];

  if (isChat) {
    return (
      <div className="h-full flex-1 w-full p-2.5 bg-slate-100/70 overflow-hidden flex flex-col min-h-0">
        {/* Sleek Top Mode Switcher */}
        <div className="mb-2 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/communication/chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                !isAiSessions
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MessageSquare size={13} />
              Property Inquiries (Human Desk)
            </button>

            <button
              onClick={() => navigate('/dashboard/communication/ai-sessions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isAiSessions
                  ? 'bg-[#e87722] text-white shadow-xs'
                  : 'bg-orange-50 text-[#e87722] hover:bg-orange-100 border border-orange-200/60'
              }`}
            >
              <Bot size={13} />
              REX AI Sessions
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isAiSessions ? 'bg-white/20 text-white' : 'bg-orange-200 text-orange-900'}`}>
                Live
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-Time Sync Active</span>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {isAiSessions ? (
            <RexAiSessionsMonitor />
          ) : isAdmin ? (
            <AdminChatMonitor />
          ) : (
            <ExecutiveChatDesk />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: RESALE.navyLight, minHeight: '100vh' }}>
      <div className="px-3 sm:px-2 md:px-2 py-2 sm:py-2 max-w-[1700px] mx-auto">
        <div className="space-y-5">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Quick Stats Row */}
            <div className="bg-white rounded-xl p-3 sm:p-4 border flex flex-wrap items-center justify-between gap-3" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex items-center gap-2">
                <Award size={18} style={{ color: RESALE.orange }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: RESALE.navy }}>Performance Metrics</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {quickStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="p-1 rounded-full" style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon size={12} style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="text-sm font-bold" style={{ color: RESALE.navy }}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
              {/* Recent Communications Card */}
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b" style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold" style={{ color: RESALE.navy }}>Recent Communications</CardTitle>
                      <CardDescription className="text-xs">Latest interactions with leads and clients</CardDescription>
                    </div>
                    <button className="text-xs font-medium hover:opacity-80 flex items-center gap-1" style={{ color: RESALE.orange }}>
                      View All <ArrowRight size={12} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y" style={{ borderColor: '#e2e8f0' }}>
                    {recentCommunications.map((comm, index) => (
                      <CommunicationItem key={index} {...comm} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Communication Tools Card */}
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b" style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
                  <div>
                    <CardTitle className="text-base font-bold" style={{ color: RESALE.navy }}>Communication Tools</CardTitle>
                    <CardDescription className="text-xs">Quick access to communication features</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tools.map((tool, index) => (
                      <ToolCard key={index} {...tool} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Chart Section */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b" style={{ borderColor: '#e2e8f0' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold" style={{ color: RESALE.navy }}>Communication Activity</CardTitle>
                    <CardDescription className="text-xs">Weekly communication trends</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="text-xs px-2 py-1 border rounded-lg bg-white" style={{ borderColor: '#e2e8f0' }}>
                      <option>This Week</option>
                      <option>Last Week</option>
                      <option>This Month</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-48 sm:h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 size={48} className="mx-auto mb-3" style={{ color: `${RESALE.orange}40` }} />
                    <p className="text-sm text-gray-500">Communication chart will appear here</p>
                    <p className="text-xs text-gray-400 mt-1">Track emails, calls, and messages over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tip Section */}
            <div className="p-3 sm:p-4 rounded-xl bg-white border" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${RESALE.orange}15` }}>
                  <AlertCircle size={16} style={{ color: RESALE.orange }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: RESALE.navy }}>Quick Tip</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Use the <strong>Property Chat Desk</strong> tab above to respond to active buyer inquiries on listed properties in real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default CommunicationHubPage;