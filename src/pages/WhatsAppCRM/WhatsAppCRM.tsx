// src/pages/WhatsAppCRM.tsx
import { useState } from 'react';
import { MOCK_CONVERSATIONS, MOCK_TEMPLATES } from '@/lib/mockData';
import Sidebar, { Page } from '@/layouts/Sidebar';
import ToastContainer from '@/layouts/Toast';
import TemplatesPage from '@/components/templates/TemplatesPage';
import AnalyticsPage from '@/components/analytics/AnalyticsPage';


import MetaSpendPages from '@/components/analytics/MetaSpendPages';
import InboxPage from '@/components/inbox/InboxPage';
import CampaignsPage from '@/components/campaigns/CampaignsPage';
import ChatbotPage from '@/components/chatboat/ChatbotPage';
import SettingsPage from '@/components/settings/SettingsPages';

export default function WhatsAppCRM() {
    const [activePage, setActivePage] = useState<Page>('inbox');
    const unreadCount = MOCK_CONVERSATIONS.reduce((sum, c) => sum + (c.status !== 'resolved' ? c.unread_count : 0), 0);
    const pendingTemplatesCount = MOCK_TEMPLATES.filter(t => t.status === 'PENDING').length;

    const renderPage = () => {
        switch (activePage) {
            case 'inbox': return <InboxPage />;
            case 'templates': return <TemplatesPage />;
            case 'campaigns': return <CampaignsPage />;
            case 'analytics': return <AnalyticsPage />;
            case 'chatbot': return <ChatbotPage />;
            case 'settings': return <SettingsPage />;
            case 'meta-spend': return <MetaSpendPages />;
            default: return <InboxPage />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar
                activePage={activePage}
                onNavigate={setActivePage}
                unreadCount={unreadCount}
                pendingTemplatesCount={pendingTemplatesCount}
            />
            <main style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                {renderPage()}
            </main>
            <ToastContainer onNavigate={setActivePage} />
        </div>
    );
}