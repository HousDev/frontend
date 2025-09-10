import React, { useState } from 'react';
import { Variable, Copy, Search, User, Building, MapPin, Calendar, CreditCard } from 'lucide-react';

const VariablePanel = ({ onVariableInsert }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const variableCategories = [
    { id: 'all', label: 'All Variables', icon: Variable },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'property', label: 'Property', icon: Building },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'date', label: 'Date & Time', icon: Calendar },
    { id: 'financial', label: 'Financial', icon: CreditCard },
  ];

  const variables = [
    // Personal Variables
    { name: 'seller_name', label: 'Seller Name', category: 'personal', description: 'Full name of the seller' },
    { name: 'buyer_name', label: 'Buyer Name', category: 'personal', description: 'Full name of the buyer' },
    { name: 'seller_phone', label: 'Seller Phone', category: 'personal', description: 'Seller contact number' },
    { name: 'buyer_phone', label: 'Buyer Phone', category: 'personal', description: 'Buyer contact number' },
    { name: 'seller_email', label: 'Seller Email', category: 'personal', description: 'Seller email address' },
    { name: 'buyer_email', label: 'Buyer Email', category: 'personal', description: 'Buyer email address' },
    { name: 'sales_executive', label: 'Sales Executive', category: 'personal', description: 'Assigned sales executive' },
    
    // Property Variables
    { name: 'property_address', label: 'Property Address', category: 'property', description: 'Complete property address' },
    { name: 'property_type', label: 'Property Type', category: 'property', description: 'Type of property (apartment, villa, etc.)' },
    { name: 'property_area', label: 'Property Area', category: 'property', description: 'Area in square feet' },
    { name: 'unit_number', label: 'Unit Number', category: 'property', description: 'Flat or unit number' },
    { name: 'society_name', label: 'Society Name', category: 'property', description: 'Name of the society' },
    
    // Location Variables
    { name: 'city', label: 'City', category: 'location', description: 'City name' },
    { name: 'state', label: 'State', category: 'location', description: 'State name' },
    { name: 'pincode', label: 'Pincode', category: 'location', description: 'Area pincode' },
    
    // Date Variables
    { name: 'document_date', label: 'Document Date', category: 'date', description: 'Date of document creation' },
    { name: 'agreement_date', label: 'Agreement Date', category: 'date', description: 'Date of agreement' },
    { name: 'possession_date', label: 'Possession Date', category: 'date', description: 'Property possession date' },
    { name: 'validity_period', label: 'Validity Period', category: 'date', description: 'Document validity period' },
    
    // Financial Variables
    { name: 'sale_amount', label: 'Sale Amount', category: 'financial', description: 'Total sale amount' },
    { name: 'token_amount', label: 'Token Amount', category: 'financial', description: 'Token money paid' },
    { name: 'booking_amount', label: 'Booking Amount', category: 'financial', description: 'Booking amount' },
    { name: 'commission_rate', label: 'Commission Rate', category: 'financial', description: 'Commission percentage' },
    { name: 'registration_charges', label: 'Registration Charges', category: 'financial', description: 'Government registration fees' },
  ];

  const filteredVariables = variables.filter(variable => {
    const matchesSearch = variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || variable.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variables Panel</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {variableCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={12} />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variables List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {filteredVariables.map((variable) => (
            <div
              key={variable.name}
              onClick={() => onVariableInsert(variable)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-blue-600 group-hover:bg-blue-100">
                      {`{{${variable.name}}}`}
                    </code>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                </div>
                <Copy className="text-gray-400 group-hover:text-blue-600" size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredVariables.length === 0 && (
        <div className="p-8 text-center">
          <Variable className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500 text-sm">No variables found</p>
        </div>
      )}
    </div>
  );
};

export default VariablePanel;