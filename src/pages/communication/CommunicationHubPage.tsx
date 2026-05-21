// import React from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
// import Button from '@/components/ui/Button';
// import { Mail, Phone, MessageSquare, Calendar, Users, Send } from 'lucide-react';

// const CommunicationHubPage: React.FC = () => {
//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
//           <p className="text-muted-foreground">
//             Manage all communications with leads and clients
//           </p>
//         </div>
//         <Button>
//           <Send className="mr-2 h-4 w-4" />
//           New Message
//         </Button>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
//             <Mail className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">24</div>
//             <p className="text-xs text-muted-foreground">
//               +2 from last month
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Phone Calls</CardTitle>
//             <Phone className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">148</div>
//             <p className="text-xs text-muted-foreground">
//               +12% from last week
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Messages</CardTitle>
//             <MessageSquare className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">573</div>
//             <p className="text-xs text-muted-foreground">
//               +8% from last week
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Meetings</CardTitle>
//             <Calendar className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">89</div>
//             <p className="text-xs text-muted-foreground">
//               +5 scheduled today
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Communications</CardTitle>
//             <CardDescription>Latest interactions with leads and clients</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex items-center space-x-4">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
//                   <Mail className="h-4 w-4 text-blue-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium">Email to John Smith</p>
//                   <p className="text-sm text-muted-foreground">Property inquiry follow-up</p>
//                 </div>
//                 <div className="text-sm text-muted-foreground">2h ago</div>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
//                   <Phone className="h-4 w-4 text-green-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium">Call with Sarah Johnson</p>
//                   <p className="text-sm text-muted-foreground">Property viewing scheduled</p>
//                 </div>
//                 <div className="text-sm text-muted-foreground">4h ago</div>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
//                   <MessageSquare className="h-4 w-4 text-purple-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium">Message from Mike Wilson</p>
//                   <p className="text-sm text-muted-foreground">Contract negotiation update</p>
//                 </div>
//                 <div className="text-sm text-muted-foreground">6h ago</div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Communication Tools</CardTitle>
//             <CardDescription>Quick access to communication features</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-3">
//               <Button variant="outline" className="justify-start">
//                 <Mail className="mr-2 h-4 w-4" />
//                 Email Templates
//               </Button>
//               <Button variant="outline" className="justify-start">
//                 <MessageSquare className="mr-2 h-4 w-4" />
//                 SMS Campaigns
//               </Button>
//               <Button variant="outline" className="justify-start">
//                 <Calendar className="mr-2 h-4 w-4" />
//                 Schedule Meeting
//               </Button>
//               <Button variant="outline" className="justify-start">
//                 <Users className="mr-2 h-4 w-4" />
//                 Group Messages
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default CommunicationHubPage;

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Mail, Phone, MessageSquare, Calendar, Users, Send, 
  TrendingUp, Clock, CheckCircle, ArrowRight, 
  Smartphone, Video, FileText, AlertCircle, Star,
  Activity, BarChart3, Target, Award
} from 'lucide-react';

// Resale Theme Colors (matching ManagerDashboard)
const RESALE = {
  navy: '#0f2b3d',
  navyLight: '#f0f4f8',
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
const ToolCard = ({ icon: Icon, title, description, color }: any) => (
  <div className="flex items-start space-x-3 p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer group" style={{ borderColor: '#e2e8f0' }}>
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
    { icon: Mail, title: "Email Templates", description: "Create and manage email templates", color: "#3b82f6" },
    { icon: MessageSquare, title: "SMS Campaigns", description: "Send bulk SMS to leads", color: "#10b981" },
    { icon: Calendar, title: "Schedule Meeting", description: "Book meetings with clients", color: "#8b5cf6" },
    { icon: Users, title: "Group Messages", description: "Communicate with teams", color: RESALE.orange },
    { icon: FileText, title: "Document Templates", description: "Proposals and agreements", color: "#ef4444" },
    { icon: Smartphone, title: "WhatsApp Integration", description: "Connect via WhatsApp", color: "#25D366" },
  ];

  // Quick stats
  const quickStats = [
    { label: "Response Rate", value: "92%", icon: CheckCircle, color: "#10b981" },
    { label: "Avg Response Time", value: "2.4h", icon: Clock, color: "#f59e0b" },
    { label: "Open Rate", value: "68%", icon: Activity, color: "#3b82f6" },
    { label: "Conversion", value: "24%", icon: Target, color: RESALE.orange },
  ];

  return (
    <div style={{ backgroundColor: RESALE.navyLight, minHeight: '100vh' }}>
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: RESALE.navy }}>Communication Hub</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage all communications with leads and clients</p>
          </div>
          <Button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: RESALE.orange }}>
            <Send size={16} />
            <span>New Message</span>
          </Button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Stats Row */}
        <div className="bg-white rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 border flex flex-wrap items-center justify-between gap-3" style={{ borderColor: '#e2e8f0' }}>
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
        <div className="mt-5 sm:mt-6">
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
        </div>

        {/* Tip Section */}
        <div className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-xl bg-white border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${RESALE.orange}15` }}>
              <AlertCircle size={16} style={{ color: RESALE.orange }} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: RESALE.navy }}>Quick Tip</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Use email templates to save time on common responses. You can create and manage templates from the Email Templates section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHubPage;