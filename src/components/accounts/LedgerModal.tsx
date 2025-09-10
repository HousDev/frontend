import React from 'react';
import { X, TrendingUp, TrendingDown, IndianRupee, Calendar, FileText, CreditCard, Receipt } from 'lucide-react';

const LedgerModal = ({ isOpen, onClose, document }: any) => {
  if (!isOpen || !document) return null;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEntryIcon = (type: string) => {
    return type === 'credit' ? (
      <div className="p-2 bg-green-100 rounded-lg">
        <TrendingUp className="text-green-600" size={16} />
      </div>
    ) : (
      <div className="p-2 bg-red-100 rounded-lg">
        <TrendingDown className="text-red-600" size={16} />
      </div>
    );
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'brokerage_invoice':
        return <FileText className="text-purple-600" size={20} />;
      case 'brokerage_receipt':
        return <Receipt className="text-green-600" size={20} />;
      case 'property_payment_receipt':
        return <CreditCard className="text-orange-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  const currentBalance = document.ledger_entries?.reduce((balance: number, entry: any) => {
    return entry.type === 'credit' ? balance + entry.amount : balance - entry.amount;
  }, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                {getDocumentIcon(document.type)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ledger History</h2>
                <p className="text-gray-600 mt-1">{document.invoice_id || document.receipt_id} - Credit/Debit Tracking</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Document Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Document Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Document:</span>
                <span className="font-semibold ml-2">{document.invoice_id || document.receipt_id}</span>
              </div>
              <div>
                <span className="text-gray-500">Client:</span>
                <span className="font-semibold ml-2">{document.client_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold ml-2">{formatCurrency(document.total_amount || document.amount)}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  document.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  document.payment_status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {document.payment_status === 'paid' ? 'Paid' : 
                   document.payment_status === 'pending' ? 'Pending' : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Balance */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
                <div className="text-3xl font-bold">{formatCurrency(Math.abs(currentBalance))}</div>
                <div className="text-blue-100 text-sm mt-1">
                  {currentBalance > 0 ? 'Amount Receivable' : currentBalance < 0 ? 'Amount Payable' : 'Settled'}
                </div>
              </div>
              <div className="p-3 bg-blue-400 rounded-lg">
                <IndianRupee size={32} />
              </div>
            </div>
          </div>

          {/* Ledger Entries */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Transaction History</h3>
            
            {document.ledger_entries && document.ledger_entries.length > 0 ? (
              <div className="space-y-3">
                {document.ledger_entries.map((entry: any, index: number) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getEntryIcon(entry.type)}
                        <div>
                          <div className="font-medium text-gray-900">{entry.description}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-2">
                            <Calendar size={12} />
                            <span>{formatDate(entry.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          entry.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Balance: {formatCurrency(entry.balance)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ledger Entries</h3>
                <p className="text-gray-500">No transaction history available for this document</p>
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          <div className="mt-8 bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Transaction Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {document.ledger_entries?.filter((e: any) => e.type === 'debit').length || 0}
                </div>
                <div className="text-sm text-gray-600">Debit Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {document.ledger_entries?.filter((e: any) => e.type === 'credit').length || 0}
                </div>
                <div className="text-sm text-gray-600">Credit Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {document.ledger_entries?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(document.updated_at || document.created_at)}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerModal;