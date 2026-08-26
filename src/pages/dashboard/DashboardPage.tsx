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
import { ownerAPI } from '@/lib/ownerAPI';
import { tenantAPI } from '@/lib/tenantAPI';
import { visitsAPI } from '@/lib/visitsAPI';
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
  const [ownersList, setOwnersList] = useState<any[]>([]);
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [visitsList, setVisitsList] = useState<any[]>([]);
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

  const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.rows)) return res.rows;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.visits)) return res.visits;
    if (Array.isArray(res.buyers)) return res.buyers;
    if (Array.isArray(res.sellers)) return res.sellers;
    if (Array.isArray(res.owners)) return res.owners;
    if (Array.isArray(res.tenants)) return res.tenants;
    if (Array.isArray(res.properties)) return res.properties;
    if (Array.isArray(res.leads)) return res.leads;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.rows)) return res.data.rows;
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    let leadsList: any[] = [];
    let propsList: any[] = [];
    let buyersData: any[] = [];
    let sellersData: any[] = [];
    let ownersData: any[] = [];
    let tenantsData: any[] = [];
    let visitsData: any[] = [];
    let usersData: any[] = [];

    try {
      const [leadsResp, propsResp, buyersResp, sellersResp, ownersResp, tenantsResp, visitsResp, usersResp] = await Promise.all([
        leadsAPI.getLeads().catch(err => { console.error("leadsAPI fetch failed:", err); return null; }),
        propertiesAPI.getProperties().catch(err => { console.error("propertiesAPI fetch failed:", err); return null; }),
        buyerAPI.getAll().catch(err => { console.error("buyerAPI fetch failed:", err); return null; }),
        sellerAPI.getAll().catch(err => { console.error("sellerAPI fetch failed:", err); return null; }),
        ownerAPI.getAll().catch(err => { console.error("ownerAPI fetch failed:", err); return null; }),
        tenantAPI.getAll().catch(err => { console.error("tenantAPI fetch failed:", err); return null; }),
        visitsAPI.getAllVisits().catch(err => { console.error("visitsAPI fetch failed:", err); return null; }),
        usersAPI.getAllUsers().catch(err => { console.error("usersAPI fetch failed:", err); return null; }),
      ]);

      leadsList = extractArray(leadsResp);
      propsList = extractArray(propsResp);
      buyersData = extractArray(buyersResp);
      sellersData = extractArray(sellersResp);
      ownersData = extractArray(ownersResp);
      tenantsData = extractArray(tenantsResp);
      visitsData = extractArray(visitsResp);
      usersData = extractArray(usersResp);
    } catch (err) {
      console.error("Error fetching dashboard datasets:", err);
    }

    if (leadsList.length) setAllLeads(sortDescBy(leadsList, ['updated_at', 'created_at', 'updatedAt', 'createdAt']));
    else setAllLeads([]);

    if (propsList.length) setAllProperties(sortDescBy(propsList, ['updated_at', 'created_at', 'updatedAt', 'createdAt']));
    else setAllProperties([]);

    setBuyersList(buyersData);
    setSellersList(sellersData);
    setOwnersList(ownersData);
    setTenantsList(tenantsData);
    setVisitsList(visitsData);
    setAllUsers(usersData);

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
    const userRole = user?.role?.toLowerCase() || '';

    // 1. Presales Executive
    if (userRole === 'presales' || userRole === 'presales_executive' || userRole === 'telecaller') {
      return (
        <PresalesExecutiveDashboard
          user={user}
          allLeads={roleScopedLeads}
          allProperties={allProperties}
          buyersList={buyersList}
          sellersList={sellersList}
          ownersList={ownersList}
          tenantsList={tenantsList}
          visitsList={visitsList}
          allUsers={allUsers}
          stats={stats}
          onRefreshData={fetchData}
        />
      );
    }

    // 2. Sales Executive
    if (userRole === 'sales' || userRole === 'sales_executive' || userRole === 'field_executive' || userRole === 'agent') {
      return (
        <SalesExecutiveDashboard
          user={user}
          allLeads={roleScopedLeads}
          allProperties={allProperties}
          buyersList={buyersList}
          sellersList={sellersList}
          ownersList={ownersList}
          tenantsList={tenantsList}
          visitsList={visitsList}
          allUsers={allUsers}
          stats={stats}
          onRefreshData={fetchData}
        />
      );
    }

    // 3. Manager
    if (userRole === 'manager' || userRole === 'team_lead' || userRole === 'sales_manager') {
      return (
        <ManagerDashboard
          user={user}
          allLeads={roleScopedLeads}
          allProperties={allProperties}
          buyersList={buyersList}
          sellersList={sellersList}
          ownersList={ownersList}
          tenantsList={tenantsList}
          visitsList={visitsList}
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
        ownersList={ownersList}
        tenantsList={tenantsList}
        visitsList={visitsList}
        allUsers={allUsers}
        stats={stats}
        onRefreshData={fetchData}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-2.5 sm:p-3.5 pb-16">
        {renderRoleDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;