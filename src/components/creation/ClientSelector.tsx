import React, { useState } from 'react';
import { Search, X, User, Phone, Mail, MapPin, Plus } from 'lucide-react';

const ClientSelector = ({ onSelect, onClose, title }: any) => {
  const [searchTerm, setSearchTerm] = useState('');

  const clients = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@email.com',
      address: 'Flat 301, Building A, Andheri West, Mumbai',
      type: 'Individual',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      phone: '+91 87654 32109',
      email: 'priya.sharma@email.com',
      address: 'Plot 45, Sector 15, Gurgaon, Haryana',
      type: 'Individual',
    },
    {
      id: 3,
      name: 'Mumbai Properties Ltd',
      phone: '+91 76543 21098',
      email: 'info@mumbaiproperties.com',
      address: 'Office 501, Business Tower, BKC, Mumbai',
      type: 'Company',
    },
    {
      id: 4,
      name: 'Amit Patel',
      phone: '+91 65432 10987',
      email: 'amit.patel@email.com',
      address: 'House 15, Green Valley Society, Pune',
      type: 'Individual',
    },
    {
      id: 5,
      name: 'Green Valley Developers',
      phone: '+91 54321 09876',
      email: 'contact@greenvalley.com',
      address: 'Tower B, Commercial Complex, Noida',
      type: 'Company',
    },
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Type-wise card color scheme
  const getColors = (type: string) => {
    if (type === 'Company') {
      return {
        card: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
        iconBg: 'bg-purple-100',
      };
    } else {
      return {
        card: 'bg-green-50 border-green-200 hover:bg-green-100',
        iconBg: 'bg-green-100',
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-xs">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search clients by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={14} />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Client List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredClients.map((client) => {
              const colors = getColors(client.type);
              return (
                <div
                  key={client.id}
                  onClick={() => onSelect(client)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${colors.card}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* User Icon */}
                      <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                        <User size={16} className="text-gray-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-gray-500 mb-1">{client.type}</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 text-gray-600">
                            <Phone size={12} className="text-green-600" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-gray-600">
                            <Mail size={12} className="text-blue-600" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-gray-600">
                            <MapPin size={12} className="text-red-600" />
                            <span>{client.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSelector;
