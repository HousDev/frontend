import React, { FC, useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  Receipt,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Percent,
  IndianRupee,
  Banknote,
  Wallet,
  Send,
  Share,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Settings,
  ExternalLink,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Home,
  Users,
  Shield,
  Crown,
  Gem,
  Zap,
  Bot,
  Brain,
  Lightbulb,
  Sparkles,
  X
} from "lucide-react";

type TransactionCategory = "income" | "expense" | "other";
type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  property?: string;
  buyer?: string;
  vendor?: string;
  dealValue?: number;
  brokerageRate?: number;
  paymentMethod?: string;
  transactionId?: string;
  gstAmount?: number;
  netAmount?: number;
  invoiceId?: string;
  category?: TransactionCategory;
  duration?: string;
  features?: string[];
  services?: string[];
  workDetails?: string[];
  expectedDate?: string;
}

const formatCurrency = (amount: number) => {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "brokerage_received":
      return <Receipt className="text-green-600" size={14} />;
    case "brokerage_pending":
      return <Clock className="text-orange-600" size={14} />;
    case "marketing_expense":
      return <TrendingUp className="text-blue-600" size={14} />;
    case "legal_fee":
      return <FileText className="text-purple-600" size={14} />;
    case "maintenance":
      return <Settings className="text-gray-600" size={14} />;
    case "portal_listing":
      return <Building className="text-indigo-600" size={14} />;
    default:
      return <CreditCard className="text-gray-600" size={14} />;
  }
};

const getStatusBadge = (status: TransactionStatus) => {
  const statusConfig: Record<
    TransactionStatus,
    { bg: string; text: string; label: string; icon: typeof CheckCircle }
  > = {
    completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed", icon: CheckCircle },
    pending: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending", icon: Clock as any },
    failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed", icon: AlertCircle as any }
  };

  const config = statusConfig[status] ?? statusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap ${config.bg} ${config.text}`}>
      <Icon size={8} className="mr-0.5 flex-shrink-0" />
      {config.label}
    </span>
  );
};

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionDetailModal: FC<TransactionDetailModalProps> = ({ transaction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-xl font-semibold text-gray-900 break-words pr-4">Transaction Details</h3>
            <button onClick={onClose} className="p-1 sm:p-2 hover:bg-gray-100 rounded flex-shrink-0">
              <X size={16} className="sm:size-5" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Transaction Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-[10px] sm:text-xs text-gray-600">Amount:</span>
                    <span className="text-[11px] sm:text-sm font-bold break-words">{formatCurrency(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-[10px] sm:text-xs text-gray-600">Date:</span>
                    <span className="text-[10px] sm:text-xs font-medium">{transaction.date}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-[10px] sm:text-xs text-gray-600">Status:</span>
                    <span>{getStatusBadge(transaction.status)}</span>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-[10px] sm:text-xs text-gray-600">Method:</span>
                    <span className="text-[10px] sm:text-xs font-medium break-words">{transaction.paymentMethod ?? "—"}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-[10px] sm:text-xs text-gray-600">Transaction ID:</span>
                    <span className="text-[10px] sm:text-xs font-mono break-all">{transaction.transactionId ?? "—"}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-[10px] sm:text-xs text-gray-600">Category:</span>
                    <span className={`text-[10px] sm:text-xs font-medium capitalize break-words ${transaction.category === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.category ?? "other"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {transaction.dealValue !== undefined && (
              <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-green-900 mb-2 sm:mb-3">Deal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-green-700 text-[10px] sm:text-xs">Deal Value:</span>
                    <span className="font-bold text-[10px] sm:text-xs break-words">{formatCurrency(transaction.dealValue!)}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-green-700 text-[10px] sm:text-xs">Brokerage Rate:</span>
                    <span className="font-bold text-[10px] sm:text-xs">{transaction.brokerageRate ?? "—"}%</span>
                  </div>
                  {transaction.gstAmount !== undefined && (
                    <div className="flex justify-between flex-wrap gap-1">
                      <span className="text-green-700 text-[10px] sm:text-xs">GST Amount:</span>
                      <span className="font-bold text-[10px] sm:text-xs break-words">{formatCurrency(transaction.gstAmount!)}</span>
                    </div>
                  )}
                  {transaction.netAmount !== undefined && (
                    <div className="flex justify-between flex-wrap gap-1">
                      <span className="text-green-700 text-[10px] sm:text-xs">Net Received:</span>
                      <span className="font-bold text-[10px] sm:text-xs break-words">{formatCurrency(transaction.netAmount!)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(transaction.features || transaction.services || transaction.workDetails) && (
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2 sm:mb-3">Service Details</h4>
                <div className="space-y-2">
                  {transaction.features && transaction.features.length > 0 && (
                    <div>
                      <span className="text-[10px] sm:text-xs font-medium text-blue-700">Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.features.map((feature, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] sm:text-xs break-words">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {transaction.services && transaction.services.length > 0 && (
                    <div>
                      <span className="text-[10px] sm:text-xs font-medium text-blue-700">Services:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.services.map((service, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] sm:text-xs break-words">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {transaction.workDetails && transaction.workDetails.length > 0 && (
                    <div>
                      <span className="text-[10px] sm:text-xs font-medium text-blue-700">Work Done:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.workDetails.map((work, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] sm:text-xs break-words">
                            {work}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 sm:space-x-reverse">
            <button onClick={onClose} className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Close
            </button>
            {transaction.invoiceId && (
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Download Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TransactionHistoryProps {
  seller?: any;
  initialTransactions?: Transaction[];
}

const TransactionHistory: FC<TransactionHistoryProps> = ({ seller, initialTransactions }) => {
  const [activeTab, setActiveTab] = useState<"all" | TransactionCategory | "pending">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactions: Transaction[] = initialTransactions ?? [
    {
      id: 1,
      type: "brokerage_received",
      description: "Brokerage commission received",
      amount: 490000,
      date: "2025-01-15",
      status: "completed",
      property: "Skyline Towers, Andheri West",
      buyer: "Amit Patel",
      dealValue: 24500000,
      brokerageRate: 2,
      paymentMethod: "RTGS",
      transactionId: "TXN123456789",
      gstAmount: 88200,
      netAmount: 401800,
      invoiceId: "INV-2025-001",
      category: "income"
    },
    {
      id: 2,
      type: "marketing_expense",
      description: "Professional photography and videography",
      amount: 15000,
      date: "2025-01-10",
      status: "completed",
      property: "Green Valley Villa, Pune",
      vendor: "Premium Photography Services",
      category: "expense",
      paymentMethod: "UPI",
      transactionId: "TXN987654321",
      invoiceId: "EXP-2025-001"
    },
    {
      id: 3,
      type: "portal_listing",
      description: "Premium listing on property portals",
      amount: 5000,
      date: "2025-01-08",
      status: "completed",
      property: "All Properties",
      vendor: "MagicBricks Premium",
      category: "expense",
      paymentMethod: "Credit Card",
      transactionId: "TXN555666777",
      duration: "3 months",
      features: ["Featured listing", "Top placement", "Analytics"]
    },
    {
      id: 4,
      type: "legal_fee",
      description: "Legal documentation and verification",
      amount: 25000,
      date: "2025-01-05",
      status: "completed",
      property: "Skyline Towers, Andheri West",
      vendor: "Legal Associates",
      category: "expense",
      paymentMethod: "Cheque",
      transactionId: "TXN444555666",
      services: ["Document verification", "Legal opinion", "Registration support"]
    },
    {
      id: 5,
      type: "maintenance",
      description: "Property maintenance and repairs",
      amount: 35000,
      date: "2025-01-03",
      status: "completed",
      property: "Green Valley Villa, Pune",
      vendor: "Home Maintenance Services",
      category: "expense",
      paymentMethod: "Cash",
      transactionId: "TXN333444555",
      workDetails: ["Painting touch-up", "Plumbing repairs", "Electrical fixes"]
    },
    {
      id: 6,
      type: "brokerage_pending",
      description: "Pending brokerage from villa deal",
      amount: 615000,
      date: "2025-01-20",
      status: "pending",
      property: "Green Valley Villa, Pune",
      buyer: "Priya Shah",
      dealValue: 41000000,
      brokerageRate: 1.5,
      expectedDate: "2025-01-25",
      category: "income"
    }
  ];

  const transactionTabs = [
    { id: "all", label: "All", count: transactions.length },
    { id: "income", label: "Income", count: transactions.filter((t) => t.category === "income").length },
    { id: "expense", label: "Expense", count: transactions.filter((t) => t.category === "expense").length },
    { id: "pending", label: "Pending", count: transactions.filter((t) => t.status === "pending").length }
  ];

  const periods = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const s = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !s ||
      transaction.description.toLowerCase().includes(s) ||
      (transaction.property ?? "").toLowerCase().includes(s) ||
      (transaction.buyer ?? "").toLowerCase().includes(s) ||
      (transaction.vendor ?? "").toLowerCase().includes(s);

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && transaction.status === "pending") ||
      transaction.category === (activeTab as TransactionCategory);

    return matchesSearch && matchesTab;
  });

  const totalIncome = transactions
    .filter((t) => t.category === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.category === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingIncome = transactions
    .filter((t) => t.category === "income" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const exportTransactions = () => {
    alert("Transaction report exported successfully!");
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 pt-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Transaction History</h2>
            <p className="text-[11px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Complete financial transaction records and analysis</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportTransactions}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] sm:text-xs font-medium whitespace-nowrap"
            >
              <Download size={12} className="sm:size-4 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Exp</span>
            </button>
            <button className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[10px] sm:text-xs font-medium whitespace-nowrap">
              <Plus size={12} className="sm:size-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Summary Cards - Compact 2x2 grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-2 sm:p-3 text-white">
            <div className="flex items-center justify-between gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[10px] text-green-100 truncate">Income</p>
                <p className="text-[11px] sm:text-base lg:text-lg font-bold truncate">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp size={14} className="text-green-200 flex-shrink-0 hidden sm:block" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-2 sm:p-3 text-white">
            <div className="flex items-center justify-between gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[10px] text-red-100 truncate">Expense</p>
                <p className="text-[11px] sm:text-base lg:text-lg font-bold truncate">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown size={14} className="text-red-200 flex-shrink-0 hidden sm:block" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2 sm:p-3 text-white">
            <div className="flex items-center justify-between gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[10px] text-blue-100 truncate">Net</p>
                <p className="text-[11px] sm:text-base lg:text-lg font-bold truncate">{formatCurrency(netIncome)}</p>
              </div>
              <DollarSign size={14} className="text-blue-200 flex-shrink-0 hidden sm:block" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-2 sm:p-3 text-white">
            <div className="flex items-center justify-between gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[10px] text-orange-100 truncate">Pending</p>
                <p className="text-[11px] sm:text-base lg:text-lg font-bold truncate">{formatCurrency(pendingIncome)}</p>
              </div>
              <Clock size={14} className="text-orange-200 flex-shrink-0 hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-2.5 sm:p-3">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
            <div className="flex flex-row items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <button className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs whitespace-nowrap">
                <Filter size={11} />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </button>
            </div>
          </div>

          {/* Transaction Tabs - Wrap on mobile */}
          <div className="mt-2.5">
            <div className="flex flex-wrap gap-1.5">
              {transactionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-blue-200" : "bg-gray-200"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2.5">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-2.5 sm:p-3">
                <div className="flex flex-col gap-2">

                  {/* Row 1: Title + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-[11px] sm:text-sm leading-tight flex-1 min-w-0 break-words">
                        {transaction.description}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  {/* Row 2: Details */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] sm:text-xs text-gray-600">
                    <div className="flex items-center gap-1 min-w-0">
                      <Calendar size={8} className="flex-shrink-0" />
                      <span className="truncate">{transaction.date}</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Building size={8} className="flex-shrink-0" />
                      <span className="truncate">{transaction.property || "—"}</span>
                    </div>
                    {transaction.buyer && (
                      <div className="flex items-center gap-1 min-w-0">
                        <User size={8} className="flex-shrink-0" />
                        <span className="truncate">{transaction.buyer}</span>
                      </div>
                    )}
                    {transaction.vendor && (
                      <div className="flex items-center gap-1 min-w-0">
                        <Users size={8} className="flex-shrink-0" />
                        <span className="truncate">{transaction.vendor}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Amount + Actions */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm sm:text-base font-bold truncate ${transaction.category === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.category === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-gray-500 capitalize">{transaction.category ?? "other"}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[9px] sm:text-xs font-medium whitespace-nowrap"
                      >
                        <Eye size={9} className="flex-shrink-0" />
                        <span>View</span>
                      </button>
                      {transaction.invoiceId && (
                        <button className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-[9px] sm:text-xs">
                          <Download size={9} className="flex-shrink-0" />
                        </button>
                      )}
                      <button className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-[9px] sm:text-xs">
                        <Share size={9} className="flex-shrink-0" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
              <CreditCard className="mx-auto text-gray-300 mb-2" size={24} />
              <h3 className="text-xs font-semibold text-gray-900 mb-1">No transactions found</h3>
              <p className="text-[10px] text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* AI Financial Insights - Compact */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-2.5 sm:p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex-shrink-0">
              <Brain className="text-white" size={12} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[11px] sm:text-xs font-bold text-gray-900">AI Insights</h3>
              <p className="text-[8px] sm:text-[10px] text-gray-600">Smart analysis of your patterns</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 border border-purple-100">
              <div className="flex items-center gap-1 mb-1">
                <BarChart3 className="text-purple-600" size={10} />
                <h4 className="text-[9px] sm:text-[10px] font-semibold text-purple-900">Expense Optimization</h4>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-start gap-1">
                  <Lightbulb className="text-purple-600 mt-0.5 flex-shrink-0" size={8} />
                  <span className="text-[8px] sm:text-[9px] text-purple-800">Marketing expenses 12% below avg</span>
                </div>
                <div className="flex items-start gap-1">
                  <Lightbulb className="text-purple-600 mt-0.5 flex-shrink-0" size={8} />
                  <span className="text-[8px] sm:text-[9px] text-purple-800">Photography ROI: 340%</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-purple-100">
              <div className="flex items-center gap-1 mb-1">
                <Target className="text-purple-600" size={10} />
                <h4 className="text-[9px] sm:text-[10px] font-semibold text-purple-900">Revenue Insights</h4>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-start gap-1">
                  <Sparkles className="text-purple-600 mt-0.5 flex-shrink-0" size={8} />
                  <span className="text-[8px] sm:text-[9px] text-purple-800">Deal closure: 28 days (18% faster)</span>
                </div>
                <div className="flex items-start gap-1">
                  <Sparkles className="text-purple-600 mt-0.5 flex-shrink-0" size={8} />
                  <span className="text-[8px] sm:text-[9px] text-purple-800">Brokerage rate: +0.5% possible</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        )}

      </div>
    </div>
  );
};

export default TransactionHistory;