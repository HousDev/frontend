import React from "react";
import {
  Home,
  Building,
  CreditCard,
  FileText,
  Shield,
  Users,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Eye,
  Search,
  HandHeart,
  Calculator,
  ChevronDown,
  Crown,
  ThumbsUp,
  Briefcase,
  Quote,
  X,
  Clock,
  IndianRupee,
  type LucideIcon,
} from "lucide-react";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import ContactQuickModal from "./ContactQuickModal";

type ServiceColor = "navy" | "gold" | "emerald" | "indigo" | "purple" | "rose";

const colorMap: Record<
  ServiceColor,
  {
    bg: string;
    hover: string;
    text: string;
    lite: string;
    dotBg: string;
    dotText: string;
    ring: string;
    border: string;
    hex: string;
  }
> = {
  navy: {
    bg: "bg-[#3B82F6]",
    hover: "hover:bg-[#2563EB]",
    text: "text-[#3B82F6]",
    lite: "bg-[#3B82F6]/5",
    dotBg: "bg-[#3B82F6]/10",
    dotText: "text-[#3B82F6]",
    ring: "group-hover:shadow-[#3B82F6]/20",
    border: "border-[#3B82F6]/15",
    hex: "#3B82F6",
  },
  gold: {
    bg: "bg-[#E6761D]",
    hover: "hover:bg-[#CC6A1A]",
    text: "text-[#E6761D]",
    lite: "bg-[#E6761D]/5",
    dotBg: "bg-[#E6761D]/10",
    dotText: "text-[#E6761D]",
    ring: "group-hover:shadow-[#E6761D]/20",
    border: "border-[#E6761D]/15",
    hex: "#E6761D",
  },
  emerald: {
    bg: "bg-[#10B981]",
    hover: "hover:bg-[#059669]",
    text: "text-[#10B981]",
    lite: "bg-[#10B981]/5",
    dotBg: "bg-[#10B981]/10",
    dotText: "text-[#10B981]",
    ring: "group-hover:shadow-[#10B981]/20",
    border: "border-[#10B981]/15",
    hex: "#10B981",
  },
  indigo: {
    bg: "bg-[#6366F1]",
    hover: "hover:bg-[#4F46E5]",
    text: "text-[#6366F1]",
    lite: "bg-[#6366F1]/5",
    dotBg: "bg-[#6366F1]/10",
    dotText: "text-[#6366F1]",
    ring: "group-hover:shadow-[#6366F1]/20",
    border: "border-[#6366F1]/15",
    hex: "#6366F1",
  },
  purple: {
    bg: "bg-[#A855F7]",
    hover: "hover:bg-[#9333EA]",
    text: "text-[#A855F7]",
    lite: "bg-[#A855F7]/5",
    dotBg: "bg-[#A855F7]/10",
    dotText: "text-[#A855F7]",
    ring: "group-hover:shadow-[#A855F7]/20",
    border: "border-[#A855F7]/15",
    hex: "#A855F7",
  },
  rose: {
    bg: "bg-[#F43F5E]",
    hover: "hover:bg-[#E11D48]",
    text: "text-[#F43F5E]",
    lite: "bg-[#F43F5E]/5",
    dotBg: "bg-[#F43F5E]/10",
    dotText: "text-[#F43F5E]",
    ring: "group-hover:shadow-[#F43F5E]/20",
    border: "border-[#F43F5E]/15",
    hex: "#F43F5E",
  },
};

type CoreService = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: ServiceColor;
  features: string[];
  process: string[];
  price: string;
  duration: string;
  successRate: string;
};

/* -------------------------------------------------------------------------- */
/*  Scroll-reveal utilities                                                    */
/* -------------------------------------------------------------------------- */

function useReveal<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const { ref, inView } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
      } ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
};

/** Premium compact card for the hub-and-spoke layout
 *  (Updated: price/duration moved up under the heading as a pill row;
 *  no "Get Started" button, shows features preview + More) */
const CompactServiceCard = React.forwardRef<
  HTMLDivElement,
  {
    service: CoreService;
    onViewMore: (svc: CoreService) => void;
  }
>(({ service, onViewMore }, ref) => {
  const Icon = service.icon;
  const cm = colorMap[service.color];

  // Show first 3 features as preview points
  const previewFeatures = service.features.slice(0, 3);

  return (
    <div
      ref={ref}
      onClick={() => onViewMore(service)}
      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl ${cm.ring} transition-all duration-300 hover:-translate-y-1 border ${cm.border} p-4 flex flex-col h-full overflow-hidden cursor-pointer`}
    >
      {/* Header — title + duration on same row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${cm.bg} flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 shrink-0`}
        >
          <Icon className="text-white" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
              {service.title}
            </h3>
            <span className="text-gray-400 text-[9px] font-medium whitespace-nowrap shrink-0">
              {service.duration}
            </span>
          </div>
          <p className={`${cm.text} text-[10px] font-semibold mt-0.5 truncate`}>
            {service.subtitle}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-[11px] leading-relaxed mb-3 line-clamp-2">
        {service.description}
      </p>

      {/* Features Preview Points (3 points) */}
      <div className="mb-3 flex-1">
        <ul className="space-y-1.5">
          {previewFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <CheckCircle className={`${cm.text} shrink-0 mt-0.5`} size={10} />
              <span className="text-gray-600 text-[10px] leading-tight line-clamp-1">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewMore(service);
        }}
        className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all bg-white border ${cm.border} ${cm.text} hover:${cm.lite} active:scale-[0.98] shadow-sm flex items-center justify-center gap-1`}
      >
        More Details
        <span className="text-[10px]">→</span>
      </button>
    </div>
  );
});
CompactServiceCard.displayName = "CompactServiceCard";

/* -------------------------------------------------------------------------- */
/*  Service Detail Modal (Premium redesign)                                    */
/* -------------------------------------------------------------------------- */

const ServiceDetailModal = ({
  service,
  onClose,
  onGetStarted,
}: {
  service: CoreService | null;
  onClose: () => void;
  onGetStarted: (svc: { id: string; title: string }) => void;
}) => {
  // Close on Escape key
  React.useEffect(() => {
    if (!service) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [service, onClose]);

  if (!service) return null;

  const Icon = service.icon;
  const cm = colorMap[service.color];

  const statItems: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: IndianRupee, label: "Pricing", value: service.price },
    { icon: Clock, label: "Duration", value: service.duration },
    { icon: Award, label: "Success Rate", value: service.successRate },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-detail-title"
    >
      <div
        className="relative w-full sm:max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — compact */}
        <div
          className={`sticky top-0 z-10 ${cm.bg} px-4 sm:px-5 py-3.5 sm:py-4 relative overflow-hidden`}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 flex items-center justify-center shrink-0 shadow-md">
              <Icon className="text-white" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2 py-px">
                  <Star className="text-white" size={8} fill="currentColor" />
                  <span className="text-white/90 text-[8px] font-semibold tracking-wide uppercase">
                    Premium Service
                  </span>
                </div>
              </div>
              <h2
                id="service-detail-title"
                className="text-base sm:text-lg font-extrabold text-white leading-tight"
              >
                {service.title}
              </h2>
              <p className="text-white/80 text-[10px] sm:text-xs font-medium">
                {service.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body — compact */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 space-y-3">
          {/* Description */}
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            {service.description}
          </p>

          {/* Stats — inline compact */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {statItems.map(({ icon: StatIcon, label, value }) => (
              <div
                key={label}
                className={`relative text-center py-2 px-1.5 ${cm.lite} rounded-xl border ${cm.border}`}
              >
                <div
                  className={`w-6 h-6 rounded-full ${cm.dotBg} ${cm.dotText} flex items-center justify-center mx-auto mb-1`}
                >
                  <StatIcon size={12} />
                </div>
                <div
                  className={`text-[10px] sm:text-xs font-bold ${cm.text} break-words leading-tight`}
                >
                  {value}
                </div>
                <div className="text-[8px] sm:text-[9px] text-gray-400 mt-px font-medium uppercase tracking-wide">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Features + Process — compact grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Key Features */}
            <div>
              <h4 className="font-bold text-gray-900 mb-1.5 text-xs flex items-center gap-1.5">
                <span className={`w-1 h-3 rounded-full ${cm.bg}`} />
                Key Features
              </h4>
              <ul className="space-y-1">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <CheckCircle className={`${cm.text} shrink-0 mt-px`} size={10} />
                    <span className="text-gray-600 text-[10px] sm:text-xs leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Process Steps */}
            <div>
              <h4 className="font-bold text-gray-900 mb-1.5 text-xs flex items-center gap-1.5">
                <span className={`w-1 h-3 rounded-full ${cm.bg}`} />
                Process Steps
              </h4>
              <ol className="relative space-y-1 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-gray-100">
                {service.process.map((step, index) => (
                  <li key={index} className="relative flex items-center gap-2">
                    <div
                      className={`w-4 h-4 ${cm.bg} text-white rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 shadow-sm ring-2 ring-white z-10`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-gray-600 text-[10px] sm:text-xs leading-snug">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Footer CTA — slim */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 sm:px-5 py-2.5 flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none sm:px-4 py-2 rounded-lg font-semibold text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            type="button"
          >
            Close
          </button>
          <button
            onClick={() => {
              onGetStarted({ id: service.id, title: service.title });
              onClose();
            }}
            className={`flex-1 sm:flex-none sm:px-5 py-2 rounded-lg font-semibold text-xs text-white ${cm.bg} ${cm.hover} active:scale-[0.98] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1`}
            type="button"
          >
            Get Started
            <span className="text-[10px]">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

type Connector = { id: string; d: string; colorKey: ServiceColor };

const ServicesPage = () => {
  const [showQuickContact, setShowQuickContact] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [detailService, setDetailService] = React.useState<CoreService | null>(
    null,
  );
  const [heroLoaded, setHeroLoaded] = React.useState(false);
  const [sectionInView, setSectionInView] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  // Refs for the Additional Services & Process sections to trigger their own animations
  const additionalRef = React.useRef<HTMLDivElement>(null);
  const processRef = React.useRef<HTMLDivElement>(null);
  const [additionalInView, setAdditionalInView] = React.useState(false);
  const [processInView, setProcessInView] = React.useState(false);

  // Ref for the Why Choose Us journey animation
  const whyChooseRef = React.useRef<HTMLDivElement>(null);
  const [journeyInView, setJourneyInView] = React.useState(false);

  const phonePretty = "+91 9637 00 9639";
  const phoneE164 = "+919637009639";

  React.useEffect(() => {
    const t = window.setTimeout(() => setHeroLoaded(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  // Trigger the diagram's entrance animation once the section is in view
  React.useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Trigger animations for Additional Services section
  React.useEffect(() => {
    const node = additionalRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAdditionalInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Trigger animations for Our Service Process section
  React.useEffect(() => {
    const node = processRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProcessInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Trigger animation for Why Choose Us Journey
  React.useEffect(() => {
    const node = whyChooseRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setJourneyInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* --------------------------------------------------------------------- */
  /*  Hub-and-spoke connector geometry                                      */
  /* --------------------------------------------------------------------- */
  const diagramRef = React.useRef<HTMLDivElement | null>(null);
  const hubRef = React.useRef<HTMLDivElement | null>(null);
  const topCardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const bottomCardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [connectors, setConnectors] = React.useState<Connector[]>([]);
  const [svgBox, setSvgBox] = React.useState({ width: 0, height: 0 });

  // Assign distinct colors to each position
  const topColors: ServiceColor[] = ["navy", "gold", "emerald"];
  const bottomColors: ServiceColor[] = ["indigo", "purple", "rose"];

  const computeConnectors = React.useCallback(() => {
    const container = diagramRef.current;
    const hub = hubRef.current;
    if (!container || !hub) return;

    const containerRect = container.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return;
    setSvgBox({ width: containerRect.width, height: containerRect.height });

    const hubRect = hub.getBoundingClientRect();
    const hubCenterX = hubRect.left + hubRect.width / 2 - containerRect.left;
    const hubTopY = hubRect.top - containerRect.top;
    const hubBottomY = hubRect.bottom - containerRect.top;

    const next: Connector[] = [];

    topCardRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2 - containerRect.left;
      const y = r.bottom - containerRect.top;
      const midY = y + (hubTopY - y) * 0.55;
      next.push({
        id: `top-${i}`,
        d: `M ${x} ${y} C ${x} ${midY}, ${hubCenterX} ${midY}, ${hubCenterX} ${hubTopY}`,
        colorKey: topColors[i],
      });
    });

    bottomCardRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2 - containerRect.left;
      const y = r.top - containerRect.top;
      const midY = hubBottomY + (y - hubBottomY) * 0.45;
      next.push({
        id: `bottom-${i}`,
        d: `M ${hubCenterX} ${hubBottomY} C ${hubCenterX} ${midY}, ${x} ${midY}, ${x} ${y}`,
        colorKey: bottomColors[i],
      });
    });

    setConnectors(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    computeConnectors();
    const t1 = window.setTimeout(computeConnectors, 150);
    const t2 = window.setTimeout(computeConnectors, 950);

    let resizeTimer: number;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(computeConnectors, 120);
    };
    window.addEventListener("resize", onResize);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && diagramRef.current) {
      ro = new ResizeObserver(() => onResize());
      ro.observe(diagramRef.current);
    }

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [computeConnectors]);

  React.useEffect(() => {
    if (!sectionInView) return;
    const t = window.setTimeout(computeConnectors, 850);
    return () => window.clearTimeout(t);
  }, [sectionInView, computeConnectors]);

  const coreServices: CoreService[] = [
    {
      id: "property-buying",
      title: "Property Buying",
      subtitle: "Find Your Dream Home",
      description:
        "Comprehensive assistance in finding and purchasing your perfect property with expert guidance and verified listings.",
      icon: Home,
      color: "navy",
      features: [
        "AI-powered property matching",
        "Verified property listings",
        "Expert property evaluation",
        "Negotiation support",
        "Legal documentation assistance",
        "Post-purchase support",
      ],
      process: [
        "Requirement Analysis",
        "Property Shortlisting",
        "Site Visits & Evaluation",
        "Price Negotiation",
        "Legal Verification",
        "Registration & Handover",
      ],
      price: "No Hidden Charges",
      duration: "15-30 days",
      successRate: "95%",
    },
    {
      id: "property-selling",
      title: "Property Selling",
      subtitle: "Maximize Your Returns",
      description:
        "Premium marketing, verified buyers, and transparent pricing for maximum returns.",
      icon: Building,
      color: "gold",
      features: [
        "Professional property photography",
        "Multi-channel marketing",
        "Verified buyer database",
        "Price optimization strategies",
        "Legal documentation support",
        "Hassle-free transactions",
      ],
      process: [
        "Property Valuation",
        "Documentation Review",
        "Marketing & Promotion",
        "Buyer Screening",
        "Negotiation & Closure",
        "Registration Support",
      ],
      price: "2% Commission",
      duration: "30-60 days",
      successRate: "92%",
    },
    {
      id: "loan-assistance",
      title: "Home Loan Assistance",
      subtitle: "Best Rates Guaranteed",
      description:
        "Get the best home loan deals with our banking partnerships and expert assistance throughout the process.",
      icon: CreditCard,
      color: "emerald",
      features: [
        "Multiple bank partnerships",
        "Competitive interest rates",
        "Quick loan approval",
        "Documentation support",
        "EMI calculation tools",
        "Loan processing assistance",
      ],
      process: [
        "Eligibility Assessment",
        "Bank Selection",
        "Application Submission",
        "Documentation Support",
        "Loan Approval",
        "Disbursement",
      ],
      price: "Free Service",
      duration: "3-15 days",
      successRate: "99%",
    },
    {
      id: "legal-services",
      title: "Legal Services",
      subtitle: "Complete Documentation",
      description:
        "Expert legal services for all property transactions with experienced lawyers and transparent pricing.",
      icon: FileText,
      color: "indigo",
      features: [
        "Title verification",
        "Legal document preparation",
        "Due diligence support",
        "Registration assistance",
        "Dispute resolution",
        "Compliance support",
      ],
      process: [
        "Document Review",
        "Title Verification",
        "Legal Opinion",
        "Agreement Drafting",
        "Registration Support",
        "Post-transaction Support",
      ],
      price: "₹10,000 onwards",
      duration: "5-10 days",
      successRate: "99%",
    },
    {
      id: "property-management",
      title: "Property Management",
      subtitle: "Hassle-Free Rentals",
      description:
        "Complete property management services including tenant screening, rent collection, and maintenance.",
      icon: Shield,
      color: "purple",
      features: [
        "Tenant screening & verification",
        "Rent collection management",
        "Property maintenance",
        "Legal compliance support",
        "Regular property inspections",
        "24/7 customer support",
      ],
      process: [
        "Property Assessment",
        "Tenant Sourcing",
        "Agreement Execution",
        "Move-in Support",
        "Ongoing Management",
        "Renewal/Exit Support",
      ],
      price: "8% of rental income",
      duration: "Ongoing",
      successRate: "96%",
    },
    {
      id: "investment-advisory",
      title: "Investment Advisory",
      subtitle: "Smart Investment Decisions",
      description:
        "Data-driven investment advice with market analysis and portfolio recommendations for maximum returns.",
      icon: TrendingUp,
      color: "rose",
      features: [
        "Market trend analysis",
        "Investment opportunity identification",
        "ROI calculations",
        "Risk assessment",
        "Portfolio diversification",
        "Exit strategy planning",
      ],
      process: [
        "Investment Goal Analysis",
        "Market Research",
        "Opportunity Identification",
        "Risk Assessment",
        "Investment Execution",
        "Performance Monitoring",
      ],
      price: "₹25,000 consultation",
      duration: "30-45 days",
      successRate: "85%",
    },
  ];

  const additionalServices = [
    {
      title: "Property Valuation",
      description:
        "Professional property valuation for accurate market pricing",
      icon: Calculator,
      price: "Contact for Pricing",
    },
    {
      title: "Virtual Property Tours",
      description: "360° virtual tours for remote property viewing",
      icon: Eye,
      price: "Contact for Pricing",
    },
    {
      title: "Market Research Reports",
      description: "Detailed market analysis and trends for specific areas",
      icon: Search,
      price: "Contact for Pricing",
    },
    {
      title: "Interior Design Consultation",
      description: "Expert interior design advice for home staging",
      icon: HandHeart,
      price: "Contact for Pricing",
    },
  ];

  const whyChooseUs = [
    {
      title: "Years of Excellence",
      description: "Decades of expertise in real estate",
      icon: Award,
      stat: "12+",
      suffix: "years",
    },
    {
      title: "Verified Properties",
      description: "100% legal and verified listings",
      icon: Shield,
      stat: "100%",
      suffix: "",
    },
    {
      title: "Expert Team",
      description: "Certified real estate professionals",
      icon: Briefcase,
      stat: "50+",
      suffix: "experts",
    },
    {
      title: "Customer Satisfaction",
      description: "Happy customers across India",
      icon: Users,
      stat: "98%",
      suffix: "",
    },
  ];

  const serviceProcess = [
    {
      step: "1",
      title: "Consultation",
      description: "Free consultation to understand your requirements",
      icon: Users,
    },
    {
      step: "2",
      title: "Planning",
      description: "Detailed planning and strategy development",
      icon: FileText,
    },
    {
      step: "3",
      title: "Execution",
      description: "Professional execution with regular updates",
      icon: TrendingUp,
    },
    {
      step: "4",
      title: "Completion",
      description: "Successful completion with post-service support",
      icon: CheckCircle,
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      service: "Property Buying",
      text: "ResaleExpert helped me find my dream home within my budget. Their AI matching is incredible!",
      rating: 5,
      location: "Mumbai",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      name: "Priya Sharma",
      service: "Property Selling",
      text: "Sold my property 20% above market rate with their expert marketing strategies.",
      rating: 5,
      location: "Pune",
      image:
        "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      name: "Amit Patel",
      service: "Home Loan",
      text: "Got the best interest rate and quick approval. Saved ₹5L in total interest!",
      rating: 5,
      location: "Delhi",
      image:
        "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
  ];

  const faqs = [
    {
      question: "What makes ResaleExpert different from other platforms?",
      answer:
        "We offer 100% verified properties, AI-powered matching, and end-to-end support with transparent pricing. Our expert team ensures a smooth experience from search to registration.",
    },
    {
      question: "How do you verify properties?",
      answer:
        "Our verification process includes legal document checks, physical property inspection, ownership verification, and compliance checks to ensure authenticity and legal clarity.",
    },
    {
      question: "What are your fees for selling a property?",
      answer:
        "We charge a transparent 2% commission only after successful sale. No hidden fees, no upfront charges. You pay only when we deliver results.",
    },
    {
      question: "How long does it typically take to sell a property?",
      answer:
        "On average, properties sell within 30-60 days with our marketing strategies. Premium locations and well-priced properties often sell faster.",
    },
    {
      question: "Do you provide legal support?",
      answer:
        "Yes, we have experienced legal partners who assist with documentation, title verification, registration, and ensure all transactions are legally compliant.",
    },
  ];

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const toggle = (idx: number) =>
    setOpenIndex((prev) => (prev === idx ? null : idx));

  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

  const handleGetStarted = (svc: { id: string; title: string }) => {
    setSelectedService({ id: svc.id, title: svc.title });
    setShowQuickContact(true);
  };

  const handleViewMore = (svc: CoreService) => {
    setDetailService(svc);
  };

  const SectionHeading = ({
    title,
    subtitle,
    badge,
  }: {
    title: string;
    subtitle?: string;
    badge?: string;
  }) => (
    <div className="text-center mb-6 md:mb-10">
      {badge && (
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-3 md:mb-4"
          style={{ backgroundColor: "#FDF0E6", color: "#E6761D" }}
        >
          <span className="text-xs md:text-sm font-semibold tracking-wide">
            {badge}
          </span>
        </div>
      )}
      <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 md:mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-2">
          {subtitle}
        </p>
      )}
    </div>
  );

  const topServices = coreServices.slice(0, 3);
  const bottomServices = coreServices.slice(3, 6);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes heroRise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hubFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseDot {
          0% { offset-distance: 0%; opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        .hero-rise { opacity: 0; animation: heroRise 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hub-float { animation: hubFloat 5s ease-in-out infinite; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Animated connector line: the visible stroke draws itself in */
        .connector-line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .connector-line.draw { stroke-dashoffset: 0; }

        /* Soft white halo underneath each line for contrast against light bg */
        .connector-halo {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .connector-halo.draw { stroke-dashoffset: 0; }

        /* Small anchor dot that pops in at each card/hub connection point */
        @keyframes dotPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.35); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .anchor-dot {
          transform-origin: center;
          transform-box: fill-box;
          opacity: 0;
          animation: dotPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pulse-dot { animation: pulseDot 3s linear infinite; opacity: 0; }

        /* Additional Services animations */
        @keyframes servicePop {
          0% { opacity: 0; transform: scale(0.85) translateY(15px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .service-card-anim {
          opacity: 0;
          animation: servicePop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Continuous Process line drawing animation */
        @keyframes lineGrowLoop {
          0% { transform: scaleX(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: scaleX(1); opacity: 1; }
          80% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        .process-line {
          transform-origin: left center;
          transform: scaleX(0);
          opacity: 0;
        }
        .process-line.grow {
          animation: lineGrowLoop 3s ease-in-out infinite;
        }

        /* Pulsing glow for the step circles */
        @keyframes stepGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(12, 56, 85, 0); }
          50% { box-shadow: 0 0 0 8px rgba(12, 56, 85, 0.1); }
        }
        .step-circle {
          animation: stepGlow 3s ease-in-out infinite;
        }

        /* =========================================
           WHY CHOOSE US — JOURNEY ROAD ANIMATIONS
           ========================================= */
        @keyframes drawPath {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes popInNode {
          0% { opacity: 0; transform: scale(0.3) translateY(10px); }
          70% { transform: scale(1.05) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatNode {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .journey-svg-path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .journey-svg-path.drawn {
          stroke-dashoffset: 0;
        }
        .journey-node {
          opacity: 0;
          transform-origin: center;
        }
        .journey-node.animate {
          animation: popInNode 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .journey-node-float {
          animation: floatNode 4s ease-in-out infinite;
        }
        .journey-node-float.delay-1 { animation-delay: 1s; }
        .journey-node-float.delay-2 { animation-delay: 2s; }
        .journey-node-float.delay-3 { animation-delay: 3s; }
        .journey-node-float.delay-4 { animation-delay: 4s; }
        .journey-label {
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .journey-label.animate {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-rise { animation: none; opacity: 1; }
          .hub-float { animation: none; }
          .connector-line { stroke-dashoffset: 0; transition: none; }
          .connector-halo { stroke-dashoffset: 0; transition: none; }
          .anchor-dot { animation: none; opacity: 1; }
          .pulse-dot { animation: none; opacity: 1; }
          .service-card-anim { animation: none; opacity: 1; }
          .process-line { transform: scaleX(1); opacity: 1; }
          .process-line.grow { animation: none; }
          .step-circle { animation: none; }
          .journey-svg-path { stroke-dashoffset: 0; transition: none; }
          .journey-node { animation: none; opacity: 1; }
          .journey-label { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-28 pb-14 md:pb-20 overflow-hidden text-white">
        <div className="absolute inset-0">
          <img
            src="/servi.jpg"
            alt="Luxury residential towers"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(11, 56, 85, 0.55)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center py-8 md:py-16">
            {heroLoaded && (
              <>
                <h1 className="hero-rise text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Complete <span style={{ color: "#E6761D" }}>Real Estate</span>{" "}
                  Solutions
                </h1>
                <p
                  className="hero-rise text-base sm:text-lg text-blue-100 mb-7 leading-relaxed"
                  style={{ animationDelay: "120ms" }}
                >
                  From property search to final registration, we provide
                  end-to-end real estate services with expert guidance and
                  transparent pricing.
                </p>
                <button
                  className="hero-rise inline-flex items-center justify-center
                   w-full max-w-[240px] sm:max-w-none sm:w-auto
                   px-5 sm:px-6 py-2.5 sm:py-3
                   text-sm sm:text-base
                   rounded-lg sm:rounded-xl
                   font-semibold text-white
                   shadow-md ring-1 ring-white/20
                   hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]
                   transition"
                  style={{
                    backgroundColor: "#E6761D",
                    animationDelay: "240ms",
                  }}
                  onMouseEnter={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#CC6A1A")
                  }
                  onMouseLeave={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#E6761D")
                  }
                  onClick={() => setShowQuickContact(true)}
                >
                  Get Free Consultation
                </button>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            style={{ height: "80px" }}
            aria-hidden="true"
          >
            <path
              d="M0,0 L120,21.3 C240,43 480,85 720,85 C960,85 1200,43 1320,21.3 L1440,0 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* ============ CORE SERVICES — HUB & SPOKE (DOM-measured connectors) ============ */}
      <section
        ref={sectionRef}
        className="py-12 md:py-16 bg-gray-50 overflow-hidden relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <SectionHeading
              title="Our Core Services"
              subtitle="Comprehensive real estate solutions tailored to your specific needs"
            />
          </Reveal>

          {/* Desktop hub & spoke diagram */}
          <div
            ref={diagramRef}
            className="hidden lg:block relative mt-8 max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-3 gap-5 w-full relative z-10">
              {topServices.map((service, i) => (
                <Reveal key={service.id} delay={i * 80} className="h-full">
                  <CompactServiceCard
                    ref={(el) => (topCardRefs.current[i] = el)}
                    service={service}
                    onViewMore={handleViewMore}
                  />
                </Reveal>
              ))}

              {/* Hub */}
              <div className="col-span-3 flex justify-center py-3">
                <Reveal delay={140} className="w-full max-w-2xl">
                  <div
                    ref={hubRef}
                    className="hub-float bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-7 relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to bottom right, rgba(11,56,85,0.06), rgba(255,255,255,0.9), rgba(230,118,29,0.08))",
                      }}
                    />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-8">
                      <div className="shrink-0 text-center md:text-left">
                        <div
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-2"
                          style={{
                            backgroundColor: "#FDF0E6",
                            color: "#E6761D",
                          }}
                        >
                          <span className="text-xs font-semibold tracking-wide">
                            6 Premium Services
                          </span>
                        </div>
                        <h3
                          className="text-lg md:text-xl font-extrabold"
                          style={{ color: "#0B3855" }}
                        >
                          Complete Real Estate Solutions
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm mt-1 max-w-sm">
                          Buying, selling, financing, legal, management, and
                          investment—all under one trusted platform.
                        </p>
                      </div>
                      <div className="flex items-center -space-x-3 shrink-0 mx-auto md:mx-0 md:ml-auto">
                        {coreServices.map((service) => {
                          const Icon = service.icon;
                          const cm = colorMap[service.color];
                          return (
                            <div
                              key={service.id}
                              title={service.title}
                              className={`w-10 h-10 rounded-full ${cm.bg} ring-2 ring-white flex items-center justify-center shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:z-10`}
                            >
                              <Icon className="text-white" size={15} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              {bottomServices.map((service, i) => (
                <Reveal key={service.id} delay={i * 80} className="h-full">
                  <CompactServiceCard
                    ref={(el) => (bottomCardRefs.current[i] = el)}
                    service={service}
                    onViewMore={handleViewMore}
                  />
                </Reveal>
              ))}
            </div>

            {/* Connector SVG layer — placed ABOVE cards (z-20) so lines are clearly visible */}
            {svgBox.width > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none z-20"
                width={svgBox.width}
                height={svgBox.height}
                viewBox={`0 0 ${svgBox.width} ${svgBox.height}`}
                aria-hidden="true"
                style={{ overflow: "visible" }}
              >
                <defs>
                  {(Object.keys(colorMap) as ServiceColor[]).map((key) => (
                    <linearGradient
                      id={`grad-${key}`}
                      key={key}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={colorMap[key].hex}
                        stopOpacity="1"
                      />
                      <stop
                        offset="100%"
                        stopColor={colorMap[key].hex}
                        stopOpacity="0.85"
                      />
                    </linearGradient>
                  ))}
                </defs>

                {/* Pass 1: white halo behind every line for strong contrast */}
                <g>
                  {connectors.map((c, i) => (
                    <path
                      key={`halo-${c.id}`}
                      d={c.d}
                      stroke="#ffffff"
                      strokeWidth={6}
                      fill="none"
                      strokeLinecap="round"
                      pathLength={1}
                      className={`connector-halo ${sectionInView ? "draw" : ""}`}
                      style={{ transitionDelay: `${i * 110}ms` }}
                    />
                  ))}
                </g>

                {/* Pass 2: the visible colored connector line */}
                <g>
                  {connectors.map((c, i) => (
                    <path
                      key={`line-${c.id}`}
                      d={c.d}
                      stroke={`url(#grad-${c.colorKey})`}
                      strokeWidth={2.5}
                      fill="none"
                      strokeLinecap="round"
                      pathLength={1}
                      className={`connector-line ${sectionInView ? "draw" : ""}`}
                      style={{ transitionDelay: `${i * 110}ms` }}
                    />
                  ))}
                </g>

                {/* Pass 3: anchor dots at the ends of each line + travelling pulse dot */}
                <g>
                  {connectors.map((c, i) => {
                    // Extract start / end coordinates from the path string.
                    const startMatch = c.d.match(/^M\s+([\d.-]+)\s+([\d.-]+)/);
                    const endMatch = c.d.match(/([\d.-]+)\s+([\d.-]+)$/);
                    const sx = startMatch ? parseFloat(startMatch[1]) : 0;
                    const sy = startMatch ? parseFloat(startMatch[2]) : 0;
                    const ex = endMatch ? parseFloat(endMatch[1]) : 0;
                    const ey = endMatch ? parseFloat(endMatch[2]) : 0;
                    const hex = colorMap[c.colorKey].hex;
                    return (
                      <g key={`dots-${c.id}`}>
                        {/* Anchor dot at the card end */}
                        {sectionInView && (
                          <circle
                            cx={sx}
                            cy={sy}
                            r={4}
                            fill={hex}
                            stroke="#ffffff"
                            strokeWidth={2}
                            className="anchor-dot"
                            style={{ animationDelay: `${400 + i * 110}ms` }}
                          />
                        )}
                        {/* Anchor dot at the hub end */}
                        {sectionInView && (
                          <circle
                            cx={ex}
                            cy={ey}
                            r={4}
                            fill={hex}
                            stroke="#ffffff"
                            strokeWidth={2}
                            className="anchor-dot"
                            style={{ animationDelay: `${900 + i * 110}ms` }}
                          />
                        )}
                        {/* Travelling pulse dot */}
                        <circle
                          r={4.5}
                          fill={hex}
                          stroke="#ffffff"
                          strokeWidth={2}
                          className={sectionInView ? "pulse-dot" : ""}
                          style={{
                            offsetPath: `path('${c.d}')`,
                            animationDelay: `${i * 0.5}s`,
                          }}
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          {/* Mobile / tablet fallback — plain stacked list, no diagram */}
          <div className="lg:hidden mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Reveal className="col-span-1 sm:col-span-2">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 text-center mb-2">
                <h3
                  className="text-lg font-extrabold mb-1"
                  style={{ color: "#0B3855" }}
                >
                  Every real estate need, one team
                </h3>
                <p className="text-gray-500 text-xs">
                  Buying, selling, financing, legal, management and investment —
                  coordinated end-to-end.
                </p>
              </div>
            </Reveal>
            {coreServices.map((service, i) => (
              <Reveal key={service.id} delay={i * 60}>
                <CompactServiceCard
                  service={service}
                  onViewMore={handleViewMore}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ADDITIONAL SERVICES (Animated & Premium) ============ */}
      <section ref={additionalRef} className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              title="Additional Services"
              subtitle="Specialized services to enhance your property experience"
            />
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5 items-stretch">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              const id = service.title.toLowerCase().replace(/\s+/g, "-");

              // Distinct premium colors for each card
              const colors = [
                {
                  bg: "from-[#3B82F6] to-[#2563EB]",
                  border: "border-[#3B82F6]/15",
                  btn: "hover:bg-[#3B82F6]/5 hover:text-[#3B82F6]",
                  price: "text-[#3B82F6]",
                },
                {
                  bg: "from-[#E6761D] to-[#F3924A]",
                  border: "border-[#E6761D]/15",
                  btn: "hover:bg-[#E6761D]/5 hover:text-[#E6761D]",
                  price: "text-[#E6761D]",
                },
                {
                  bg: "from-[#10B981] to-[#34D399]",
                  border: "border-[#10B981]/15",
                  btn: "hover:bg-[#10B981]/5 hover:text-[#10B981]",
                  price: "text-[#10B981]",
                },
                {
                  bg: "from-[#6366F1] to-[#818CF8]",
                  border: "border-[#6366F1]/15",
                  btn: "hover:bg-[#6366F1]/5 hover:text-[#6366F1]",
                  price: "text-[#6366F1]",
                },
              ];
              const c = colors[index % colors.length];

              return (
                <div
                  key={index}
                  className={`group bg-white border ${c.border} rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center flex flex-col h-full service-card-anim`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center mx-auto mb-3 shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="text-white" size={14} />
                  </div>
                  <h3 className="text-xs md:text-sm font-bold text-gray-800 mb-1">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-[10px] md:text-xs leading-relaxed mb-2">
                    {service.description}
                  </p>
                  <div
                    className={`font-semibold mb-3 text-[10px] md:text-xs ${c.price}`}
                  >
                    {service.price}
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() =>
                        handleGetStarted({ id, title: service.title })
                      }
                      className={`w-full bg-gray-50 text-gray-700 py-1.5 px-2 rounded-lg border border-gray-100 ${c.btn} transition-all text-[10px] md:text-xs font-medium hover:shadow-sm`}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE US — PREMIUM COMPACT JOURNEY ============ */}
      <section
        ref={whyChooseRef}
        className="py-12 md:py-16 bg-gradient-to-b from-[#f8fafc] to-[#eff6ff] relative overflow-hidden"
      >
        {/* Subtle background decorative blobs */}
        <div
          className="absolute top-0 right-0 w-64 h-64 md:w-[400px] md:h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: "#E6761D" }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 md:w-[400px] md:h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: "#0B3855" }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <div className="text-center mb-10 md:mb-12">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3"
                style={{ backgroundColor: "#FDF0E6", color: "#E6761D" }}
              >
                <span className="text-xs md:text-sm font-semibold tracking-wide">
                  Why Trust Us
                </span>
              </div>
              <h2
                className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-2"
                style={{ color: "#0B3855" }}
              >
                Why Choose {companyName || "ResaleExpert"}?
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                Excellence backed by experience and innovation. Your success
                journey mapped out step by step.
              </p>
            </div>
          </Reveal>

          {/* Desktop Compact Journey Road */}
          <div className="hidden lg:block relative w-full h-[260px] max-w-5xl mx-auto">
            {/* SVG Road Layer */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1000 260"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="journeyGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="33%" stopColor="#E6761D" />
                  <stop offset="66%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              {/* The dotted line path - more compact curve */}
              <path
                d="M 50 190 C 150 190, 150 90, 280 90 C 410 90, 410 160, 550 160 C 690 160, 690 70, 950 70"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2.5"
                strokeDasharray="4 10"
                strokeLinecap="round"
                pathLength={1}
                className={`journey-svg-path ${journeyInView ? "drawn" : ""}`}
              />
            </svg>

            {/* Nodes Layer */}
            <div className="absolute inset-0 flex justify-between items-center px-[4%]">
              {/* Node 1 */}
              <div
                className="relative flex flex-col items-center"
                style={{ marginTop: "90px" }}
              >
                <div
                  className={`journey-node relative z-10 flex flex-col items-center ${journeyInView ? "animate" : ""}`}
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-blue-500 relative z-10 journey-node-float">
                      <Award className="text-blue-500" size={20} />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rotate-45 z-0"></div>
                  </div>
                  <div
                    className="mt-4 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 text-center w-48 journey-label animate"
                    style={{ animationDelay: "800ms" }}
                  >
                    <div className="text-lg font-extrabold text-blue-600 mb-0.5">
                      12+{" "}
                      <span className="text-[10px] font-medium text-gray-400 uppercase">
                        years
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 mb-0.5">
                      Years of Excellence
                    </h3>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Decades of expertise in real estate
                    </p>
                  </div>
                </div>
              </div>

              {/* Node 2 */}
              <div
                className="relative flex flex-col items-center"
                style={{ marginTop: "-30px" }}
              >
                <div
                  className={`journey-node relative z-10 flex flex-col items-center ${journeyInView ? "animate" : ""}`}
                  style={{ animationDelay: "900ms" }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-[#E6761D] relative z-10 journey-node-float delay-1">
                      <Shield className="text-[#E6761D]" size={20} />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#E6761D] rotate-45 z-0"></div>
                  </div>
                  <div
                    className="mt-4 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 text-center w-48 journey-label animate"
                    style={{ animationDelay: "1500ms" }}
                  >
                    <div className="text-lg font-extrabold text-[#E6761D] mb-0.5">
                      100%
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 mb-0.5">
                      Verified Properties
                    </h3>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      100% legal and verified listings
                    </p>
                  </div>
                </div>
              </div>

              {/* Node 3 */}
              <div
                className="relative flex flex-col items-center"
                style={{ marginTop: "50px" }}
              >
                <div
                  className={`journey-node relative z-10 flex flex-col items-center ${journeyInView ? "animate" : ""}`}
                  style={{ animationDelay: "1600ms" }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-[#10B981] relative z-10 journey-node-float delay-2">
                      <Briefcase className="text-[#10B981]" size={20} />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#10B981] rotate-45 z-0"></div>
                  </div>
                  <div
                    className="mt-4 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 text-center w-48 journey-label animate"
                    style={{ animationDelay: "2200ms" }}
                  >
                    <div className="text-lg font-extrabold text-[#10B981] mb-0.5">
                      50+{" "}
                      <span className="text-[10px] font-medium text-gray-400 uppercase">
                        experts
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 mb-0.5">
                      Expert Team
                    </h3>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Certified real estate professionals
                    </p>
                  </div>
                </div>
              </div>

              {/* Node 4 */}
              <div
                className="relative flex flex-col items-center"
                style={{ marginTop: "-10px" }}
              >
                <div
                  className={`journey-node relative z-10 flex flex-col items-center ${journeyInView ? "animate" : ""}`}
                  style={{ animationDelay: "2300ms" }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-[#6366F1] relative z-10 journey-node-float delay-3">
                      <Users className="text-[#6366F1]" size={20} />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#6366F1] rotate-45 z-0"></div>
                  </div>
                  <div
                    className="mt-4 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 text-center w-48 journey-label animate"
                    style={{ animationDelay: "2900ms" }}
                  >
                    <div className="text-lg font-extrabold text-[#6366F1] mb-0.5">
                      98%
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 mb-0.5">
                      Customer Satisfaction
                    </h3>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Happy customers across India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Fallback for Why Choose Us — Compact Grid */}
          <div className="lg:hidden mt-6 grid grid-cols-2 gap-3">
            {whyChooseUs.map((reason, idx) => {
              const Icon = reason.icon;
              const gradients = [
                "from-[#3B82F6] to-[#2563EB]",
                "from-[#E6761D] to-[#F3924A]",
                "from-[#10B981] to-[#34D399]",
                "from-[#6366F1] to-[#818CF8]",
              ];
              const grad = gradients[idx % gradients.length];
              return (
                <Reveal key={idx} delay={idx * 90}>
                  <div className="group relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-full">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3 shadow-md`}
                    >
                      <Icon className="text-white" size={18} />
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-xl font-extrabold text-gray-800">
                        {reason.stat}
                      </span>
                      {reason.suffix && (
                        <span className="text-gray-400 text-[9px] font-medium uppercase tracking-wide">
                          {reason.suffix}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 mb-1">
                      {reason.title}
                    </h3>
                    <p className="text-gray-500 text-[10px] leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={120}>
            <div className="mt-10 text-center">
              <div className="inline-flex flex-wrap justify-center gap-3 md:gap-5 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2.5 md:px-6 md:py-3 shadow-sm border border-white/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: "#0B3855" }} />
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    100% Legal Compliance
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" style={{ color: "#E6761D" }} />
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    No Hidden Charges
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    AI-Powered Matching
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ OUR SERVICE PROCESS (Circular & Animated) ============ */}
      <section ref={processRef} className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              title="Our Service Process"
              subtitle="Simple, transparent, and efficient workflow"
            />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {serviceProcess.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <Reveal key={index} delay={index * 150}>
                  <div className="relative group">
                    {/* Connector line for desktop */}
                    {index < serviceProcess.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 z-0 bg-gray-100 overflow-hidden rounded-full">
                        <div
                          className={`h-full w-full bg-gradient-to-r from-[#0C3855] to-[#E6761D] process-line ${processInView ? "grow" : ""}`}
                          style={{ animationDelay: `${index * 300}ms` }}
                        />
                      </div>
                    )}

                    <div className="relative flex flex-col items-center text-center">
                      {/* Step Number + Icon - Circular */}
                      <div className="relative mb-5">
                        <div
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all z-10 step-circle"
                          style={{ backgroundColor: "#0C3855" }}
                        >
                          <StepIcon className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white shadow-md border-2 border-white"
                          style={{ backgroundColor: "#E6761D" }}
                        >
                          {step.step}
                        </div>
                      </div>

                      <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 text-xs md:text-sm leading-relaxed px-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS (Redesigned & Premium) ============ */}
      <section className="py-10 md:py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              title="Client Success Stories"
              subtitle="What our clients say about our services"
            />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="relative bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col group overflow-hidden">
                  {/* Decorative background gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E6761D]/5 to-[#0C3855]/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                  {/* Quote Icon */}
                  <Quote
                    className="absolute top-6 right-6 text-gray-100 group-hover:text-[#E6761D]/10 transition-colors duration-300"
                    size={48}
                    strokeWidth={1.5}
                  />

                  {/* Rating Stars */}
                  <div className="relative flex items-center gap-1 mb-4">
                    <div className="inline-flex items-center gap-0.5 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star
                          key={j}
                          size={12}
                          className="text-yellow-500 fill-current"
                        />
                      ))}
                      <span className="ml-1 text-[10px] font-bold text-yellow-700">
                        {t.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <p className="relative text-gray-700 mb-6 leading-relaxed text-sm md:text-base flex-1">
                    "{t.text}"
                  </p>

                  {/* Author Info */}
                  <div className="relative flex items-center gap-3 pt-4 border-t border-gray-100">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-[#0C3855]/10 shadow-md"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-sm md:text-base">
                        {t.name}
                      </div>
                      <div className="text-[11px] md:text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="font-medium text-[#E6761D]">
                          {t.service}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{t.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}

      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              title="Transparent Pricing"
              subtitle="Choose the plan that works best for you"
            />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {/* Basic */}
            <Reveal delay={0} className="h-full">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#3B82F6] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Basic
                  </h3>
                  <div
                    className="text-4xl font-bold mb-2"
                    style={{ color: "#3B82F6" }}
                  >
                    Free
                  </div>
                  <p className="text-gray-600">Perfect for first-time users</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Property search & listings",
                    "Basic property details",
                    "Contact property owners",
                    "Basic market insights",
                  ].map((t, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle style={{ color: "#3B82F6" }} size={16} />
                      <span className="text-gray-700">{t}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    handleGetStarted({ id: "basic-plan", title: "Basic Plan" })
                  }
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all mt-auto"
                >
                  Get Started
                </button>
              </div>
            </Reveal>

            {/* Premium */}
            <Reveal delay={120} className="h-full">
              <div
                className="relative text-white rounded-2xl p-8 transform md:scale-105 shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col"
                style={{
                  background: "linear-gradient(to right, #0B3855, #1A5276)",
                }}
              >
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full shadow-md"
                  style={{ backgroundColor: "#E6761D", color: "#ffffff" }}
                >
                  Most popular
                </div>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Crown className="text-yellow-300" size={24} />
                    <h3 className="text-2xl font-bold">Premium</h3>
                  </div>
                  <div className="text-4xl font-bold mb-2">₹2,999</div>
                  <p className="text-blue-100">Most popular choice</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Basic",
                    "Expert consultation",
                    "Site visit assistance",
                    "Legal verification",
                    "Loan assistance",
                  ].map((t, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle className="text-orange-300" size={16} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    handleGetStarted({
                      id: "premium-plan",
                      title: "Premium Plan",
                    })
                  }
                  className="w-full py-3 px-6 rounded-xl font-semibold transition-all mt-auto"
                  style={{ backgroundColor: "#E6761D", color: "#ffffff" }}
                  onMouseEnter={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#CC6A1A")
                  }
                  onMouseLeave={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#E6761D")
                  }
                >
                  Choose Premium
                </button>
              </div>
            </Reveal>

            {/* Enterprise */}
            <Reveal delay={240} className="h-full">
              <div
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                style={{ borderColor: "#0B3855" }}
              >
                <div className="text-center mb-6">
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#0B3855" }}
                  >
                    Enterprise
                  </h3>
                  <div
                    className="text-4xl font-bold mb-2"
                    style={{ color: "#E6761D" }}
                  >
                    Custom
                  </div>
                  <p className="text-gray-600">For large portfolios</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Premium",
                    "Dedicated relationship manager",
                    "Priority support",
                    "Custom solutions",
                  ].map((t, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle style={{ color: "#E6761D" }} size={16} />
                      <span className="text-gray-700">{t}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    handleGetStarted({
                      id: "enterprise-plan",
                      title: "Enterprise Plan",
                    })
                  }
                  className="w-full py-3 px-6 rounded-xl font-semibold transition-all mt-auto text-white"
                  style={{ backgroundColor: "#0B3855" }}
                  onMouseEnter={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#0A2F47")
                  }
                  onMouseLeave={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#0B3855")
                  }
                >
                  Contact Sales
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10 md:py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              title="Frequently Asked Questions"
              subtitle="Get answers to common questions about our services"
            />
          </Reveal>

          <div className="max-w-3xl mx-auto space-y-2 md:space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <Reveal key={index} delay={index * 60}>
                  <div
                    className={`bg-white rounded-xl shadow-sm border transition-colors duration-200 ${isOpen ? "border-[#0B3855]/30" : "border-gray-200"}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      className="w-full flex items-center justify-between gap-3 p-3 md:p-5 text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0`}
                          style={{
                            backgroundColor: isOpen ? "#E6761D" : "#d1d5db",
                          }}
                        />
                        <h3 className="text-xs md:text-sm lg:text-base font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        style={{ color: isOpen ? "#E6761D" : "#9ca3af" }}
                        size={18}
                      />
                    </button>
                    <div
                      id={`faq-panel-${index}`}
                      role="region"
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3 pb-3 md:px-5 md:pb-5 pt-0 pl-8 md:pl-11 text-gray-700 leading-relaxed text-xs md:text-sm">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        className="py-10 md:py-14 text-white"
        style={{ background: "linear-gradient(to right, #0B3855, #0A2F47)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-blue-100 mb-4 md:mb-6 max-w-2xl mx-auto px-2">
              Let our experts help you with your real estate needs. Get a free
              consultation today!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6">
              <button
                onClick={() => setShowQuickContact(true)}
                className="w-full sm:w-auto text-white px-5 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base"
                style={{ backgroundColor: "#E6761D" }}
                onMouseEnter={(e) =>
                  ((
                    e.currentTarget as HTMLButtonElement
                  ).style.backgroundColor = "#CC6A1A")
                }
                onMouseLeave={(e) =>
                  ((
                    e.currentTarget as HTMLButtonElement
                  ).style.backgroundColor = "#E6761D")
                }
              >
                Get Free Consultation
              </button>
              <button className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-2 border-white text-white px-5 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 text-sm md:text-base">
                Call Now: {phonePretty}
              </button>
            </div>
          </Reveal>
        </div>

        <ContactQuickModal
          open={showQuickContact}
          onClose={() => setShowQuickContact(false)}
          phoneE164={phoneE164}
          displayPhone={phonePretty}
          title={
            selectedService
              ? `Talk to an Expert — ${selectedService.title}`
              : "Talk to an Expert"
          }
          presetMessage={
            selectedService
              ? `Hi team, I'm interested in "${selectedService.title}". Please guide me.`
              : "Hi team, I'm interested in your services. Please guide me."
          }
        />
      </section>

      {/* ============ SERVICE DETAIL MODAL ============ */}
      <ServiceDetailModal
        service={detailService}
        onClose={() => setDetailService(null)}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
};

export default ServicesPage;
