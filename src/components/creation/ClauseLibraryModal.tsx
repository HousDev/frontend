import React, { useState } from 'react';
import { X, Copy, Check, Shield, FileText, Search, PlusCircle, Bookmark } from 'lucide-react';

export interface StandardClause {
  id: string;
  category: 'Indemnity' | 'Tenancy' | 'Payment' | 'Legal' | 'Header/Stamp';
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export const STANDARD_CLAUSES: StandardClause[] = [
  {
    id: 'e-stamp-banner',
    category: 'Header/Stamp',
    title: 'Indian Govt e-Stamp / Franking Simulation Header',
    description: 'Simulated e-Stamp duty header block with Certificate No, GRN No, and Duty Amount.',
    tags: ['stamp duty', 'franking', 'legal header', 'e-stamp'],
    content: `<div style="border: 2px double #1e3a8a; padding: 12px 16px; background-color: #f8fafc; border-radius: 4px; margin-bottom: 24px; font-family: 'Noto Sans', sans-serif;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-b: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
    <div>
      <span style="font-weight: 700; color: #1e3a8a; font-size: 14px; text-transform: uppercase;">GOVT OF MAHARASHTRA / INDIA e-STAMP</span>
      <div style="font-size: 10px; color: #475569;">Certificate No: IN-MH{{mou_no}} / GRN: 004829105</div>
    </div>
    <div style="text-align: right;">
      <span style="font-weight: 700; color: #047857; font-size: 14px;">STAMP DUTY PAID: &#8377; 500.00</span>
      <div style="font-size: 10px; color: #475569;">Date of Issue: {{document_date}}</div>
    </div>
  </div>
  <div style="font-size: 11px; color: #334155; display: flex; justify-content: space-between;">
    <span>Issued To: <strong>{{buyer_name}}</strong></span>
    <span>First Party: <strong>{{seller_name}}</strong></span>
    <span>Stamp Duty Type: <strong>Agreement / MOU</strong></span>
  </div>
</div>`
  },
  {
    id: 'indemnity-title',
    category: 'Indemnity',
    title: 'Indemnity & Clean Title Undertaking',
    description: 'Seller warrants unencumbered ownership and indemnifies Buyer against encumbrances.',
    tags: ['indemnity', 'title', 'mortgage', 'seller warranty'],
    content: `<div style="margin-bottom: 16px;">
  <h4 style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 6px;">Indemnity & Title Assurance</h4>
  <p style="font-size: 12px; line-height: 1.6; color: #334155;">
    The Seller hereby covenants, warrants, and confirms that the Property is free from all legal claims, mortgages, liens, lis pendens, attachments, municipal taxes, and third-party encumbrances. The Seller agrees to fully indemnify and keep indemnified the Buyer and their legal successors against any losses, costs, or damages arising out of any defect in the title of the Seller.
  </p>
</div>`
  },
  {
    id: 'lockin-tenancy',
    category: 'Tenancy',
    title: '11-Month Lock-in & Notice Period Clause',
    description: 'Mandatory lock-in period terms and 1-month advance written notice condition.',
    tags: ['lock-in', 'notice period', 'rent agreement', 'lease'],
    content: `<div style="margin-bottom: 16px;">
  <h4 style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 6px;">Lock-in Period & Notice for Termination</h4>
  <p style="font-size: 12px; line-height: 1.6; color: #334155;">
    Both Parties agree to a mandatory Lock-in Period of <strong>6 (six) months</strong> starting from {{document_date}}. Neither Party may terminate this Agreement during the Lock-in Period. Post completion of the Lock-in Period, either Party may terminate this Agreement by issuing a <strong>1 (one) month advance written notice</strong> to the other Party.
  </p>
</div>`
  },
  {
    id: 'payment-delay-penalty',
    category: 'Payment',
    title: 'Delayed Payment Penalty & Interest Rate',
    description: 'Specifies 18% p.a. interest penalty on overdue payments past grace period.',
    tags: ['payment', 'penalty', 'interest rate', 'overdue'],
    content: `<div style="margin-bottom: 16px;">
  <h4 style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 6px;">Default Penalty & Interest for Overdue Payment</h4>
  <p style="font-size: 12px; line-height: 1.6; color: #334155;">
    In the event the Buyer fails to pay any due installment or balance consideration on or before the agreed milestone dates, a grace period of <strong>7 (seven) days</strong> will be granted. Post the grace period, interest at the rate of <strong>18% per annum</strong> shall be levied on the outstanding balance until actual payment date.
  </p>
</div>`
  },
  {
    id: 'force-majeure',
    category: 'Legal',
    title: 'Force Majeure & Unforeseen Events',
    description: 'Protects both parties in case of natural disasters, government orders, or civil emergencies.',
    tags: ['force majeure', 'disaster', 'legal protection', 'unforeseen'],
    content: `<div style="margin-bottom: 16px;">
  <h4 style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 6px;">Force Majeure</h4>
  <p style="font-size: 12px; line-height: 1.6; color: #334155;">
    Neither Party shall be held responsible or liable for failure to fulfill their obligations under this Agreement if such failure arises from causes beyond reasonable control, including acts of God, war, civil unrest, epidemic, earthquake, flood, or government policy changes.
  </p>
</div>`
  },
  {
    id: 'brokerage-terms',
    category: 'Legal',
    title: 'Brokerage Commission & Advisory Fees Clause',
    description: 'Defines 1% / 2% commission terms payable to ResaleExpert upon completion.',
    tags: ['brokerage', 'commission', 'resaleexpert', 'advisory'],
    content: `<div style="margin-bottom: 16px;">
  <h4 style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 6px;">Professional Advisory Fees</h4>
  <p style="font-size: 12px; line-height: 1.6; color: #334155;">
    Both Parties confirm that <strong>ResaleExpert</strong> has facilitated this transaction. The Buyer and Seller agree to pay the agreed professional facilitation fees to ResaleExpert upon execution of final registration or agreement handover as per standard company policy.
  </p>
</div>`
  }
];

interface ClauseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertClause?: (clauseHtml: string) => void;
}

const ClauseLibraryModal: React.FC<ClauseLibraryModalProps> = ({ isOpen, onClose, onInsertClause }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Header/Stamp', 'Indemnity', 'Tenancy', 'Payment', 'Legal'];

  const filteredClauses = STANDARD_CLAUSES.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCopy = (clause: StandardClause) => {
    navigator.clipboard.writeText(clause.content);
    setCopiedId(clause.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (clause: StandardClause) => {
    // This passes the HTML string to the parent component.
    // The parent component MUST handle inserting this at the cursor position,
    // NOT at the beginning of the document.
    onInsertClause?.(clause.content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Bookmark size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-wide">Standard Legal Clause Library</h3>
              <p className="text-xs text-slate-300">Select pre-verified legal clauses and insert them into contract templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clauses, tags, or terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clause List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredClauses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={36} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No matching legal clauses found.</p>
              <p className="text-xs text-gray-400">Try searching for "stamp", "indemnity", or "lock-in".</p>
            </div>
          ) : (
            filteredClauses.map((clause) => (
              <div
                key={clause.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded text-[10px] uppercase">
                        {clause.category}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{clause.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{clause.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(clause)}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                    >
                      {copiedId === clause.id ? (
                        <>
                          <Check size={14} className="text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy HTML</span>
                        </>
                      )}
                    </button>

                    {onInsertClause && (
                      <button
                        onClick={() => handleInsert(clause)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-medium transition-colors shadow-sm"
                      >
                        <PlusCircle size={14} />
                        <span>Insert Clause</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Clause Code HTML Preview */}
                <div className="bg-slate-900 rounded-md p-3 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-32 border border-slate-800">
                  <pre className="whitespace-pre-wrap">{clause.content}</pre>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Shield size={14} className="text-emerald-600" />
            <span>Pre-verified real estate contract templates</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Close Library
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClauseLibraryModal;