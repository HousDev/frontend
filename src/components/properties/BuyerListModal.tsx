import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Star,
  User,
  Clock,
  Search
} from "lucide-react";

interface Buyer {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  budget: number | string;
  requirements: string[];
  status: "hot" | "warm" | "cold" | string;
  rating: number;
  lastVisit: string; // ISO or date string
  feedback: string;
  nextFollowup: string;
  leadSource?: string;
  visitCount?: number;
}

interface BuyerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    title?: string;
    location?: string;
    city?: string;
    budget?: number | string | null;
    unitType?: string;
  } | null;
}

/** Helpers */
const safeNumber = (v?: number | string | null): number => {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? 0 : n;
};

const formatCurrency = (amount?: number | string | null) => {
  const n = safeNumber(amount);
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

/** Sample data (replace with API data in production) */
const sampleBuyers: Buyer[] = [
  {
    id: 1,
    name: "Amit Sharma",
    phone: "+91 98765 43210",
    email: "amit.sharma@email.com",
    budget: 2500000,
    requirements: ["3BHK", "Andheri West", "Furnished"],
    status: "hot",
    rating: 5,
    lastVisit: "2025-01-10",
    feedback: "Very interested, wants to visit again with family",
    nextFollowup: "2025-01-15",
    leadSource: "Website",
    visitCount: 3
  },
  {
    id: 2,
    name: "Priya Patel",
    phone: "+91 87654 32109",
    email: "priya.patel@email.com",
    budget: 2200000,
    requirements: ["2BHK", "Mumbai", "Semi-Furnished"],
    status: "warm",
    rating: 4,
    lastVisit: "2025-01-08",
    feedback: "Liked the property but concerned about price",
    nextFollowup: "2025-01-14",
    leadSource: "Referral",
    visitCount: 2
  },
  {
    id: 3,
    name: "Rajesh Kumar",
    phone: "+91 76543 21098",
    email: "rajesh.kumar@email.com",
    budget: 2800000,
    requirements: ["3BHK", "Good Location", "Parking"],
    status: "cold",
    rating: 3,
    lastVisit: "2025-01-05",
    feedback: "Still exploring options",
    nextFollowup: "2025-01-20",
    leadSource: "Social Media",
    visitCount: 1
  }
];

const BuyerListModal: React.FC<BuyerListModalProps> = ({ isOpen, onClose, property }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "hot" | "warm" | "cold">("all");
  // Replace this with your fetched buyers in a real app
  const [buyers] = useState<Buyer[]>(sampleBuyers);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setFilterStatus("all");
    }
  }, [isOpen]);

  const filteredBuyers = useMemo(() => {
    return buyers.filter((buyer) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        buyer.name.toLowerCase().includes(q) ||
        buyer.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        buyer.email.toLowerCase().includes(q);

      const matchesFilter = filterStatus === "all" || buyer.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [buyers, searchTerm, filterStatus]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      hot: { bg: "bg-red-100", text: "text-red-700", label: "Hot Lead", icon: "🔥" },
      warm: { bg: "bg-orange-100", text: "text-orange-700", label: "Warm Lead", icon: "🟡" },
      cold: { bg: "bg-blue-100", text: "text-blue-700", label: "Cold Lead", icon: "🔵" }
    };
    const cfg = statusConfig[status] ?? statusConfig.cold;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className="mr-1">{cfg.icon}</span>
        {cfg.label}
      </span>
    );
  };

  const handleWhatsApp = (buyer: Buyer) => {
    const phone = buyer.phone.replace(/[^0-9]/g, "");
    const message = `Hi ${buyer.name}, I have a property that matches your requirements. Property: ${property?.title ?? ""} at ${property?.location ??
      ""}. Budget: ${formatCurrency(property?.budget)}. Would you like to schedule a visit?`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleEmail = (buyer: Buyer) => {
    const subject = `Property Match - ${property?.title ?? ""}`;
    const body = `Dear ${buyer.name},\n\nI hope this email finds you well.\n\nI have a property that matches your requirements:\n\nProperty: ${property?.title ?? ""}\nLocation: ${property?.location ?? ""}\nBudget: ${formatCurrency(property?.budget)}\nType: ${property?.unitType ?? ""}\n\nWould you like to schedule a visit?\n\nBest regards,\nResale Expert Team`;
    const emailUrl = `mailto:${buyer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, "_blank", "noopener,noreferrer");
  };

  const handleScheduleVisit = (buyer: Buyer) => {
    // Hook into your scheduling/visits flow here
 
    window.alert(`Visit scheduled for ${buyer.name}. They will be notified.`);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={12} className={i < rating ? "text-yellow-400" : "text-gray-300"} />
    ));

  if (!isOpen) return null;

  return (
    // NOTE: removed size="xl" to match Modal prop types in your codebase
    <Modal isOpen={isOpen} onClose={onClose} title="Interested Buyers">
      <div className="space-y-6">
        {/* Header with Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search buyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="hot">Hot Leads</option>
            <option value="warm">Warm Leads</option>
            <option value="cold">Cold Leads</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{buyers.filter((b) => b.status === "hot").length}</div>
            <div className="text-sm text-red-700">Hot Leads</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{buyers.filter((b) => b.status === "warm").length}</div>
            <div className="text-sm text-orange-700">Warm Leads</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{buyers.filter((b) => b.status === "cold").length}</div>
            <div className="text-sm text-blue-700">Cold Leads</div>
          </div>
        </div>

        {/* Buyers List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredBuyers.map((buyer) => (
            <div key={buyer.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {buyer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{buyer.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone size={12} />
                      <span>{buyer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail size={12} />
                      <span>{buyer.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(buyer.status)}
                  <div className="text-sm font-semibold text-green-600 mt-1">{formatCurrency(buyer.budget)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Requirements</div>
                  <div className="flex flex-wrap gap-1">
                    {buyer.requirements.map((req, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Rating & Visits</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">{renderStars(buyer.rating)}</div>
                    <span className="text-xs text-gray-600">({buyer.visitCount ?? 0} visits)</span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Last Visit Feedback</div>
                <p className="text-sm text-gray-700">{buyer.feedback}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock size={10} />
                    <span>Last visit: {buyer.lastVisit}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={10} />
                    <span>Follow-up: {buyer.nextFollowup}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleWhatsApp(buyer)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    title="WhatsApp"
                    type="button"
                  >
                    <MessageCircle size={14} />
                  </button>
                  <button
                    onClick={() => handleEmail(buyer)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Email"
                    type="button"
                  >
                    <Mail size={14} />
                  </button>
                  <button
                    onClick={() => handleScheduleVisit(buyer)}
                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                    title="Schedule Visit"
                    type="button"
                  >
                    <Calendar size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBuyers.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No buyers found matching your criteria</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BuyerListModal;
