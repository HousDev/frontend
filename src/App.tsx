import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ActivityProvider } from '@/contexts/ActivityContext';
import { SystemSettingsProvider } from '@/contexts/SystemSettingsContext'; // ✅ Import SystemSettingsProvider
import { Toaster } from '@/components/ui/Toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import 'react-phone-input-2/lib/style.css';
import useDynamicHead from "@/hooks/useDynamicHead";
// Layouts

import DashboardLayout from '@/layouts/DashboardLayout';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import PublicPropertiesPage from '@/pages/public/PublicPropertiesPage';
import PublicPropertyDetailPage from '@/pages/public/PublicPropertyDetailPage';
import AboutPage from '@/pages/public/AboutPage';
import ServicesPage from '@/pages/public/ServicesPage';


// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Dashboard Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import LeadsPage from '@/pages/dashboard/LeadsPage';
import LeadDetailPage from '@/pages/dashboard/LeadDetailPage';
import PropertyDetailPage from '@/pages/dashboard/PropertyDetailPage';
import ActivitiesPage from '@/pages/dashboard/ActivitiesPage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import UsersPage from '@/pages/dashboard/UsersPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';

// Role-specific Dashboards
import AdminDashboard from '@/pages/dashboards/AdminDashboard';
import ManagerDashboard from '@/pages/dashboards/ManagerDashboard';
import AgentDashboard from '@/pages/dashboards/AgentDashboard';
import SellerDashboard from '@/pages/dashboards/SellerDashboard';
import BuyerDashboard from '@/pages/dashboards/BuyerDashboard';

// Settings Pages
import RolesPermissionsPage from '@/pages/settings/RolesPermissionsPage';
import IntegrationsPage from '@/pages/settings/IntegrationsPage';
import AISettingsPage from '@/pages/settings/AISettingsPage';
import MasterDataPage from '@/pages/settings/MasterDataPage';
import ImportExportPage from '@/pages/settings/ImportExportPage';

// Communication Hub
import CommunicationHubPage from '@/pages/communication/CommunicationHubPage';

// Additional Dashboard Pages
import BuyersPage from '@/pages/dashboard/BuyersPage';
import PropertiesPage from '@/pages/dashboard/PropertiesPage';
import SellersPage from '@/pages/dashboard/SellersPage';
import DocumentCenter from '@/pages/dashboard/DocumentCenter';
import AccountsPage from '@/pages/dashboard/AccountsPage';
import VendorDirectoryPage from '@/pages/dashboard/VendorDirectoryPage';

import { ToastContainer } from 'react-toastify';
import TemplateCenter from './pages/dashboard/TemplateCenter';
import BlogsPage from './pages/public/BlogsPage';
import ContactUsPage from './pages/public/ContactUsPage';
import PublicHeader from './pages/public/PublicHeader';
import BlogManagement from './pages/dashboard/BlogManagement';
import AITraining from './pages/dashboard/AITraining';
import ScrollToTop from './components/ui/ScrollToTop';
import ContactMessagesManagement from './pages/dashboard/ContactMessagesManagement';
import { Helmet } from "react-helmet";
import AboutPageCMS from './pages/dashboard/AboutPageCMS';
import ContactPageCMS from './pages/dashboard/ContactPageCMS';
import FooterPagesCMS from './pages/dashboard/FooterPagesCMS';
import ServicesPageCMS from './pages/dashboard/ServicesPageCMS';

// 🎯 Buyer Portal Components
import StandaloneBuyerAccountPage from './components/buyers/StandaloneBuyerAccountPage';
import StandaloneSellerAccountPage from './components/sellers/StandaloneSellerAccountPage';
import VariableCenter from './pages/settings/VariableCenter';
import HomePageCMS from './pages/dashboard/HomePageCMS';

function App() {
  useDynamicHead(); // ✅ Automatically set favicon + title
  return (
    <>
      <Helmet>
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <AuthProvider>
        <ActivityProvider>
          {/* ✅ Wrap with SystemSettingsProvider */}
          <SystemSettingsProvider>
            <Router>
              <ScrollToTop smooth={false} />
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* 🎯 SEPARATE BUYER PORTAL ROUTES */}
                  
                  <Route
                    path="/buyer-dashboard/:id"
                    element={
                      <ProtectedRoute>
                        <StandaloneBuyerAccountPage />
                      </ProtectedRoute>
                    }
                  />
                 
                  <Route
                    path="/seller-dashboard/:id"
                    element={
                      <ProtectedRoute>
                        <StandaloneSellerAccountPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Public Routes */}
                  <Route path='/' element={<PublicHeader />} >
                    <Route index element={<HomePage />} />
                    <Route path="properties" element={<PublicPropertiesPage />} />
                    <Route path="properties/:slug" element={<PublicPropertyDetailPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path='blogs' element={<BlogsPage />} />
                    <Route path="/blogs/:slug" element={<BlogsPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="contact" element={<ContactUsPage />} />
                  </Route>

                  {/* Auth Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />

                  {/* Protected Dashboard Routes (EXISTING - NO CHANGE) */}
                  <Route
                    path="/dashboard/*"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Role-specific dashboards */}
                    <Route index element={<DashboardPage />} />
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="manager" element={<ManagerDashboard />} />
                    <Route path="agent" element={<AgentDashboard />} />
                    {/* <Route path="seller" element={<SellerDashboard />} /> */}
                    {/* <Route path="buyer" element={<BuyerDashboard />} /> */}

                    {/* Core CRM/CMS features */}
                    <Route path="leads" element={<LeadsPage />} />
                    <Route path="leads/:id" element={<LeadDetailPage />} />
                    <Route path="buyers" element={<BuyersPage />} />
                    <Route path="buyers-account/:id" element={<StandaloneBuyerAccountPage />} />
                    <Route path="properties" element={<PropertiesPage />} />
                    <Route path="properties/:id" element={<PropertyDetailPage />} />
                    <Route path="sellers" element={<SellersPage />} />
                    <Route path="sellers-account/:id" element={<StandaloneSellerAccountPage />} />
                    <Route path="document-center" element={<DocumentCenter />} />

                    {/* CMS Features */}

                    <Route path='home-manager'element={<HomePageCMS/>}/>
                    <Route path='blog-manager' element={<BlogManagement />} />
                    <Route path='about-cms' element={<AboutPageCMS />} />
                    <Route path='contact-cms' element={<ContactPageCMS />} /> 
                    <Route path='footer-cms' element={<FooterPagesCMS />} />
                    <Route path='service-cms'element={<ServicesPageCMS/>}/>

                    <Route path='contact-messages' element={<ContactMessagesManagement />} />
                    <Route path='ai-training' element={<AITraining />} />
                    <Route path='template-center' element={<TemplateCenter />} />
                    <Route path="accounts" element={<AccountsPage />} />
                    <Route path="vendors" element={<VendorDirectoryPage />} />
                    <Route path="activities" element={<ActivitiesPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="profile" element={<SettingsPage />} />

                    {/* Communication */}
                    <Route path="communication" element={<CommunicationHubPage />} />

                    {/* Settings */}
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="settings/roles-permissions" element={<RolesPermissionsPage />} />
                    <Route path="settings/integrations" element={<IntegrationsPage />} />
                    <Route path="settings/ai" element={<AISettingsPage />} />
                    <Route path="settings/master-data" element={<MasterDataPage />} />
                    <Route path="settings/veriable-center" element={<VariableCenter />} />

                    <Route path="settings/import-export" element={<ImportExportPage />} />
                  </Route>

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <Toaster />
              </div>
            </Router>
          </SystemSettingsProvider>
        </ActivityProvider>
      </AuthProvider>
    </>
  );
}

export default App;