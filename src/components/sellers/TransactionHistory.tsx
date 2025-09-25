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
  date: string; // ISO or yyyy-mm-dd
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

// ---------- Helper utilities (module scope so modal can use them) ----------
const formatCurrency = (amount: number) => {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  // Using Indian number groups (lakh, crore)
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "brokerage_received":
      return <Receipt className="text-green-600" size={16} />;
    case "brokerage_pending":
      return <Clock className="text-orange-600" size={16} />;
    case "marketing_expense":
      return <TrendingUp className="text-blue-600" size={16} />;
    case "legal_fee":
      return <FileText className="text-purple-600" size={16} />;
    case "maintenance":
      return <Settings className="text-gray-600" size={16} />;
    case "portal_listing":
      return <Building className="text-indigo-600" size={16} />;
    default:
      return <CreditCard className="text-gray-600" size={16} />;
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
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon size={10} className="mr-1" />
      {config.label}
    </span>
  );
};

// ---------- TransactionDetailModal Props ----------
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
            <h3 className="text-sm sm:text-xl font-semibold text-gray-900">Transaction Details</h3>
            <button onClick={onClose} className="p-1 sm:p-2 hover:bg-gray-100 rounded">
              <X size={16} className="sm:size-5" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Transaction Summary */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Transaction Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Amount:</span>
                    <span className="text-xs sm:text-sm font-bold">{formatCurrency(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Date:</span>
                    <span className="text-xs font-medium">{transaction.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Status:</span>
                    <span>{getStatusBadge(transaction.status)}</span>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Method:</span>
                    <span className="text-xs font-medium">{transaction.paymentMethod ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Transaction ID:</span>
                    <span className="text-xs font-mono break-all">{transaction.transactionId ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Category:</span>
                    <span
                      className={`text-xs font-medium capitalize ${
                        transaction.category === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.category ?? "other"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Information */}
            {transaction.dealValue !== undefined && (
              <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-green-900 mb-2 sm:mb-3">Deal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-700">Deal Value:</span>
                    <span className="font-bold">{formatCurrency(transaction.dealValue!)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Brokerage Rate:</span>
                    <span className="font-bold">{transaction.brokerageRate ?? "—"}%</span>
                  </div>
                  {transaction.gstAmount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-green-700">GST Amount:</span>
                      <span className="font-bold">{formatCurrency(transaction.gstAmount!)}</span>
                    </div>
                  )}
                  {transaction.netAmount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Net Received:</span>
                      <span className="font-bold">{formatCurrency(transaction.netAmount!)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Details */}
            {(transaction.features || transaction.services || transaction.workDetails) && (
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2 sm:mb-3">Service Details</h4>
                <div className="space-y-2">
                  {transaction.features && (
                    <div>
                      <span className="text-xs font-medium text-blue-700">Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.features.map((feature, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {transaction.services && (
                    <div>
                      <span className="text-xs font-medium text-blue-700">Services:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.services.map((service, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {transaction.workDetails && (
                    <div>
                      <span className="text-xs font-medium text-blue-700">Work Done:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.workDetails.map((work, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
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
          <div className="flex justify-end space-x-2 sm:space-x-3">
            <button onClick={onClose} className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Close
            </button>
            {transaction.invoiceId && (
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Download Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Main component ----------
interface TransactionHistoryProps {
  seller?: any;
  initialTransactions?: Transaction[]; // optional prop for injection/testing
}

const TransactionHistory: FC<TransactionHistoryProps> = ({ seller, initialTransactions }) => {
  const [activeTab, setActiveTab] = useState<"all" | TransactionCategory | "pending">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // use provided initialTransactions or fallback to demo dataset
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
    { id: "all", label: "All Transactions", count: transactions.length },
    { id: "income", label: "Income", count: transactions.filter((t) => t.category === "income").length },
    { id: "expense", label: "Expenses", count: transactions.filter((t) => t.category === "expense").length },
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

    // NOTE: selectedPeriod filtering is not implemented here (keeps original behavior)
    return matchesSearch && matchesTab;
  });

  // Calculate totals
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
    const exportData = {
      period: selectedPeriod,
      transactions: filteredTransactions,
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        pendingIncome
      },
      exportedAt: new Date().toISOString()
    };

    // You can replace this with actual export logic (CSV, XLSX, PDF)
    console.log("Exporting transactions:", exportData);
    alert("Transaction report exported successfully!");
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Complete financial transaction records and analysis</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={exportTransactions}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
          >
            <Download size={14} className="sm:size-4" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
            <Plus size={14} className="sm:size-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Total Income</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
            <TrendingUp size={18} className="text-green-200 sm:size-6" />
          </div>
          <div className="text-green-100 text-xs mt-1 sm:mt-2 hidden sm:block">From brokerage & commissions</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs">Total Expenses</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            </div>
            <TrendingDown size={18} className="text-red-200 sm:size-6" />
          </div>
          <div className="text-red-100 text-xs mt-1 sm:mt-2 hidden sm:block">Marketing & operational costs</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Net Income</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{formatCurrency(netIncome)}</p>
            </div>
            <DollarSign size={18} className="text-blue-200 sm:size-6" />
          </div>
          <div className="text-blue-100 text-xs mt-1 sm:mt-2 hidden sm:block">After all expenses</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Pending Income</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{formatCurrency(pendingIncome)}</p>
            </div>
            <Clock size={18} className="text-orange-200 sm:size-6" />
          </div>
          <div className="text-orange-100 text-xs mt-1 sm:mt-2 hidden sm:block">Expected this month</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
              <Filter size={12} className="sm:size-4" />
              <span className="hidden sm:inline">More Filters</span>
              <span className="sm:hidden">Filters</span>
            </button>
          </div>
        </div>

        {/* Transaction Tabs */}
        <div className="mt-3 sm:mt-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {transactionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xs font-medium">{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? "bg-blue-200" : "bg-gray-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-3 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-2 sm:space-x-4 flex-1">
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">{getTransactionIcon(transaction.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base truncate">{transaction.description}</h3>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-3 text-xs text-gray-600 mb-2 sm:mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar size={10} className="sm:size-3" />
                        <span>{transaction.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building size={10} className="sm:size-3" />
                        <span className="truncate">{transaction.property}</span>
                      </div>
                      {transaction.buyer && (
                        <div className="flex items-center space-x-1">
                          <User size={10} className="sm:size-3" />
                          <span className="truncate">{transaction.buyer}</span>
                        </div>
                      )}
                      {transaction.vendor && (
                        <div className="flex items-center space-x-1">
                          <Users size={10} className="sm:size-3" />
                          <span className="truncate">{transaction.vendor}</span>
                        </div>
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Details</div>
                        <div className="space-y-0.5 sm:space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Method:</span>
                            <span className="text-xs font-medium">{transaction.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Transaction ID:</span>
                            <span className="text-xs font-mono truncate ml-2">{transaction.transactionId}</span>
                          </div>
                          {transaction.invoiceId && (
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">Invoice ID:</span>
                              <span className="text-xs font-mono truncate ml-2">{transaction.invoiceId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {transaction.category === "income" && transaction.dealValue !== undefined && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Deal Breakdown</div>
                          <div className="space-y-0.5 sm:space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">Deal Value:</span>
                              <span className="text-xs font-medium">{formatCurrency(transaction.dealValue!)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">Brokerage Rate:</span>
                              <span className="text-xs font-medium">{transaction.brokerageRate}%</span>
                            </div>
                            {transaction.gstAmount !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">GST:</span>
                                <span className="text-xs font-medium">{formatCurrency(transaction.gstAmount!)}</span>
                              </div>
                            )}
                            {transaction.netAmount !== undefined && (
                              <div className="flex justify-between border-t pt-0.5 sm:pt-1">
                                <span className="text-xs text-gray-600">Net Amount:</span>
                                <span className="text-xs font-bold text-green-600">{formatCurrency(transaction.netAmount!)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div
                    className={`text-sm sm:text-lg lg:text-2xl font-bold ${
                      transaction.category === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.category === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{transaction.category ?? "other"}</div>
                  {transaction.status === "pending" && transaction.expectedDate && (
                    <div className="text-xs text-orange-600 mt-1">Expected: {transaction.expectedDate}</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 sm:space-x-2 mt-3 sm:mt-4">
                <button
                  onClick={() => setSelectedTransaction(transaction)}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  <Eye size={12} className="sm:size-3.5" />
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">View</span>
                </button>
                {transaction.invoiceId && (
                  <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs">
                    <Download size={12} className="sm:size-3.5" />
                    <span className="hidden sm:inline">Download Invoice</span>
                    <span className="sm:hidden">Download</span>
                  </button>
                )}
                <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs">
                  <Share size={12} className="sm:size-3.5" />
                  <span className="hidden sm:inline">Share</span>
                  <span className="sm:hidden">Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-6 sm:p-12 text-center">
            <CreditCard className="mx-auto text-gray-300 mb-4" size={32} />
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-xs sm:text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* AI Financial Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-2xl border border-purple-200 p-4 sm:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg sm:rounded-xl">
            <Brain className="text-white sm:size-6" size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-xl font-bold text-gray-900">AI Financial Insights</h3>
            <p className="text-xs text-gray-600">Smart analysis of your transaction patterns</p>
          </div>
        </div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
    <div className="flex items-center space-x-2 mb-2 sm:mb-3">
      <BarChart3 className="text-purple-600 w-3 h-3 sm:w-4 sm:h-4" />
      <h4 className="text-xs sm:text-sm font-semibold text-purple-900">Expense Optimization</h4>
    </div>
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex items-start space-x-1.5 sm:space-x-2">
        <Lightbulb className="text-purple-600 mt-0.5 flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="text-xs text-purple-800">Marketing expenses are 12% below industry average - consider increasing for better reach</span>
      </div>
      <div className="flex items-start space-x-1.5 sm:space-x-2">
        <Lightbulb className="text-purple-600 mt-0.5 flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="text-xs text-purple-800">Professional photography ROI is 340% - excellent investment</span>
      </div>
      <div className="flex items-start space-x-1.5 sm:space-x-2">
        <Lightbulb className="text-purple-600 mt-0.5 flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="text-xs text-purple-800">Consider bulk portal subscriptions for 25% cost savings</span>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
    <div className="flex items-center space-x-2 mb-2 sm:mb-3">
      <Target className="text-purple-600 w-3 h-3 sm:w-4 sm:h-4" />
      <h4 className="text-xs sm:text-sm font-semibold text-purple-900">Revenue Insights</h4>
    </div>
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex items-start space-x-1.5 sm:space-x-2">
        <Sparkles className="text-purple-600 mt-0.5 flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="text-xs text-purple-800">Average deal closure time: 28 days (18% faster than market)</span>
      </div>
      <div className="flex items-start space-x-1.5 sm:space-x-2">
        <Sparkles className="text-purple-600 mt-0.5 flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="text-xs text-purple-800">Brokerage rate optimization opportunity: +0.5% possible</span>
      </div>
      <div className="flex items-start space-x-1.5 sm:space-x-2">
        <Sparkles className="text-purple-600 mt-0.5 flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="text-xs text-purple-800">Q1 revenue projection: ₹12.5L based on current pipeline</span>
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
  );
};

export default TransactionHistory;