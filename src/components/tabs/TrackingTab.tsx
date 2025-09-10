import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Share,
  Download,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Calendar,
  Star,
  Target,
  TrendingUp,
  Users,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  DollarSign,
  Award,
  Activity,
  Bell,
  Settings,
  Plus,
  Trash2,
  Copy,
  Send,
  Archive,
  Flag,
  Bookmark,
  Heart,
  Shield,
  Crown,
  Gem,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Link,
  QrCode,
  Globe,
  Printer,
  Upload,
  Maximize2,
  Home,
  Car,
  Wifi,
  Dumbbell,
  TreePine,
  Waves
} from 'lucide-react';
import DocumentEditModal from '../creation/DocumentEditModal';
import DocumentDeleteModal from '../creation/DocumentDeleteModal';
import DocumentViewModal from './DocumentViewModal';
import DocumentShareModal from './DocumentShareModal';

const TrackingTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [userRole] = useState('admin'); // This would come from auth context
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: 'Property Sale Agreement - Flat A-404',
      template_name: 'Property Sale Agreement',
      template_id: 1,
      data: {
        seller_name: 'Rajesh Kumar',
        seller_phone: '+91 98765 43210',
        seller_email: 'rajesh.kumar@email.com',
        buyer_name: 'Amit Patel',
        buyer_phone: '+91 76543 21098',
        buyer_email: 'amit.patel@email.com',
        property_address: 'Flat A-404, Skyline Towers, Andheri West, Mumbai',
        property_type: 'Apartment',
        property_area: '1250',
        sale_amount: 25000000,
        token_amount: 500000,
        booking_amount: 1000000,
        sales_executive: 'Admin User',
        document_id: 'PSA001',
        document_date: '2025-01-12'
      },
      status: 'e-sign_pending',
      priority: 'high',
      created_by: 'Admin User',
      assigned_to: 'Sales Executive',
      created_at: '2025-01-12T10:30:00Z',
      updated_at: '2025-01-12T15:45:00Z',
      shared_channels: ['email', 'whatsapp'],
      otp_verified_at: '2025-01-12T14:20:00Z',
      stage_progress: 75,
      tracking_history: [
        {
          id: 1,
          action: 'Document Created',
          timestamp: '2025-01-12T10:30:00Z',
          user: 'Admin User',
          details: 'Document created from Property Sale Agreement template',
          stage: 'created',
          icon: 'FileText'
        },
        {
          id: 2,
          action: 'Shared via Email',
          timestamp: '2025-01-12T11:15:00Z',
          user: 'Admin User',
          details: 'Document sent to buyer (amit.patel@email.com) and seller (rajesh.kumar@email.com)',
          stage: 'shared',
          icon: 'Mail'
        },
        {
          id: 3,
          action: 'Shared via WhatsApp',
          timestamp: '2025-01-12T11:16:00Z',
          user: 'Admin User',
          details: 'Document sent via WhatsApp to both parties',
          stage: 'shared',
          icon: 'MessageCircle'
        },
        {
          id: 4,
          action: 'Document Viewed',
          timestamp: '2025-01-12T13:45:00Z',
          user: 'Rajesh Kumar',
          details: 'Seller opened and viewed the document',
          stage: 'viewed',
          icon: 'Eye'
        },
        {
          id: 5,
          action: 'OTP Verification Initiated',
          timestamp: '2025-01-12T14:10:00Z',
          user: 'Rajesh Kumar',
          details: 'Aadhaar OTP verification process started',
          stage: 'otp_initiated',
          icon: 'Shield'
        },
        {
          id: 6,
          action: 'OTP Verified Successfully',
          timestamp: '2025-01-12T14:20:00Z',
          user: 'Rajesh Kumar',
          details: 'Seller verified identity via Aadhaar OTP (****1234)',
          stage: 'otp_verified',
          icon: 'CheckCircle'
        }
      ]
    },
    {
      id: 2,
      title: 'Society NOC Request - Tower B',
      template_name: 'Society NOC Request',
      template_id: 4,
      data: {
        seller_name: 'Priya Sharma',
        seller_phone: '+91 87654 32109',
        seller_email: 'priya.sharma@email.com',
        buyer_name: 'Rohit Gupta',
        buyer_phone: '+91 65432 10987',
        buyer_email: 'rohit.gupta@email.com',
        property_address: 'Flat B-201, Green Valley Society, Pune',
        property_type: 'Apartment',
        property_area: '980',
        society_name: 'Green Valley Society',
        flat_number: 'B-201',
        sales_executive: 'Manager User',
        document_id: 'NOC002',
        document_date: '2025-01-11'
      },
      status: 'otp_verified',
      priority: 'medium',
      created_by: 'Manager User',
      assigned_to: 'Legal Team',
      created_at: '2025-01-11T09:15:00Z',
      updated_at: '2025-01-12T16:30:00Z',
      shared_channels: ['email'],
      otp_verified_at: '2025-01-12T16:30:00Z',
      stage_progress: 60,
      tracking_history: [
        {
          id: 1,
          action: 'Document Created',
          timestamp: '2025-01-11T09:15:00Z',
          user: 'Manager User',
          details: 'NOC request document created for society approval',
          stage: 'created',
          icon: 'FileText'
        },
        {
          id: 2,
          action: 'Shared via Email',
          timestamp: '2025-01-11T10:00:00Z',
          user: 'Manager User',
          details: 'Document sent to society management committee',
          stage: 'shared',
          icon: 'Mail'
        },
        {
          id: 3,
          action: 'Society Review Started',
          timestamp: '2025-01-12T14:00:00Z',
          user: 'Society Secretary',
          details: 'Society committee started reviewing the NOC request',
          stage: 'under_review',
          icon: 'Eye'
        },
        {
          id: 4,
          action: 'OTP Verified',
          timestamp: '2025-01-12T16:30:00Z',
          user: 'Priya Sharma',
          details: 'Seller verified identity for society NOC process',
          stage: 'otp_verified',
          icon: 'CheckCircle'
        }
      ]
    },
    {
      id: 3,
      title: 'Exclusive Mandate Agreement',
      template_name: 'Exclusive Mandate Agreement',
      template_id: 2,
      data: {
        seller_name: 'Mumbai Properties Ltd',
        seller_phone: '+91 76543 21098',
        seller_email: 'info@mumbaiproperties.com',
        property_address: 'Office 501, Business Tower, BKC, Mumbai',
        property_type: 'Commercial',
        property_area: '1500',
        commission_rate: '2',
        validity_period: '6 months',
        sales_executive: 'Admin User',
        document_id: 'EMA003',
        document_date: '2025-01-10'
      },
      status: 'completed',
      priority: 'low',
      created_by: 'Admin User',
      assigned_to: 'Admin User',
      created_at: '2025-01-10T14:20:00Z',
      updated_at: '2025-01-11T12:45:00Z',
      shared_channels: ['email', 'whatsapp'],
      otp_verified_at: '2025-01-11T10:15:00Z',
      completed_at: '2025-01-11T12:45:00Z',
      stage_progress: 100,
      tracking_history: [
        {
          id: 1,
          action: 'Document Created',
          timestamp: '2025-01-10T14:20:00Z',
          user: 'Admin User',
          details: 'Exclusive mandate agreement created for commercial property',
          stage: 'created',
          icon: 'FileText'
        },
        {
          id: 2,
          action: 'Shared via Email',
          timestamp: '2025-01-10T15:00:00Z',
          user: 'Admin User',
          details: 'Document sent to property owner for review and signing',
          stage: 'shared',
          icon: 'Mail'
        },
        {
          id: 3,
          action: 'Shared via WhatsApp',
          timestamp: '2025-01-10T15:01:00Z',
          user: 'Admin User',
          details: 'Document link shared via WhatsApp for quick access',
          stage: 'shared',
          icon: 'MessageCircle'
        },
        {
          id: 4,
          action: 'Document Reviewed',
          timestamp: '2025-01-11T09:30:00Z',
          user: 'Mumbai Properties Ltd',
          details: 'Property owner reviewed the mandate terms and conditions',
          stage: 'reviewed',
          icon: 'Eye'
        },
        {
          id: 5,
          action: 'OTP Verification',
          timestamp: '2025-01-11T10:15:00Z',
          user: 'Mumbai Properties Ltd',
          details: 'Company representative verified identity via Aadhaar OTP',
          stage: 'otp_verified',
          icon: 'Shield'
        },
        {
          id: 6,
          action: 'Digital Signature',
          timestamp: '2025-01-11T11:30:00Z',
          user: 'Mumbai Properties Ltd',
          details: 'Document digitally signed using e-signature platform',
          stage: 'e_signed',
          icon: 'Award'
        },
        {
          id: 7,
          action: 'Document Completed',
          timestamp: '2025-01-11T12:45:00Z',
          user: 'Admin User',
          details: 'All processes completed. Mandate agreement is now active',
          stage: 'completed',
          icon: 'Crown'
        }
      ]
    },
    {
      id: 4,
      title: 'Token Receipt - Project Phoenix',
      template_name: 'Token Receipt',
      template_id: 3,
      data: {
        seller_name: 'Neha Agarwal',
        seller_phone: '+91 65432 10987',
        seller_email: 'neha.agarwal@email.com',
        buyer_name: 'Vikash Singh',
        buyer_phone: '+91 54321 09876',
        buyer_email: 'vikash.singh@email.com',
        property_address: 'Plot 25, Phoenix City, Bangalore',
        property_type: 'Plot',
        property_area: '2400',
        token_amount: 200000,
        sales_executive: 'Sales Executive',
        document_id: 'TR004',
        document_date: '2025-01-11'
      },
      status: 'shared',
      priority: 'medium',
      created_by: 'Sales Executive',
      assigned_to: 'Sales Executive',
      created_at: '2025-01-11T16:45:00Z',
      updated_at: '2025-01-11T17:30:00Z',
      shared_channels: ['whatsapp'],
      stage_progress: 40,
      tracking_history: [
        {
          id: 1,
          action: 'Document Created',
          timestamp: '2025-01-11T16:45:00Z',
          user: 'Sales Executive',
          details: 'Token receipt generated for plot booking',
          stage: 'created',
          icon: 'FileText'
        },
        {
          id: 2,
          action: 'Shared via WhatsApp',
          timestamp: '2025-01-11T17:30:00Z',
          user: 'Sales Executive',
          details: 'Receipt sent to buyer via WhatsApp',
          stage: 'shared',
          icon: 'MessageCircle'
        }
      ]
    },
    {
      id: 5,
      title: 'Bank NOC Request - HDFC',
      template_name: 'Bank NOC Request',
      template_id: 6,
      data: {
        seller_name: 'Suresh Patel',
        seller_phone: '+91 54321 09876',
        seller_email: 'suresh.patel@email.com',
        property_address: 'Villa 15, Green Valley, Ahmedabad',
        property_type: 'Villa',
        property_area: '2800',
        loan_account: 'HDFC123456789',
        outstanding_amount: 1500000,
        sales_executive: 'Manager User',
        document_id: 'BNR005',
        document_date: '2025-01-13'
      },
      status: 'created',
      priority: 'high',
      created_by: 'Manager User',
      assigned_to: 'Legal Team',
      created_at: '2025-01-13T11:20:00Z',
      updated_at: '2025-01-13T11:20:00Z',
      shared_channels: [],
      stage_progress: 10,
      tracking_history: [
        {
          id: 1,
          action: 'Document Created',
          timestamp: '2025-01-13T11:20:00Z',
          user: 'Manager User',
          details: 'Bank NOC request created for loan closure process',
          stage: 'created',
          icon: 'FileText'
        }
      ]
    },
    {
      id: 6,
      title: 'Booking Form - Luxury Penthouse',
      template_name: 'Booking Form',
      template_id: 7,
      data: {
        buyer_name: 'Arjun Mehta',
        buyer_phone: '+91 98765 55555',
        buyer_email: 'arjun.mehta@email.com',
        property_address: 'Penthouse PH-01, Royal Residency, Bandra, Mumbai',
        property_type: 'Penthouse',
        property_area: '3200',
        booking_amount: 1000000,
        sales_executive: 'Premium Sales Team',
        executive_id: 'PST001',
        executive_phone: '+91 99999 88888',
        executive_email: 'premium@resaleexpert.com',
        document_id: 'BF006',
        document_date: '2025-01-13'
      },
      status: 'shared',
      priority: 'high',
      created_by: 'Premium Sales Team',
      assigned_to: 'Premium Sales Team',
      created_at: '2025-01-13T14:30:00Z',
      updated_at: '2025-01-13T15:15:00Z',
      shared_channels: ['email', 'whatsapp'],
      stage_progress: 50,
      tracking_history: [
        {
          id: 1,
          action: 'Document Created',
          timestamp: '2025-01-13T14:30:00Z',
          user: 'Premium Sales Team',
          details: 'Booking form created for luxury penthouse',
          stage: 'created',
          icon: 'FileText'
        },
        {
          id: 2,
          action: 'Shared via Email',
          timestamp: '2025-01-13T15:00:00Z',
          user: 'Premium Sales Team',
          details: 'Booking form sent to buyer for review and confirmation',
          stage: 'shared',
          icon: 'Mail'
        },
        {
          id: 3,
          action: 'Shared via WhatsApp',
          timestamp: '2025-01-13T15:15:00Z',
          user: 'Premium Sales Team',
          details: 'Quick access link shared via WhatsApp',
          stage: 'shared',
          icon: 'MessageCircle'
        }
      ]
    }
  ]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.data.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.data.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.data.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.template_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
    const matchesTemplate = templateFilter === 'all' || doc.template_name === templateFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesTemplate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed', icon: CheckCircle },
      'e-sign_pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'E-Sign Pending', icon: Clock },
      'otp_verified': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'OTP Verified', icon: Shield },
      'shared': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shared', icon: Send },
      'created': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Created', icon: FileText }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { bg: 'bg-red-100', text: 'text-red-700', label: 'High', icon: AlertCircle },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium', icon: Clock },
      'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Low', icon: CheckCircle }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getStageProgress = (status: string, progress: number) => {
    const stageColors = {
      'created': 'bg-gray-400',
      'shared': 'bg-purple-500',
      'otp_verified': 'bg-blue-500',
      'e-sign_pending': 'bg-orange-500',
      'completed': 'bg-green-500'
    };

    const color = stageColors[status as keyof typeof stageColors] || 'bg-gray-400';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  const handleDocumentSelection = (docId: number) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === paginatedDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(paginatedDocuments.map(d => d.id));
    }
  };

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowViewModal(true);
  };

  const handleEditDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowEditModal(true);
  };

  const handleDeleteDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowDeleteModal(true);
  };

  const handleShareDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowShareModal(true);
  };

  const handleDownloadDocument = (doc: any) => {
    console.log('Downloading document:', doc);
    // Generate and download PDF
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKERvY3VtZW50KQovQ3JlYXRvciAoUmVzYWxlRXhwZXJ0KQovUHJvZHVjZXIgKFJlc2FsZUV4cGVydCkKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNCAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMyAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDE3OCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMiAwIFIKPj4Kc3RhcnR4cmVmCjI3MwolJUVPRgo=';
    link.download = `${doc.title}.pdf`;
    link.click();
  };

  const handleSaveDocument = (updatedDoc: any) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === updatedDoc.id ? { ...doc, ...updatedDoc } : doc
    ));
    setShowEditModal(false);
    setSelectedDocument(null);
  };

  const handleDeleteConfirm = (deleteData: any) => {
    if (userRole === 'admin') {
      setDocuments(prev => prev.filter(doc => doc.id !== deleteData.document_id));
    } else {
      // For managers, mark as pending deletion
      setDocuments(prev => prev.map(doc =>
        doc.id === deleteData.document_id
          ? { ...doc, status: 'pending_deletion', delete_reason: deleteData.reason }
          : doc
      ));
    }
    setShowDeleteModal(false);
    setSelectedDocument(null);
  };

  const handleBulkStatusChange = (newStatus: string) => {
    setDocuments(prev => prev.map(doc =>
      selectedDocuments.includes(doc.id)
        ? {
          ...doc,
          status: newStatus,
          updated_at: new Date().toISOString(),
          tracking_history: [
            ...doc.tracking_history,
            {
              id: doc.tracking_history.length + 1,
              action: `Status Changed to ${newStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
              timestamp: new Date().toISOString(),
              user: 'Admin User',
              details: `Document status updated via bulk action`,
              stage: newStatus,
              icon: 'Settings'
            }
          ]
        }
        : doc
    ));
    setSelectedDocuments([]);
    setShowStatusModal(false);
  };

  const handleBulkShare = () => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    console.log('Bulk sharing documents:', selectedDocs);
    alert(`Sharing ${selectedDocuments.length} documents via email and WhatsApp`);
    setSelectedDocuments([]);
  };

  const handleBulkDownload = () => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    console.log('Bulk downloading documents:', selectedDocs);

    // Create a zip file simulation
    selectedDocs.forEach((doc, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKERvY3VtZW50KQo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEyMSAwMDAwMCBuIAowMDAwMDAwMTc4IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAyIDAgUgo+PgpzdGFydHhyZWYKMjczCiUlRU9GCg==';
        link.download = `${doc.title}.pdf`;
        link.click();
      }, index * 500);
    });

    alert(`Downloading ${selectedDocuments.length} documents...`);
    setSelectedDocuments([]);
  };

  const handleBulkExport = () => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));

    // Create CSV export
    const csvHeaders = 'Title,Template,Seller,Buyer,Property,Status,Priority,Created Date,Updated Date\n';
    const csvData = selectedDocs.map(doc =>
      `"${doc.title}","${doc.template_name}","${doc.data.seller_name}","${doc.data.buyer_name || 'N/A'}","${doc.data.property_address}","${doc.status}","${doc.priority}","${doc.created_at}","${doc.updated_at}"`
    ).join('\n');

    const csvContent = csvHeaders + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSelectedDocuments([]);
  };

  const handleDuplicateDocument = (doc: any) => {
    const newDoc = {
      ...doc,
      id: Math.max(...documents.map(d => d.id)) + 1,
      title: `${doc.title} (Copy)`,
      data: {
        ...doc.data,
        document_id: `${doc.data.document_id}_COPY`,
        document_date: new Date().toISOString().split('T')[0]
      },
      status: 'created',
      stage_progress: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      shared_channels: [],
      otp_verified_at: null,
      completed_at: null,
      tracking_history: [
        {
          id: 1,
          action: 'Document Duplicated',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          details: `Document duplicated from ${doc.data.document_id}`,
          stage: 'created',
          icon: 'Copy'
        }
      ]
    };

    setDocuments(prev => [...prev, newDoc]);
    alert('Document duplicated successfully!');
  };

  const handleArchiveDocument = (doc: any) => {
    setDocuments(prev => prev.map(d =>
      d.id === doc.id
        ? {
          ...d,
          status: 'archived',
          updated_at: new Date().toISOString(),
          tracking_history: [
            ...d.tracking_history,
            {
              id: d.tracking_history.length + 1,
              action: 'Document Archived',
              timestamp: new Date().toISOString(),
              user: 'Admin User',
              details: 'Document moved to archive',
              stage: 'archived',
              icon: 'Archive'
            }
          ]
        }
        : d
    ));
    alert('Document archived successfully!');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueTemplates = () => {
    const templates = [...new Set(documents.map(doc => doc.template_name))];
    return templates;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Documents</p>
              <p className="text-xl font-bold">{documents.length}</p>
            </div>
            <FileText size={24} className="text-blue-200" />
          </div>
          <div className="mt-1 text-blue-100 text-xs">📄 All document types</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Completed</p>
              <p className="text-xl font-bold">
                {documents.filter(d => d.status === 'completed').length}
              </p>
            </div>
            <CheckCircle size={24} className="text-green-200" />
          </div>
          <div className="mt-1 text-green-100 text-xs">✅ Fully processed</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">In Progress</p>
              <p className="text-xl font-bold">
                {documents.filter(d => d.status !== 'completed' && d.status !== 'created').length}
              </p>
            </div>
            <Clock size={24} className="text-orange-200" />
          </div>
          <div className="mt-1 text-orange-100 text-xs">⏳ Being processed</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">High Priority</p>
              <p className="text-xl font-bold">
                {documents.filter(d => d.priority === 'high').length}
              </p>
            </div>
            <AlertCircle size={24} className="text-purple-200" />
          </div>
          <div className="mt-1 text-purple-100 text-xs">🔥 Urgent documents</div>
        </div>
      </div>

      {/* Search and Filters */}
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg 
focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
              >
                <FileText size={14} className={viewMode === 'table' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
              >
                <Building size={14} className={viewMode === 'cards' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="all">All Status</option>
                  <option value="created">Created</option>
                  <option value="shared">Shared</option>
                  <option value="otp_verified">OTP Verified</option>
                  <option value="e-sign_pending">E-Sign Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={templateFilter}
                  onChange={(e) => setTemplateFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="all">All Templates</option>
                  {getUniqueTemplates().map(template => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setTemplateFilter('all');
                    setSearchTerm('');
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-blue-700">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleBulkShare}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Bulk Share
                </button>
                <button
                  onClick={handleBulkDownload}
                  className="px-2.5 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Bulk Download
                </button>
                <button
                  onClick={handleBulkExport}
                  className="px-2.5 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  Bulk Export
                </button>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-2.5 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                >
                  Change Status
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedDocuments([])}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}


      {/* Documents Table/Cards */}
   {/* Documents Table/Cards */}
{viewMode === 'table' ? (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    {/* ✅ Horizontal + Vertical scroll */}
    <div className="overflow-x-auto">
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left w-8 bg-gray-50">
                <input
                  type="checkbox"
                  checked={
                    selectedDocuments.length === paginatedDocuments.length &&
                    paginatedDocuments.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Document
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Parties
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Property
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Status & Progress
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Timeline
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-xs">
            {paginatedDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={() => handleDocumentSelection(doc.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <FileText className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">
                        {doc.title}
                      </div>
                      <div className="text-gray-500">{doc.template_name}</div>
                      <div className="text-gray-400">
                        ID: {doc.data.document_id}
                      </div>
                      <div className="text-gray-400">by {doc.created_by}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-0.5">
                    <div>
                      <span className="font-medium text-gray-700">Seller:</span>{" "}
                      {doc.data.seller_name}
                    </div>
                    {doc.data.buyer_name && (
                      <div>
                        <span className="font-medium text-gray-700">Buyer:</span>{" "}
                        {doc.data.buyer_name}
                      </div>
                    )}
                    <div className="text-gray-500">
                      Assigned to: {doc.assigned_to}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-0.5">
                    <div className="font-medium text-gray-900">
                      {doc.data.property_type}
                    </div>
                    <div className="text-gray-600">
                      {doc.data.property_area} sq ft
                    </div>
                    <div className="text-gray-500 line-clamp-2">
                      {doc.data.property_address}
                    </div>
                    {doc.data.sale_amount && (
                      <div className="font-medium text-green-600">
                        ₹{(doc.data.sale_amount / 100000).toFixed(1)}L
                      </div>
                    )}
                    {doc.data.token_amount && (
                      <div className="font-medium text-blue-600">
                        Token: ₹{(doc.data.token_amount / 100000).toFixed(1)}L
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    {getStatusBadge(doc.status)}
                    {getPriorityBadge(doc.priority)}
                    <div className="space-y-0.5">
                      <div className="flex justify-between">
                        <span>Progress</span>
                        <span>{doc.stage_progress}%</span>
                      </div>
                      {getStageProgress(doc.status, doc.stage_progress)}
                    </div>
                    {doc.shared_channels.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {doc.shared_channels.includes("email") && (
                          <Mail size={12} className="text-blue-500" />
                        )}
                        {doc.shared_channels.includes("whatsapp") && (
                          <MessageCircle size={12} className="text-green-500" />
                        )}
                        {doc.shared_channels.includes("sms") && (
                          <Phone size={12} className="text-purple-500" />
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-0.5 text-gray-500">
                    <div>Created: {formatTimestamp(doc.created_at)}</div>
                    <div>Updated: {formatTimestamp(doc.updated_at)}</div>
                    {doc.otp_verified_at && (
                      <div className="text-green-600">
                        OTP: {formatTimestamp(doc.otp_verified_at)}
                      </div>
                    )}
                    {doc.completed_at && (
                      <div className="text-blue-600">
                        Done: {formatTimestamp(doc.completed_at)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={() => handleShareDocument(doc)}
                      className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Share Document"
                    >
                      <Share size={12} />
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download size={12} />
                    </button>
                    <div className="relative group">
                      <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal size={12} />
                      </button>
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <div className="p-1">
                          <button
                            onClick={() => handleEditDocument(doc)}
                            className="flex items-center space-x-1.5 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                          >
                            <Edit size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="flex items-center space-x-1.5 px-2 py-1 text-red-600 hover:bg-red-100 rounded w-full text-left"
                          >
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>
                          <button
                            onClick={() => handleDuplicateDocument(doc)}
                            className="flex items-center space-x-1.5 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                          >
                            <Copy size={11} />
                            <span>Duplicate</span>
                          </button>
                          <button
                            onClick={() => handleArchiveDocument(doc)}
                            className="flex items-center space-x-1.5 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                          >
                            <Archive size={11} />
                            <span>Archive</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-xs"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={() => handleDocumentSelection(doc.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={18} />
                  </div>
                </div>
                <div className="flex items-center space-x-1">{getStatusBadge(doc.status)}</div>
              </div>

              <h3 className="font-semibold text-gray-900 text-sm mb-1">{doc.title}</h3>
              <p className="text-gray-600 mb-2">{doc.template_name}</p>

              <div className="space-y-1 mb-3">
                <div>
                  <span className="text-gray-500">Seller:</span> {doc.data.seller_name}
                </div>
                {doc.data.buyer_name && (
                  <div>
                    <span className="text-gray-500">Buyer:</span> {doc.data.buyer_name}
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Property:</span> {doc.data.property_type} • {doc.data.property_area} sq ft
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                {getPriorityBadge(doc.priority)}
                <div className="text-gray-500">{formatTimestamp(doc.created_at)}</div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span>Progress</span>
                  <span>{doc.stage_progress}%</span>
                </div>
                {getStageProgress(doc.status, doc.stage_progress)}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewDocument(doc)}
                  className="flex-1 bg-blue-600 text-white py-1.5 px-2 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  View
                </button>
                <button
                  onClick={() => handleShareDocument(doc)}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Share size={14} />
                </button>
                <button
                  onClick={() => handleDownloadDocument(doc)}
                  className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-gray-700">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center space-x-0.5">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 rounded text-xs ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-1 text-xs">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-2 py-1 rounded text-xs ${currentPage === totalPages
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>


      {/* Modals */}
      {showStatusModal && (
        <StatusChangeModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          selectedCount={selectedDocuments.length}
          onStatusChange={handleBulkStatusChange}
        />
      )}

      {showViewModal && (
        <DocumentViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      )}

      {showEditModal && (
        <DocumentEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          userRole={userRole}
          onSave={handleSaveDocument}
        />
      )}

      {showDeleteModal && (
        <DocumentDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          userRole={userRole}
          onSubmit={handleDeleteConfirm}
        />
      )}

      {showShareModal && (
        <DocumentShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onShare={(shareData) => {
            console.log('Document shared:', shareData);
            setShowShareModal(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};

// Status Change Modal Component
const StatusChangeModal = ({ isOpen, onClose, selectedCount, onStatusChange }: any) => {
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'created', label: 'Created', description: 'Document is created but not shared' },
    { value: 'shared', label: 'Shared', description: 'Document has been shared with parties' },
    { value: 'otp_verified', label: 'OTP Verified', description: 'Identity verification completed' },
    { value: 'e-sign_pending', label: 'E-Sign Pending', description: 'Awaiting digital signature' },
    { value: 'completed', label: 'Completed', description: 'All processes finished' },
    { value: 'on_hold', label: 'On Hold', description: 'Document processing paused' },
    { value: 'cancelled', label: 'Cancelled', description: 'Document cancelled' }
  ];

  const handleSubmit = () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for status change');
      return;
    }

    onStatusChange(newStatus);
    setNewStatus('');
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Change Document Status</h3>
              <p className="text-gray-600 mt-1">Update status for {selectedCount} selected documents</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label key={status.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={newStatus === status.value}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{status.label}</div>
                      <div className="text-sm text-gray-600">{status.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Please provide a reason for changing the status..."
                required
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              This will update {selectedCount} documents
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newStatus || !reason.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingTab;