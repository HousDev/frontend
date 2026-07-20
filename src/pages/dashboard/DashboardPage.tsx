// src/pages/dashboard/DashboardPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building, Activity, TrendingUp, Calendar, ArrowRight, Plus,
  Clock, Sparkles, Zap, Target, Trophy, Bell, Heart, Star, Award,
  Coffee, Sun, Moon, Brain, Briefcase, DollarSign, Home, Smile,
  Lightbulb, Shield, Gem, Crown, MessageSquare, ThumbsUp, LogOut,
  X, ChevronRight, Gift, PieChart, Building2, DoorOpen, CreditCard,
  Phone, Mail, MapPin, Search, FileText, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { leadsAPI } from '@/lib/leadAPI';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { buyerAPI } from '@/lib/buyerAPI';
import { sellerAPI } from '@/lib/sellersAPI';
import { usersAPI } from '@/lib/api';
import { filterLeadsByRole } from '@/utils/roleBasedLeadFilter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';

import PresalesExecutiveDashboard from './components/roleDashboards/PresalesExecutiveDashboard';
import SalesExecutiveDashboard from './components/roleDashboards/SalesExecutiveDashboard';
import ManagerDashboard from './components/roleDashboards/ManagerDashboard';
import AdminDashboard from './components/roleDashboards/AdminDashboard';

// ─── Theme ────────────────────────────────────────────────────────────────────
const NAVY = '#0c3854';
const ORANGE = '#e87722';
const NAVY_LIGHT = '#f0f4f8';
const ORANGE_LIGHT = '#fff4eb';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DashboardStats {
  leads: { total_leads: number; new_leads: number; converted_leads: number; today_leads: number };
  properties: { total_properties: number; available_properties: number; sold_properties: number; today_listings: number };
  activities: { total_activities: number; pending_activities: number; today_activities: number; upcoming_week_activities: number };
}

interface RecentItem {
  id: number | string;
  title?: string; name?: string; full_name?: string; property_title?: string; unit_name?: string;
  first_name?: string; last_name?: string; display_name?: string; contact_name?: string;
  email?: string; phone?: string; description?: string; created_at?: string | null;
  createdAt?: string | null; updated_at?: string | null; updatedAt?: string | null;
  status?: string; type?: string; city?: string; location?: string; unit_type?: string;
  bhk?: string | number; price?: string | number; start_at?: string | null; due_at?: string | null;
  [k: string]: any;
}

interface MotivationalMessage {
  id: number; text: string; language: 'english' | 'hindi' | 'marathi';
  category: 'motivation' | 'energy' | 'focus' | 'success' | 'teamwork' | 'wellness' | 'growth' | 'reward';
  icon: React.ReactNode; roles: string[]; timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any'; forManager?: boolean;
}

const MOTIVATIONAL_MESSAGES: MotivationalMessage[] = [
  { id: 1, text: "Every call you make is a step closer to a deal. Keep dialing! 📞", language: 'english', category: 'motivation', icon: <Zap className="h-4 w-4" />, roles: ['sales', 'presales', 'team leader'], timeOfDay: 'afternoon' },
  { id: 2, text: "Great teams are built one interaction at a time. Make every conversation count! 👥", language: 'english', category: 'teamwork', icon: <Users className="h-4 w-4" />, roles: ['manager', 'team leader', 'sales'], forManager: true },
  { id: 3, text: "Focus on the process, and the results will follow. Stay consistent! 🎯", language: 'english', category: 'focus', icon: <Target className="h-4 w-4" />, roles: ['presales', 'sales', 'manager'], timeOfDay: 'morning' },
  { id: 4, text: "Energy is contagious. Your positivity can uplift the entire team! ⚡", language: 'english', category: 'energy', icon: <Sparkles className="h-4 w-4" />, roles: ['all'] },
  { id: 5, text: "Each property sold is a dream fulfilled. Keep making dreams come true! 🏠", language: 'english', category: 'success', icon: <Trophy className="h-4 w-4" />, roles: ['sales', 'presales'] },
  { id: 6, text: "हर कॉल नई संभावना लाती है। लगातार कोशिश करते रहें! 💪", language: 'hindi', category: 'motivation', icon: <Zap className="h-4 w-4" />, roles: ['sales', 'presales', 'team leader'] },
  { id: 7, text: "टीम की ताकत ही असली ताकत है। साथ मिलकर काम करें! 🤝", language: 'hindi', category: 'teamwork', icon: <Users className="h-4 w-4" />, roles: ['manager', 'team leader'], forManager: true },
  { id: 8, text: "प्रत्येक कॉल नवीन संधी आणते. सतत प्रयत्न करा! 🌟", language: 'marathi', category: 'motivation', icon: <Zap className="h-4 w-4" />, roles: ['sales', 'presales'] },
  { id: 9, text: "संघाची शक्ती खरी शक्ती आहे. एकत्र काम करूया! 👨‍👩‍👧‍👦", language: 'marathi', category: 'teamwork', icon: <Users className="h-4 w-4" />, roles: ['manager', 'team leader', 'sales'], forManager: true },
  { id: 10, text: "Remember to take breaks! A refreshed mind performs better. ☕", language: 'english', category: 'wellness', icon: <Coffee className="h-4 w-4" />, roles: ['all'], timeOfDay: 'afternoon' },
  { id: 11, text: "Your health is your wealth. Stand up and stretch for 5 minutes! 🧘", language: 'english', category: 'wellness', icon: <Heart className="h-4 w-4" />, roles: ['all'] },
  { id: 12, text: "Every challenge is an opportunity to grow. Embrace it! 🌱", language: 'english', category: 'growth', icon: <TrendingUp className="h-4 w-4" />, roles: ['all'] },
  { id: 13, text: "Top performer this week gets a special treat! Aim for the stars! ⭐", language: 'english', category: 'reward', icon: <Award className="h-4 w-4" />, roles: ['sales', 'presales'], timeOfDay: 'morning' },
];

interface EmployeeBenefit {
  id: number; title: string; description: string; icon: React.ReactNode;
  category: 'financial' | 'health' | 'career' | 'wellness' | 'recognition'; forRoles: string[];
}
const EMPLOYEE_BENEFITS: EmployeeBenefit[] = [
  { id: 1, title: "Performance Bonus", description: "Earn up to 20% of your monthly salary as performance bonus", icon: <DollarSign className="h-5 w-5" />, category: 'financial', forRoles: ['sales', 'presales', 'manager'] },
  { id: 2, title: "Health Insurance", description: "Comprehensive health coverage for you and your family", icon: <Heart className="h-5 w-5" />, category: 'health', forRoles: ['all'] },
  { id: 3, title: "Skill Development", description: "Monthly training sessions and certification support", icon: <Brain className="h-5 w-5" />, category: 'career', forRoles: ['all'] },
  { id: 4, title: "Flexi Hours", description: "2-3 hours flexible timing based on your productivity", icon: <Clock className="h-5 w-5" />, category: 'wellness', forRoles: ['all'] },
  { id: 5, title: "Star Performer Awards", description: "Monthly recognition with gifts and certificates", icon: <Award className="h-5 w-5" />, category: 'recognition', forRoles: ['all'] },
  { id: 6, title: "Team Outings", description: "Quarterly team building activities and outings", icon: <Users className="h-5 w-5" />, category: 'wellness', forRoles: ['all'] },
];

const TEAM_ROLES = {
  'presales': ['motivation', 'focus', 'teamwork', 'growth'],
  'sales': ['motivation', 'success', 'energy', 'focus', 'reward'],
  'manager': ['teamwork', 'motivation', 'focus', 'leadership'],
  'team leader': ['teamwork', 'motivation', 'energy', 'leadership'],
  'default': ['motivation', 'energy', 'teamwork', 'wellness'],
};

interface SelfMotivationTask {
  id: number; task: string; duration: string; benefit: string; icon: React.ReactNode;
}
const SELF_MOTIVATION_TASKS: SelfMotivationTask[] = [
  { id: 1, task: "Power Hour - Focused calling", duration: "60 min", benefit: "High conversion rate during this hour", icon: <Clock className="h-4 w-4" /> },
  { id: 2, task: "Break for mindfulness", duration: "10 min", benefit: "Reduces stress, increases focus", icon: <Brain className="h-4 w-4" /> },
  { id: 3, task: "Review weekly goals", duration: "15 min", benefit: "Stay aligned with targets", icon: <Target className="h-4 w-4" /> },
  { id: 4, task: "Share success story", duration: "5 min", benefit: "Motivates entire team", icon: <MessageSquare className="h-4 w-4" /> },
];

const emptyStats: DashboardStats = {
  leads: { total_leads: 0, new_leads: 0, converted_leads: 0, today_leads: 0 },
  properties: { total_properties: 0, available_properties: 0, sold_properties: 0, today_listings: 0 },
  activities: { total_activities: 0, pending_activities: 0, today_activities: 0, upcoming_week_activities: 0 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getTime = (o: any, keys: string[]) => {
  for (const k of keys) { const v = o?.[k]; if (v) { const t = new Date(v as string).getTime(); if (!Number.isNaN(t)) return t; } }
  return -Infinity;
};
const sortDescBy = (list: any[], keys: string[]) => [...list].sort((a, b) => getTime(b, keys) - getTime(a, keys));
const isSameDayLocal = (d: Date, ref = new Date()) => d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
const safeParseDate = (v?: string | null) => { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; };

interface Notification {
  id: number; type: 'motivation' | 'reminder' | 'achievement' | 'team';
  message: string; timestamp: Date; read: boolean; forManager?: boolean;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState<MotivationalMessage>(MOTIVATIONAL_MESSAGES[0]);
  const [messageHistory, setMessageHistory] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>('default');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [energyLevel, setEnergyLevel] = useState(75);
  const [dailyGoal, setDailyGoal] = useState({ completed: 3, target: 10 });

  const [allLeads, setAllLeads] = useState<RecentItem[]>([]);
  const [allProperties, setAllProperties] = useState<RecentItem[]>([]);
  const [buyersList, setBuyersList] = useState<any[]>([]);
  const [sellersList, setSellersList] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase() || 'default';
      setUserRole(role);
      if (role === 'manager') {
        setNotifications([{ id: 1, type: 'reminder', message: `Remember to check on your team's motivation levels today!`, timestamp: new Date(), read: false, forManager: true }]);
        const reminderInterval = setInterval(() => {
          setNotifications(prev => [{ id: Date.now(), type: 'reminder', message: `Team check-in time! Boost your team's energy with some positive words.`, timestamp: new Date(), read: false, forManager: true }, ...prev]);
        }, 2 * 60 * 60 * 1000);
        return () => clearInterval(reminderInterval);
      }
    }
  }, [user]);

  const getFilteredMessages = (): MotivationalMessage[] => {
    const roleCategories = TEAM_ROLES[userRole as keyof typeof TEAM_ROLES] || TEAM_ROLES.default;
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
    return MOTIVATIONAL_MESSAGES.filter(message => {
      const roleMatch = message.roles.includes('all') || message.roles.includes(userRole) || message.roles.some(() => roleCategories.includes(message.category));
      const timeMatch = !message.timeOfDay || message.timeOfDay === timeOfDay || message.timeOfDay === 'any';
      return roleMatch && timeMatch;
    });
  };

  const getNextMessage = (): MotivationalMessage => {
    const filteredMessages = getFilteredMessages();
    const availableMessages = filteredMessages.filter(msg => !messageHistory.includes(msg.id) || messageHistory.length >= filteredMessages.length);
    if (availableMessages.length === 0) { setMessageHistory([]); return filteredMessages[Math.floor(Math.random() * filteredMessages.length)]; }
    const nextMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];
    setMessageHistory(prev => [...prev, nextMessage.id]);
    return nextMessage;
  };

  const getRandomInterval = () => { const min = 15 * 60 * 1000, max = 20 * 60 * 1000; return Math.floor(Math.random() * (max - min + 1)) + min; };

  useEffect(() => {
    if (!user) return;
    setCurrentMessage(getNextMessage());
    const messageTimer = setInterval(() => {
      const nextMessage = getNextMessage();
      setCurrentMessage(nextMessage);
      setEnergyLevel(prev => Math.min(100, Math.max(20, prev + (Math.random() > 0.5 ? 5 : -5))));
    }, getRandomInterval());
    return () => clearInterval(messageTimer);
  }, [user, userRole]);

  const fetchData = async () => {
    setLoading(true);
    let leadsList: any[] | null = null, propsList: any[] | null = null;
    let buyersData: any[] | null = null, sellersData: any[] | null = null;
    let usersData: any[] | null = null;

    try {
      const [leadsResp, propsResp, buyersResp, sellersResp, usersResp] = await Promise.all([
        leadsAPI.getLeads({ limit: 100 }).catch(() => null),
        propertiesAPI.getProperties({ limit: 100 }).catch(() => null),
        buyerAPI.getAll().catch(() => null),
        sellerAPI.getAll().catch(() => null),
        usersAPI.getAllUsers().catch(() => null),
      ]);

      if (leadsResp) { const d = leadsResp.data ?? leadsResp; if (Array.isArray(d)) leadsList = d; else if (Array.isArray(d?.rows)) leadsList = d.rows; else if (Array.isArray(d?.data)) leadsList = d.data; }
      if (propsResp) { const d = propsResp.data ?? propsResp; if (Array.isArray(d)) propsList = d; else if (Array.isArray(d?.rows)) propsList = d.rows; else if (Array.isArray(d?.data)) propsList = d.data; }

      if (buyersResp) {
        const d = buyersResp.success && Array.isArray(buyersResp.data) ? buyersResp.data : (Array.isArray(buyersResp) ? buyersResp : []);
        buyersData = d;
      }
      if (sellersResp) {
        sellersData = Array.isArray(sellersResp) ? sellersResp : (Array.isArray(sellersResp?.data) ? sellersResp.data : []);
      }
      if (usersResp) {
        usersData = Array.isArray(usersResp) ? usersResp : (Array.isArray(usersResp?.data) ? usersResp.data : []);
      }
    } catch (err) {
      console.error("Error fetching dashboard datasets:", err);
    }

    if (Array.isArray(leadsList)) {
      const sorted = sortDescBy(leadsList, ['updated_at', 'created_at', 'updatedAt', 'createdAt']);
      setAllLeads(sorted);
    }
    if (Array.isArray(propsList)) {
      const sorted = sortDescBy(propsList, ['updated_at', 'created_at', 'updatedAt', 'createdAt']);
      setAllProperties(sorted);
    }
    if (Array.isArray(buyersData)) setBuyersList(buyersData);
    if (Array.isArray(sellersData)) setSellersList(sellersData);
    if (Array.isArray(usersData)) setAllUsers(usersData);

    const nextStats: DashboardStats = JSON.parse(JSON.stringify(emptyStats));
    if (Array.isArray(leadsList)) {
      nextStats.leads.total_leads = leadsList.length;
      nextStats.leads.today_leads = leadsList.reduce((acc, l) => { const d = safeParseDate((l.created_at ?? l.createdAt) as string | undefined); return acc + (d && isSameDayLocal(d) ? 1 : 0); }, 0);
      nextStats.leads.new_leads = leadsList.reduce((acc, l) => acc + (String(l.status ?? '').trim().toLowerCase() === 'new' ? 1 : 0), 0);
      nextStats.leads.converted_leads = leadsList.reduce((acc, l) => acc + (String(l.status ?? '').trim().toLowerCase() === 'converted' ? 1 : 0), 0);
    }
    if (Array.isArray(propsList)) {
      const toLower = (v: unknown) => String(v ?? '').trim().toLowerCase();
      nextStats.properties.total_properties = propsList.length;
      nextStats.properties.available_properties = propsList.filter(p => toLower(p.status) === 'available').length;
      nextStats.properties.sold_properties = propsList.filter(p => toLower(p.status) === 'sold').length;
      nextStats.properties.today_listings = propsList.reduce((acc, p) => { const d = safeParseDate((p.created_at ?? p.createdAt) as string | undefined); return acc + (d && isSameDayLocal(d) ? 1 : 0); }, 0);
    }
    setStats(nextStats);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const roleScopedLeads = useMemo(() => {
    return filterLeadsByRole(user, allLeads, allUsers);
  }, [user, allLeads, allUsers]);

  const getGreeting = () => { const hour = new Date().getHours(); if (hour < 12) return 'Good morning'; if (hour < 18) return 'Good afternoon'; return 'Good evening'; };
  const markNotificationAsRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const sendMotivationToTeam = () => {
    toast.success("Motivation sent to team!");
    setNotifications(prev => [{ id: Date.now(), type: 'team', message: `${user?.first_name} sent team motivation: "Keep up the great work!"`, timestamp: new Date(), read: false }, ...prev]);
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  // Render role-specific dashboard component
  const renderRoleDashboard = () => {
    const role = (user?.role || '').toLowerCase();
    const dept = (user?.department || '').toLowerCase();

    // 1. Presales Executive
    if (dept.includes('presales') && role.includes('executive')) {
      return (
        <PresalesExecutiveDashboard
          user={user}
          allLeads={roleScopedLeads}
          allProperties={allProperties}
          buyersList={buyersList}
          sellersList={sellersList}
          allUsers={allUsers}
          stats={stats}
          onRefreshData={fetchData}
        />
      );
    }

    // 2. Sales Executive
    if (dept.includes('sales') && role.includes('executive')) {
      return (
        <SalesExecutiveDashboard
          user={user}
          allLeads={roleScopedLeads}
          allProperties={allProperties}
          buyersList={buyersList}
          sellersList={sellersList}
          allUsers={allUsers}
          stats={stats}
          onRefreshData={fetchData}
        />
      );
    }

    // 3. Manager
    if (role.includes('manager') || dept.includes('manager')) {
      return (
        <ManagerDashboard
          user={user}
          allLeads={roleScopedLeads}
          allProperties={allProperties}
          buyersList={buyersList}
          sellersList={sellersList}
          allUsers={allUsers}
          stats={stats}
          onRefreshData={fetchData}
        />
      );
    }

    // 4. Admin / Superadmin / Default
    return (
      <AdminDashboard
        user={user}
        allLeads={roleScopedLeads}
        allProperties={allProperties}
        buyersList={buyersList}
        sellersList={sellersList}
        allUsers={allUsers}
        stats={stats}
        onRefreshData={fetchData}
      />
    );
  };

  return (
    <div className="flex min-h-screen" style={{ background: NAVY_LIGHT }}>
      {/* ── Main Layout Wrapper ────────────────────────────────────────── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarVisible ? 'lg:mr-80' : ''}`}>
        <div className="space-y-5 p-4 sm:p-6 pb-24">

          {/* ── Top Header ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>
                {getGreeting()},{' '}
                <span style={{ color: ORANGE }}>{user?.first_name ?? 'User'}</span>!
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#7a95a8' }}>
                Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border"
                style={{ background: sidebarVisible ? NAVY : 'white', color: sidebarVisible ? 'white' : NAVY, borderColor: '#dce5ee' }}
              >
                {sidebarVisible ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" style={{ color: ORANGE }} />}
                <span className="hidden sm:inline">{sidebarVisible ? 'Close Hub' : 'Motivation Hub'}</span>
              </button>
              <Link to="/dashboard/leads">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: ORANGE }}>
                  <Plus className="h-4 w-4" />
                  <span>Add Lead</span>
                </button>
              </Link>
            </div>
          </div>

          {/* ── Motivational Banner ───────────────────────────────────────── */}
          <div className="rounded-xl p-4 sm:p-5 border-l-4 flex flex-wrap items-center gap-4 shadow-sm"
            style={{ background: 'white', borderLeftColor: ORANGE, borderTop: `1px solid #dce5ee`, borderRight: `1px solid #dce5ee`, borderBottom: `1px solid #dce5ee` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${ORANGE}20` }}>
              <span style={{ color: ORANGE }}>{currentMessage.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium" style={{ color: NAVY }}>
                Dear{' '}
                <span className="font-bold" style={{ color: ORANGE }}>{user?.first_name || 'Team Member'}</span>,{' '}
                {currentMessage.text}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="h-4 w-4"
                  style={{ fill: star <= 4 ? ORANGE : 'none', color: star <= 4 ? ORANGE : '#d1d5db' }} />
              ))}
            </div>
          </div>

          {/* ── Dynamic Role-Specific Dashboard ────────────────────────────── */}
          {renderRoleDashboard()}
        </div>
      </div>

      {/* ── Motivation Hub Sidebar ──────────────────────────────────────────── */}
      {sidebarVisible && (
        <div className="fixed right-0 top-0 h-screen w-full sm:w-80 z-40 shadow-2xl overflow-y-auto border-l"
          style={{ background: 'white', borderColor: '#dce5ee' }}>
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pt-14 sm:pt-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: NAVY }}>
                  <Sparkles className="h-4 w-4" style={{ color: ORANGE }} />
                </div>
                <div>
                  <h2 className="font-bold text-sm" style={{ color: NAVY }}>Motivation Hub</h2>
                  <p className="text-xs" style={{ color: '#7a95a8' }}>For {user?.first_name || 'Team Member'}</p>
                </div>
              </div>
              <button onClick={() => setSidebarVisible(false)} className="p-2 rounded-lg hover:bg-[#f0f4f8] transition-colors">
                <X className="h-4 w-4" style={{ color: '#7a95a8' }} />
              </button>
            </div>

            {/* Energy Level */}
            <div className="rounded-xl p-4 border" style={{ background: NAVY_LIGHT, borderColor: '#dce5ee' }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: ORANGE }} />
                  <span className="text-xs font-semibold" style={{ color: NAVY }}>Team Energy</span>
                </div>
                <span className="text-lg font-bold" style={{ color: NAVY }}>{energyLevel}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: '#dce5ee' }}>
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${energyLevel}%`, background: energyLevel > 70 ? '#16a34a' : energyLevel > 40 ? ORANGE : '#dc2626' }} />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: '#7a95a8' }}>
                <span>Low</span><span>High</span>
              </div>
            </div>

            {/* Daily Progress */}
            <div className="rounded-xl p-4 border" style={{ borderColor: '#dce5ee' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7a95a8' }}>Daily Goal</span>
                <Target className="h-4 w-4" style={{ color: ORANGE }} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: NAVY }}>Calls Made</span>
                <span className="text-sm font-bold" style={{ color: NAVY }}>{dailyGoal.completed}/{dailyGoal.target}</span>
              </div>
              <div className="w-full rounded-full h-2 mb-3" style={{ background: '#dce5ee' }}>
                <div className="h-2 rounded-full" style={{ width: `${(dailyGoal.completed / dailyGoal.target) * 100}%`, background: NAVY }} />
              </div>
              <button className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: NAVY }}>Update Progress</button>
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7a95a8' }}>Your Benefits</span>
                <Gift className="h-4 w-4" style={{ color: ORANGE }} />
              </div>
              <div className="space-y-2">
                {EMPLOYEE_BENEFITS.filter(b => b.forRoles.includes('all') || b.forRoles.includes(userRole)).slice(0, 3).map(benefit => (
                  <div key={benefit.id} className="flex items-start gap-3 p-3 rounded-xl border hover:border-orange-200 transition-colors"
                    style={{ borderColor: '#dce5ee' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ORANGE}15` }}>
                      <span style={{ color: ORANGE }}>{benefit.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: NAVY }}>{benefit.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#7a95a8' }}>{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7a95a8' }}>Notifications</span>
                <Bell className="h-4 w-4" style={{ color: ORANGE }} />
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {notifications.slice(0, 5).map(notification => (
                  <div key={notification.id}
                    className="p-3 rounded-xl border cursor-pointer transition-colors"
                    style={{ background: notification.read ? '#f8fafc' : `${NAVY}08`, borderColor: notification.read ? '#dce5ee' : `${NAVY}25` }}
                    onClick={() => markNotificationAsRead(notification.id)}>
                    <div className="flex items-start gap-2">
                      {notification.type === 'motivation' && <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: ORANGE }} />}
                      {notification.type === 'reminder' && <Bell className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: ORANGE }} />}
                      {notification.type === 'achievement' && <Trophy className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: '#16a34a' }} />}
                      {notification.type === 'team' && <Users className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: NAVY }} />}
                      <div>
                        <p className="text-xs" style={{ color: NAVY }}>{notification.message}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#7a95a8' }}>{notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-xs text-center py-4" style={{ color: '#7a95a8' }}>No notifications</p>}
              </div>
            </div>

            {/* Manager Actions */}
            {userRole === 'manager' && (
              <div className="rounded-xl p-4 border" style={{ background: NAVY_LIGHT, borderColor: '#dce5ee' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#7a95a8' }}>Manager Actions</p>
                <div className="space-y-2">
                  <button onClick={sendMotivationToTeam}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: NAVY }}>
                    <MessageSquare className="h-4 w-4" /><span>Send Team Motivation</span>
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold border transition-all hover:opacity-90"
                    style={{ borderColor: ORANGE, color: ORANGE, background: 'white' }}>
                    <Award className="h-4 w-4" /><span>Recognize Achiever</span>
                  </button>
                </div>
              </div>
            )}

            {/* Today's Quick Stats */}
            <div className="rounded-xl p-4 border" style={{ borderColor: '#dce5ee' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#7a95a8' }}>Today's Stats</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: stats.leads.today_leads, label: 'New Leads', color: NAVY },
                  { value: stats.properties.today_listings, label: 'Listings', color: '#16a34a' },
                  { value: stats.leads.converted_leads, label: 'Converted', color: '#7c3aed' },
                  { value: `${energyLevel}%`, label: 'Energy', color: ORANGE },
                ].map(item => (
                  <div key={item.label} className="rounded-lg p-3 text-center" style={{ background: `${item.color}10` }}>
                    <div className="text-xl font-bold" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#7a95a8' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs pb-2" style={{ color: '#7a95a8' }}>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" style={{ color: ORANGE }} />
                <span>Stay Motivated!</span>
              </div>
              <span>Next: ~15 min</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating toggle when sidebar is hidden ───────────────────────────── */}
      {!sidebarVisible && (
        <button onClick={() => setSidebarVisible(true)}
          className="fixed right-4 bottom-6 lg:right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          style={{ background: NAVY }}>
          <Sparkles className="h-5 w-5" style={{ color: ORANGE }} />
        </button>
      )}
    </div>
  );
};

export default DashboardPage;