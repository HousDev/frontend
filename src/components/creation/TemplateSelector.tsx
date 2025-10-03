import React, { useState } from 'react';
import { 
  FileText, 
  Building, 
  Receipt, 
  Users, 
  Handshake,
  CreditCard,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  X
} from 'lucide-react';

const TemplateSelector = ({ 
  onSelectTemplate, 
  templates: propTemplates,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  mode = 'select'
}: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', label: 'All Templates', icon: FileText },
    { id: 'agency', label: 'Agency', icon: Building },
    { id: 'deal', label: 'Deal', icon: Handshake },
    { id: 'society', label: 'Society', icon: Users },
    { id: 'handover', label: 'Handover', icon: Receipt },
    { id: 'banking', label: 'Banking', icon: CreditCard },
  ];

  const defaultTemplates = [
    {
      id: 1,
      name: 'Property Sale Agreement',
      description: 'Comprehensive sale agreement for residential properties',
      category: 'deal',
      variables: ['seller_name', 'buyer_name', 'property_address', 'sale_amount', 'booking_amount'],
      lastUsed: '2025-01-10',
      usageCount: 45,
      status: 'active'
    },
    {
      id: 2,
      name: 'Exclusive Mandate Agreement',
      description: 'Authorization for exclusive property marketing',
      category: 'agency',
      variables: ['owner_name', 'property_details', 'commission_rate', 'validity_period'],
      lastUsed: '2025-01-09',
      usageCount: 32,
      status: 'active'
    },
    {
      id: 3,
      name: 'Token Receipt',
      description: 'Receipt for token amount payment',
      category: 'deal',
      variables: ['buyer_name', 'seller_name', 'token_amount', 'property_address'],
      lastUsed: '2025-01-11',
      usageCount: 67,
      status: 'active'
    },
    {
      id: 4,
      name: 'Society NOC Request',
      description: 'No Objection Certificate request from society',
      category: 'society',
      variables: ['member_name', 'flat_number', 'buyer_name', 'society_name'],
      lastUsed: '2025-01-08',
      usageCount: 28,
      status: 'active'
    },
    {
      id: 5,
      name: 'Key Handover Certificate',
      description: 'Certificate for property key handover',
      category: 'handover',
      variables: ['seller_name', 'buyer_name', 'property_address', 'handover_date'],
      lastUsed: '2025-01-07',
      usageCount: 19,
      status: 'active'
    },
    {
      id: 6,
      name: 'Bank NOC Request',
      description: 'No Objection Certificate from bank for loan closure',
      category: 'banking',
      variables: ['borrower_name', 'loan_account', 'property_address', 'outstanding_amount'],
      lastUsed: '2025-01-06',
      usageCount: 15,
      status: 'active'
    },
    {
      id: 7,
      name: 'Booking Form',
      description: 'Property booking form with terms and conditions',
      category: 'deal',
      variables: ['buyer_name', 'buyer_phone', 'buyer_email', 'property_address', 'booking_amount', 'sales_executive', 'executive_id'],
      lastUsed: '2025-01-12',
      usageCount: 28,
      status: 'active'
    }
  ];

  const templates = propTemplates || defaultTemplates;

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : FileText;
  };

  const handleEditClick = (template: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditTemplate) {
      onEditTemplate(template);
    }
  };

  const handleDeleteClick = (templateId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteTemplate) {
      onDeleteTemplate(templateId);
    }
  };

  const handleDuplicateClick = (template: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicateTemplate) {
      onDuplicateTemplate(template);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">
            {mode === 'select' ? 'Select Template' : 'Template Management'}
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'select' 
              ? 'Choose from professionally designed templates'
              : 'Create, edit, and manage document templates'
            }
          </p>
        </div>
        {mode === 'manage' && onCreateTemplate && (
          <button 
            onClick={onCreateTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={12} />
            <span>Create New Template</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
            <input
              type="text"
              placeholder="Search templates by name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter size={12} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] text-xs"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex space-x-1 overflow-x-auto pb-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                } text-xs`}
              >
                <Icon size={12} />
                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
        {filteredTemplates.map((template) => {
          const CategoryIcon = getCategoryIcon(template.category);
          return (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer group hover:border-blue-300 text-xs"
              onClick={() => {
                if (mode === 'select' && onSelectTemplate) {
                  onSelectTemplate(template);
                } else if (mode === 'manage' && onEditTemplate) {
                  onEditTemplate(template);
                }
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <CategoryIcon className="text-blue-600" size={16} />
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-medium text-gray-600">Used {template.usageCount} times</div>
                    <div className="text-gray-400">Last: {template.lastUsed}</div>
                  </div>
                </div>
                
                {mode === 'manage' && (
                  <div className="flex items-center space-x-1 mb-3">
                    <button
                      onClick={(e) => handleEditClick(template, e)}
                      className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      title="Edit Template"
                    >
                      <Edit size={10} />
                    </button>
                    <button
                      onClick={(e) => handleDuplicateClick(template, e)}
                      className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                      title="Duplicate Template"
                    >
                      <Copy size={10} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(template.id, e)}
                      className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                )}
                
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-500 uppercase">Variables:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.slice(0, 3).map((variable, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          +{template.variables.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    {mode === 'select' ? 'Use Template' : 'Manage Template'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-xs">
          <FileText className="mx-auto text-gray-300 mb-4" size={40} />
          <h3 className="font-bold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search terms or create a new template</p>
          {mode === 'manage' && onCreateTemplate && (
            <button 
              onClick={onCreateTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus size={12} />
              <span>Create New Template</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
