import React, { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import TemplateEditor from './TemplateEditor';

type Template = {
  id: number;
  name: string;
  description: string;
  category: string;
  variables: string[];
  lastUsed: string;
  usageCount: number;
  status: string;
  created_at: string;
  updated_at: string;
  content: string;
};

const TemplateCreation = () => {
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      name: 'Property Sale Agreement',
      description: 'Comprehensive sale agreement for residential properties',
      category: 'deal',
      variables: ['seller_name', 'buyer_name', 'property_address', 'sale_amount', 'booking_amount'],
      lastUsed: '2025-01-10',
      usageCount: 45,
      status: 'active',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-10T15:30:00Z',
      content: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <h1 style="color: #333; margin-bottom: 10px;">PROPERTY SALE AGREEMENT</h1>
            <p style="color: #666;">Document ID: {{document_id}} | Date: {{document_date}}</p>
          </div>
          <div style="margin-bottom: 25px;">
            <h2 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Agreement Details</h2>
            <p><strong>Seller:</strong> {{seller_name}}</p>
            <p><strong>Buyer:</strong> {{buyer_name}}</p>
            <p><strong>Property Address:</strong> {{property_address}}</p>
            <p><strong>Sale Amount:</strong> ₹{{sale_amount}}</p>
            <p><strong>Booking Amount:</strong> ₹{{booking_amount}}</p>
          </div>
        </div>
      `
    },
    {
      id: 2,
      name: 'Exclusive Mandate Agreement',
      description: 'Authorization for exclusive property marketing',
      category: 'agency',
      variables: ['owner_name', 'property_details', 'commission_rate', 'validity_period'],
      lastUsed: '2025-01-09',
      usageCount: 32,
      status: 'active',
      created_at: '2025-01-02T10:00:00Z',
      updated_at: '2025-01-09T12:15:00Z',
      content: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <h1 style="color: #333; margin-bottom: 10px;">EXCLUSIVE MANDATE AGREEMENT</h1>
            <p style="color: #666;">Document ID: {{document_id}} | Date: {{document_date}}</p>
          </div>
          <div style="margin-bottom: 25px;">
            <h2 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Mandate Details</h2>
            <p><strong>Property Owner:</strong> {{owner_name}}</p>
            <p><strong>Property Details:</strong> {{property_details}}</p>
            <p><strong>Commission Rate:</strong> {{commission_rate}}%</p>
            <p><strong>Validity Period:</strong> {{validity_period}}</p>
          </div>
        </div>
      `
    },
    {
      id: 3,
      name: 'Token Receipt',
      description: 'Receipt for token amount payment',
      category: 'deal',
      variables: ['buyer_name', 'seller_name', 'token_amount', 'property_address'],
      lastUsed: '2025-01-11',
      usageCount: 67,
      status: 'active',
      created_at: '2025-01-03T10:00:00Z',
      updated_at: '2025-01-11T14:20:00Z',
      content: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <h1 style="color: #333; margin-bottom: 10px;">TOKEN RECEIPT</h1>
            <p style="color: #666;">Document ID: {{document_id}} | Date: {{document_date}}</p>
          </div>
          <div style="margin-bottom: 25px;">
            <h2 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Receipt Details</h2>
            <p><strong>Received From:</strong> {{buyer_name}}</p>
            <p><strong>Property Owner:</strong> {{seller_name}}</p>
            <p><strong>Token Amount:</strong> ₹{{token_amount}}</p>
            <p><strong>Property Address:</strong> {{property_address}}</p>
          </div>
        </div>
      `
    },
    {
      id: 7,
      name: 'Booking Form',
      description: 'Property booking form with terms and conditions',
      category: 'deal',
      variables: ['buyer_name', 'buyer_phone', 'buyer_email', 'property_address', 'booking_amount', 'sales_executive', 'executive_id'],
      lastUsed: '2025-01-12',
      usageCount: 28,
      status: 'active',
      created_at: '2025-01-05T10:00:00Z',
      updated_at: '2025-01-12T16:45:00Z',
      content: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <h1 style="color: #333; margin-bottom: 10px;">PROPERTY BOOKING FORM</h1>
            <p style="color: #666;">Document ID: {{document_id}} | Date: {{document_date}}</p>
          </div>
          <div style="margin-bottom: 25px;">
            <h2 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Booking Details</h2>
            <p><strong>Customer Name:</strong> {{buyer_name}}</p>
            <p><strong>Phone:</strong> {{buyer_phone}}</p>
            <p><strong>Email:</strong> {{buyer_email}}</p>
            <p><strong>Property Address:</strong> {{property_address}}</p>
            <p><strong>Booking Amount:</strong> ₹{{booking_amount}}</p>
            <p><strong>Sales Executive:</strong> {{sales_executive}} (ID: {{executive_id}})</p>
          </div>
        </div>
      `
    }
  ]);

  // ---------------- Utils ----------------
  const closeEditor = () => {
    setShowTemplateEditor(false);
    setEditingTemplate(null);
  };

  const getNow = () => {
    const now = new Date();
    return {
      iso: now.toISOString(),
      date: now.toISOString().split('T')[0],
    };
  };

  // ---------------- Handlers ----------------
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleDeleteTemplate = (templateId: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleDuplicateTemplate = (template: Template) => {
    const { iso, date } = getNow();
    const newId = Math.max(0, ...templates.map(t => t.id)) + 1;

    const newTemplate: Template = {
      ...template,
      id: newId,
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastUsed: date,
      created_at: iso,
      updated_at: iso,
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleSaveTemplate = (templateData: Template) => {
    const { iso, date } = getNow();

    if (editingTemplate) {
      // Update existing
      setTemplates(prev =>
        prev.map(t =>
          t.id === editingTemplate.id
            ? {
                ...templateData,
                id: editingTemplate.id,
                usageCount: editingTemplate.usageCount || 0,
                lastUsed: editingTemplate.lastUsed || date,
                created_at: editingTemplate.created_at,
                updated_at: iso,
              }
            : t
        )
      );
      alert('Template updated successfully!');
    } else {
      // Create new
      const newId = Math.max(0, ...templates.map(t => t.id)) + 1;
      const newTemplate: Template = {
        ...templateData,
        id: newId,
        usageCount: 0,
        lastUsed: date,
        created_at: iso,
        updated_at: iso,
      };
      setTemplates(prev => [...prev, newTemplate]);
      alert('Template created successfully!');
    }

    closeEditor();
  };

  // ---------------- Render ----------------
  return (
    <div>
      {!showTemplateEditor ? (
        <TemplateSelector
          templates={templates}
          onCreateTemplate={handleCreateTemplate}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onDuplicateTemplate={handleDuplicateTemplate}
          mode="manage"
        />
      ) : (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={closeEditor}
        />
      )}
    </div>
  );
};

export default TemplateCreation;
