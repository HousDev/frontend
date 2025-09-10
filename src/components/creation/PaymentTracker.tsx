import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const PaymentTracker = ({ documentData, onDataChange }: any) => {
  const [userRole] = useState('manager'); // This would come from auth context
  const [payments, setPayments] = useState([
    {
      id: 1,
      type: 'Token Amount',
      amount: 50000,
      dueDate: '2025-01-15',
      paidDate: '2025-01-10',
      status: 'paid',
      method: 'bank_transfer',
      reference: 'TXN001234567'
    },
    {
      id: 2,
      type: 'First Installment',
      amount: 200000,
      dueDate: '2025-02-01',
      paidDate: null,
      status: 'pending',
      method: '',
      reference: ''
    },
    {
      id: 3,
      type: 'Final Payment',
      amount: 600000,
      dueDate: '2025-03-01',
      paidDate: null,
      status: 'pending',
      method: '',
      reference: ''
    },
    {
      id: 4,
      type: 'Registration Charges',
      amount: 150000,
      dueDate: '2025-03-15',
      paidDate: null,
      status: 'pending_approval',
      method: '',
      reference: '',
      needsApproval: true
    }
  ]);

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="text-green-500" size={16} />;
      case 'pending': return <Clock className="text-orange-500" size={16} />;
      case 'overdue': return <AlertCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      'pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
      'overdue': { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const addPayment = () => {
    const newPayment = {
      id: payments.length + 1,
      type: '',
      amount: 0,
      dueDate: '',
      paidDate: null,
      status: 'pending',
      method: '',
      reference: ''
    };
    setPayments([...payments, newPayment]);
  };

  const updatePayment = (id: number, field: string, value: any) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, [field]: value } : payment
    ));
  };

  const removePayment = (id: number) => {
    setPayments(payments.filter(payment => payment.id !== id));
  };

  const approvePayment = (id: number) => {
    if (userRole === 'admin') {
      setPayments(payments.map(payment => 
        payment.id === id ? { ...payment, status: 'approved' } : payment
      ));
    }
  };

  const rejectPayment = (id: number) => {
    if (userRole === 'admin') {
      setPayments(payments.map(payment => 
        payment.id === id ? { ...payment, status: 'rejected' } : payment
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-900">₹{(totalAmount / 1000).toFixed(0)}K</p>
            </div>
            <CreditCard className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-900">₹{(paidAmount / 1000).toFixed(0)}K</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-900">₹{(pendingAmount / 1000).toFixed(0)}K</p>
            </div>
            <Clock className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
          <button
            onClick={addPayment}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Payment</span>
          </button>
        </div>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Payment Type</label>
                  <input
                    type="text"
                    value={payment.type}
                    onChange={(e) => updatePayment(payment.id, 'type', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Token Amount"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => updatePayment(payment.id, 'amount', Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={payment.dueDate}
                    onChange={(e) => updatePayment(payment.id, 'dueDate', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Payment Method</label>
                  <select
                    value={payment.method}
                    onChange={(e) => updatePayment(payment.id, 'method', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(payment.status)}
                  {getStatusBadge(payment.status)}
                </div>
                
                <div className="flex items-center justify-end space-x-2">
                  {payment.status === 'pending_approval' && userRole === 'admin' && (
                    <>
                      <button
                        onClick={() => approvePayment(payment.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Approve Payment"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => rejectPayment(payment.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Reject Payment"
                      >
                        <AlertCircle size={14} />
                      </button>
                    </>
                  )}
                  {(userRole === 'admin' || userRole === 'manager') && (
                  <button
                    onClick={() => removePayment(payment.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  )}
                </div>
              </div>
              
              {payment.status === 'paid' && payment.reference && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Paid on:</span> {payment.paidDate}
                    </div>
                    <div>
                      <span className="font-medium">Reference:</span> {payment.reference}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Payments:</span>
            <span className="font-semibold">₹{(totalAmount / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-semibold text-green-600">₹{(paidAmount / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Pending:</span>
            <span className="font-semibold text-orange-600">₹{(pendingAmount / 1000).toFixed(0)}K</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracker;