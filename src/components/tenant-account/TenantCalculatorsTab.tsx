import React, { useState } from "react";
import {
  Calculator,
  IndianRupee,
  Users,
  User,
  Zap,
  Wifi,
  Droplets,
  ShieldAlert,
  Receipt,
  Mail,
  Phone,
  Calendar,
  Wallet,
  Home,
  Plus,
  X,
} from "lucide-react";

interface TenantCalculatorsTabProps {
  calcMonthlyIncome: number;
  setCalcMonthlyIncome: (income: number) => void;
  calcSecurityMonths: number;
  budgetMax: number;
}

type LivingSituation = "alone" | "shared";

interface Roommate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const AVATAR_PALETTE = [
  { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-200" },
  { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  { bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
];

const EMPTY_ROOMMATE: Roommate = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

// ---- Validation helpers -----------------------------------------------
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_LENGTH = 10;

const sanitizeName = (v: string) => v.replace(/[^A-Za-z\s'-]/g, "");
const sanitizePhone = (v: string) =>
  v.replace(/\D/g, "").slice(0, PHONE_LENGTH);

const isFirstNameValid = (r: Roommate) => NAME_REGEX.test(r.firstName.trim());
const isLastNameValid = (r: Roommate) => NAME_REGEX.test(r.lastName.trim());
const isEmailValid = (r: Roommate) => EMAIL_REGEX.test(r.email.trim());
const isPhoneValid = (r: Roommate) => r.phone.length === PHONE_LENGTH;
const isRoommateValid = (r: Roommate) =>
  isFirstNameValid(r) &&
  isLastNameValid(r) &&
  isEmailValid(r) &&
  isPhoneValid(r);

function initialsOf(first: string, last: string) {
  const f = first.trim();
  const l = last.trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return "?";
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ---- Shared style tokens ------------------------------------------------
const inputBase =
  "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400";
const labelBase = "text-[10.5px] font-medium text-slate-500 block mb-1";
const errorText = "text-[10px] text-red-500 mt-1";
const cardBase =
  "bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all hover:border-slate-300";
const statCardBase =
  "bg-white rounded-xl border border-slate-200 p-3 shadow-sm transition-all hover:border-slate-300";

export default function TenantCalculatorsTab({
  calcMonthlyIncome,
  setCalcMonthlyIncome,
  calcSecurityMonths,
  budgetMax,
}: TenantCalculatorsTabProps) {
  const [livingSituation, setLivingSituation] =
    useState<LivingSituation>("alone");

  const [rentAmount, setRentAmount] = useState<number>(budgetMax || 30000);
  const [secMonths, setSecMonths] = useState<number>(calcSecurityMonths || 3);

  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [draft, setDraft] = useState<Roommate>({ ...EMPTY_ROOMMATE });
  const [draftTouched, setDraftTouched] = useState<Record<string, boolean>>({});

  const [elecBill, setElecBill] = useState(2400);
  const [wifiBill, setWifiBill] = useState(999);
  const [waterBill, setWaterBill] = useState(500);
  const [maintBill, setMaintBill] = useState(2000);
  const [rentDueDay, setRentDueDay] = useState(5);

  const updateDraft = (field: keyof Roommate, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };
  const markDraftTouched = (field: keyof Roommate) => {
    setDraftTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleAddRoommate = () => {
    if (!isRoommateValid(draft)) {
      setDraftTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      });
      return;
    }
    setRoommates((prev) => [...prev, draft]);
    setDraft({ ...EMPTY_ROOMMATE });
    setDraftTouched({});
  };

  const removeRoommate = (index: number) => {
    setRoommates((prev) => prev.filter((_, i) => i !== index));
  };

  const occupantCount = livingSituation === "alone" ? 1 : roommates.length + 1;

  const moveInTotal = rentAmount * (secMonths + 1);
  const totalUtilityCost = elecBill + wifiBill + waterBill + maintBill;
  const perPersonUtilityShare = Math.round(totalUtilityCost / occupantCount);
  const perPersonRentShare =
    livingSituation === "shared"
      ? Math.round(rentAmount / occupantCount)
      : rentAmount;
  const perPersonTotal = perPersonUtilityShare + perPersonRentShare;

  const people =
    livingSituation === "alone"
      ? [
        {
          name: "You",
          rentShare: rentAmount,
          utilShare: perPersonUtilityShare,
        },
      ]
      : [
        {
          name: "You",
          rentShare: perPersonRentShare,
          utilShare: perPersonUtilityShare,
        },
        ...roommates.map((r) => ({
          name: `${r.firstName} ${r.lastName}`.trim() || "Roommate",
          rentShare: perPersonRentShare,
          utilShare: perPersonUtilityShare,
        })),
      ];

  const categories = [
    { label: "Rent", value: rentAmount, color: "#f97316" },
    { label: "Electricity", value: elecBill, color: "#f59e0b" },
    { label: "Wi-Fi", value: wifiBill, color: "#a855f7" },
    { label: "Water", value: waterBill, color: "#3b82f6" },
    { label: "Maintenance", value: maintBill, color: "#64748b" },
  ];
  const totalMonthlyOutgo = categories.reduce((sum, c) => sum + c.value, 0);
  let cumulative = 0;
  const gradientStops = categories.map((c) => {
    const start =
      totalMonthlyOutgo > 0 ? (cumulative / totalMonthlyOutgo) * 360 : 0;
    cumulative += c.value;
    const end =
      totalMonthlyOutgo > 0 ? (cumulative / totalMonthlyOutgo) * 360 : 0;
    return `${c.color} ${start}deg ${end}deg`;
  });
  const conicGradient =
    totalMonthlyOutgo > 0
      ? `conic-gradient(${gradientStops.join(", ")})`
      : "#e2e8f0";

  const billRows = [
    {
      label: "Rent",
      value: rentAmount,
      icon: Home,
      bg: "bg-orange-100",
      fg: "text-orange-600",
    },
    {
      label: "Electricity",
      value: elecBill,
      icon: Zap,
      bg: "bg-amber-100",
      fg: "text-amber-600",
    },
    {
      label: "Wi-Fi / broadband",
      value: wifiBill,
      icon: Wifi,
      bg: "bg-purple-100",
      fg: "text-purple-600",
    },
    {
      label: "Water",
      value: waterBill,
      icon: Droplets,
      bg: "bg-blue-100",
      fg: "text-blue-600",
    },
    {
      label: "Maintenance",
      value: maintBill,
      icon: ShieldAlert,
      bg: "bg-slate-200",
      fg: "text-slate-600",
    },
  ];

  const firstNameErr =
    draftTouched.firstName && draft.firstName && !isFirstNameValid(draft);
  const lastNameErr =
    draftTouched.lastName && draft.lastName && !isLastNameValid(draft);
  const emailErr = draftTouched.email && draft.email && !isEmailValid(draft);
  const phoneErr = draftTouched.phone && draft.phone && !isPhoneValid(draft);

  return (
    <div className="space-y-4">
      {/* ============ 1. OVERVIEW: 6 COMPACT CARDS ============ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className={statCardBase}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-medium">
              Monthly cost
            </span>
            <Wallet size={13} className="text-orange-500" />
          </div>
          <p className="text-lg font-black text-slate-900 mt-1 tracking-tight">
            ₹
            {(livingSituation === "shared"
              ? perPersonTotal
              : rentAmount + totalUtilityCost
            ).toLocaleString("en-IN")}
          </p>
          <p className="text-[9.5px] text-slate-400 mt-0.5">
            {livingSituation === "shared"
              ? `${occupantCount} people`
              : "Living alone"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span className="text-[10px] font-semibold">Rent due</span>
          </div>
          <input
            type="number"
            min={1}
            max={31}
            value={rentDueDay}
            onChange={(e) =>
              setRentDueDay(
                Math.min(31, Math.max(1, Number(e.target.value) || 1)),
              )
            }
            className="mt-1.5 w-12 px-2 py-1 rounded-md text-slate-900 font-bold text-xs outline-none"
          />
          <p className="text-[9.5px] mt-1 text-emerald-50">
            {ordinal(rentDueDay)} monthly
          </p>
        </div>

        <div className={statCardBase}>
          <p className="text-[10px] text-slate-500">Recommended rent</p>
          <p className="text-base font-black text-emerald-700 mt-1 tracking-tight">
            ₹{Math.round(calcMonthlyIncome * 0.3).toLocaleString("en-IN")}
          </p>
        </div>

        <div className={statCardBase}>
          <p className="text-[10px] text-slate-500">Move-in capital</p>
          <p className="text-base font-black text-orange-700 mt-1 tracking-tight">
            ₹{moveInTotal.toLocaleString("en-IN")}
          </p>
        </div>

        <div className={statCardBase}>
          <p className="text-[10px] text-slate-500">Monthly utilities</p>
          <p className="text-base font-black text-blue-700 mt-1 tracking-tight">
            ₹{totalUtilityCost.toLocaleString("en-IN")}
          </p>
        </div>

        <div className={statCardBase}>
          <p className="text-[10px] text-slate-500">Per person / mo</p>
          <p className="text-base font-black text-purple-700 mt-1 tracking-tight">
            ₹{perPersonTotal.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ============ 2. SPLITTER + BREAKDOWN + DONUT, ONE ROW ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className={cardBase}>
          <h2 className="font-bold text-[13px] text-slate-900 flex items-center gap-1.5">
            <IndianRupee className="text-blue-600" size={15} />
            Monthly bill splitter
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5 mb-3">
            {livingSituation === "alone"
              ? "You pay the full amount."
              : `Split between ${occupantCount} people.`}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelBase}>
                <Zap size={10} className="inline text-amber-500 mr-1" />
                Electricity
              </label>
              <input
                type="number"
                value={elecBill}
                onChange={(e) => setElecBill(Number(e.target.value) || 0)}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}>
                <Wifi size={10} className="inline text-purple-500 mr-1" />
                Wi-Fi
              </label>
              <input
                type="number"
                value={wifiBill}
                onChange={(e) => setWifiBill(Number(e.target.value) || 0)}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}>
                <Droplets size={10} className="inline text-blue-500 mr-1" />
                Water
              </label>
              <input
                type="number"
                value={waterBill}
                onChange={(e) => setWaterBill(Number(e.target.value) || 0)}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}>
                <ShieldAlert size={10} className="inline text-slate-500 mr-1" />
                Maintenance
              </label>
              <input
                type="number"
                value={maintBill}
                onChange={(e) => setMaintBill(Number(e.target.value) || 0)}
                className={inputBase}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500">
              Total{" "}
              <span className="font-bold text-slate-800">
                ₹{totalUtilityCost.toLocaleString("en-IN")}
              </span>
            </span>
            <span className="text-slate-500">
              Per person{" "}
              <span className="font-bold text-blue-700">
                ₹{perPersonUtilityShare.toLocaleString("en-IN")}
              </span>
            </span>
          </div>
        </div>

        <div className={cardBase}>
          <h2 className="font-bold text-[13px] text-slate-900 mb-2">
            Monthly bill breakdown
          </h2>
          <div className="divide-y divide-slate-100">
            {billRows.map((row, i) => {
              const Icon = row.icon;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${row.bg} ${row.fg}`}
                    >
                      <Icon size={13} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {row.label}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    ₹{row.value.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cardBase}>
          <h2 className="font-bold text-[13px] text-slate-900 mb-3">
            Where your money goes
          </h2>
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-24 h-24 rounded-full relative shrink-0"
              style={{ background: conicGradient }}
            >
              <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-500">Total / mo</span>
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  ₹{totalMonthlyOutgo.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="w-full space-y-1">
              {categories.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[10.5px]"
                >
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.label}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {totalMonthlyOutgo > 0
                      ? Math.round((c.value / totalMonthlyOutgo) * 100)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ 3. WHO OWES WHAT ============ */}
      <div className={cardBase}>
        <h2 className="font-bold text-[13px] text-slate-900">Who owes what</h2>
        <p className="text-[10.5px] text-slate-500 mb-2.5">
          {livingSituation === "shared"
            ? "Rent + utility share, per person"
            : "Your full rent + utility cost"}
        </p>
        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {people.map((p, i) => {
            const palette = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
            const total = p.rentShare + p.utilShare;
            return (
              <div
                key={i}
                className="flex justify-between items-center px-3 py-2.5 bg-white"
              >
                <div className="flex gap-2.5 items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ring-2 ${palette.bg} ${palette.text} ${palette.ring}`}
                  >
                    {i === 0
                      ? "YO"
                      : initialsOf(
                        p.name.split(" ")[0] || "",
                        p.name.split(" ")[1] || "",
                      )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 block">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Rent ₹{p.rentShare.toLocaleString("en-IN")} + utilities ₹
                      {p.utilShare.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm text-slate-800">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ 4. RENT BUDGET + WHO'S SPLITTING, ONE ROW (LAST) ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Rent budget & move-in cost */}
        <div className={cardBase}>
          <div className="mb-3">
            <h2 className="font-bold text-[13px] text-slate-900">
              Rent budget & move-in cost
            </h2>
            <p className="text-[10.5px] text-slate-500">
              Calculate how much rent you can comfortably afford
            </p>
          </div>

          <div className="space-y-3">
            <div className="border border-slate-200 rounded-xl p-3.5 bg-gradient-to-b from-slate-50 to-white">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2.5">
                <Calculator className="text-orange-500" size={14} />
                Rent affordability
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelBase}>Monthly income (₹)</label>
                  <input
                    type="number"
                    value={calcMonthlyIncome || ""}
                    onChange={(e) =>
                      setCalcMonthlyIncome(Number(e.target.value) || 0)
                    }
                    className={`${inputBase} focus:ring-orange-400/40 focus:border-orange-400`}
                  />
                </div>
                <div>
                  <label className={labelBase}>Target rent (₹)</label>
                  <input
                    type="number"
                    value={rentAmount || ""}
                    onChange={(e) => setRentAmount(Number(e.target.value) || 0)}
                    className={`${inputBase} focus:ring-orange-400/40 focus:border-orange-400`}
                  />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 mt-2.5">
                <p className="text-[10.5px] text-emerald-700 font-medium">
                  Recommended max rent (30% rule)
                </p>
                <p className="font-black text-emerald-700 text-lg tracking-tight">
                  ₹{Math.round(calcMonthlyIncome * 0.3).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 bg-gradient-to-b from-slate-50 to-white">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2.5">
                <IndianRupee className="text-orange-500" size={14} />
                Move-in cost
              </h3>

              <div className="mb-2">
                <label className={labelBase}>Security deposit (months)</label>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={secMonths}
                  onChange={(e) =>
                    setSecMonths(Math.max(0, Number(e.target.value) || 0))
                  }
                  className={`${inputBase} focus:ring-orange-400/40 focus:border-orange-400`}
                />
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 text-[11.5px]">
                <span className="text-slate-500">First month rent</span>
                <span className="font-semibold text-slate-800">
                  ₹{rentAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-[11.5px]">
                <span className="text-slate-500">
                  Security deposit ({secMonths} mo)
                </span>
                <span className="font-semibold text-slate-800">
                  ₹{(rentAmount * secMonths).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5 mt-2.5">
                <p className="text-[10.5px] text-orange-700 font-medium">
                  Total required upfront
                </p>
                <p className="font-black text-orange-700 text-lg tracking-tight">
                  ₹{moveInTotal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who's splitting the bills */}
        <div className={cardBase}>
          <h2 className="font-bold text-[13px] text-slate-900 flex gap-1.5 items-center">
            <Users className="text-blue-600" size={16} />
            Who's splitting the bills?
          </h2>

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setLivingSituation("alone")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${livingSituation === "alone"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
            >
              <User size={13} />
              Living alone
            </button>

            <button
              onClick={() => setLivingSituation("shared")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${livingSituation === "shared"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
            >
              <Users size={13} />
              With roommates
            </button>
          </div>

          {livingSituation === "shared" && (
            <div className="mt-4 space-y-3">
              {/* Already-added roommates */}
              {roommates.length > 0 && (
                <div className="space-y-1.5">
                  {roommates.map((r, i) => {
                    const palette = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ring-2 ${palette.bg} ${palette.text} ${palette.ring}`}
                          >
                            {initialsOf(r.firstName, r.lastName)}
                          </div>
                          <span className="text-xs font-semibold text-slate-800">
                            {r.firstName} {r.lastName}
                          </span>
                        </div>
                        <button
                          onClick={() => removeRoommate(i)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove roommate"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add-roommate form */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
                <h3 className="font-semibold text-xs text-slate-800 mb-2.5">
                  Add a roommate
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder="First name"
                      value={draft.firstName}
                      onChange={(e) =>
                        updateDraft("firstName", sanitizeName(e.target.value))
                      }
                      onBlur={() => markDraftTouched("firstName")}
                      className={inputBase}
                    />
                    {firstNameErr && <p className={errorText}>Letters only</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={draft.lastName}
                      onChange={(e) =>
                        updateDraft("lastName", sanitizeName(e.target.value))
                      }
                      onBlur={() => markDraftTouched("lastName")}
                      className={inputBase}
                    />
                    {lastNameErr && <p className={errorText}>Letters only</p>}
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="relative">
                    <Mail
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={13}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={draft.email}
                      onChange={(e) => updateDraft("email", e.target.value)}
                      onBlur={() => markDraftTouched("email")}
                      className={`${inputBase} pl-8`}
                    />
                  </div>
                  {emailErr && <p className={errorText}>Invalid email</p>}
                </div>

                <div className="mt-2.5 flex items-start gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Phone
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={13}
                      />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={draft.phone}
                        onChange={(e) =>
                          updateDraft("phone", sanitizePhone(e.target.value))
                        }
                        onBlur={() => markDraftTouched("phone")}
                        className={`${inputBase} pl-8`}
                      />
                    </div>
                    {phoneErr && <p className={errorText}>Enter 10 digits</p>}
                  </div>

                  <button
                    onClick={handleAddRoommate}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
              </div>

              {roommates.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-700">
                  Add at least one roommate above to split rent and bills
                  between you.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
