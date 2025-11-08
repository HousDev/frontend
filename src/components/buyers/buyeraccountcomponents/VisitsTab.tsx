// src/components/buyers/VisitsTab.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus, Eye, Calendar, MessageCircle, MapPin, Star,
  ChevronDown, ChevronRight, Clock
} from "lucide-react";
import { visitsAPI } from "@/lib/visitsAPI";

interface VisitsTabProps {
  buyer: any;
  onScheduleVisit: () => void; // open VisitModal from parent
}

/* ---------------- Time helpers ---------------- */

/** Parse various DB timestamp shapes to a JS Date in LOCAL time. */
const parseDbTimestampToDate = (ts?: string | null): Date => {
  if (!ts) return new Date(NaN);
  const str = String(ts).trim();

  // Backend sometimes sends IST time but with 'Z' (UTC) suffix — treat as UTC then shift to IST
  if (str.endsWith("Z")) {
    const utcDate = new Date(str);
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    return new Date(utcDate.getTime() + IST_OFFSET);
  }

  // Proper ISO with timezone or "T"
  if (/[tT]|\+/.test(str)) return new Date(str);

  // "YYYY-MM-DD HH:mm:ss" (or "YYYY-MM-DD  HH:mm" etc.) — treat as **LOCAL**
  const m = str.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );
  if (m) {
    const [, y, mo, d, h, mi, s = "0"] = m;
    return new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      Number(s)
    );
  }

  // Let Date try its best (still local)
  return new Date(str);
};

/** Format "Nov 12, 2025, 5:30 AM" */
const formatAbsoluteLocal = (date: Date) => {
  if (Number.isNaN(date.getTime())) return "Unknown time";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${month} ${day}, ${year}, ${hours}:${minStr} ${ampm}`;
};

/** "x min ago" etc. */
const formatRelative = (ts?: string | null) => {
  const when = parseDbTimestampToDate(ts ?? "");
  if (Number.isNaN(when.getTime())) return "Unknown time";
  const diffMin = Math.floor((Date.now() - when.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD}d ago`;
};

/** Accepts "05:30", "5:30", "05:30 am", "05:30 PM" → returns "HH:mm:00" (24h) */
const normalizeTime = (t?: string | null) => {
  if (!t) return "";
  const str = String(t).trim().toLowerCase();

  // hh:mm am/pm
  const ap = str.match(/^(\d{1,2}):(\d{2})\s*([ap]m)$/i);
  if (ap) {
    let hh = Number(ap[1]);
    const mm = Number(ap[2]);
    const mer = ap[3].toLowerCase();

    if (mer === "pm" && hh < 12) hh += 12;
    if (mer === "am" && hh === 12) hh = 0;

    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
  }

  // hh:mm (24h)
  const m24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const hh = Math.min(23, Math.max(0, Number(m24[1])));
    const mm = Math.min(59, Math.max(0, Number(m24[2])));
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
  }

  // Last resort: try to parse Date and extract time
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;
  }
  return "";
};

const combineToDateTime = (date?: string | null, time?: string | null) => {
  if (!date) return "";
  const t = normalizeTime(time || "10:00");
  return `${date} ${t}`; // local style
};

const stamp = (ts?: string | null) => {
  const d = parseDbTimestampToDate(ts ?? "");
  return `${formatAbsoluteLocal(d)} · ${formatRelative(ts ?? "")}`;
};

/* ---------------- Types (view model) ---------------- */
type VisitVM = {
  id: string | number;
  property: string;
  address?: string;
  seller?: string;
  seller_phone?: string | null;

  visit_datetime?: string | null;
  visit_date?: string | null;
  visit_time?: string | null;

  status: string;
  rating?: number;
  feedback?: string | null;
};

type RevisitVM = {
  id: string | number;
  revisit_datetime?: string | null;
  revisit_date?: string | null;
  revisit_time?: string | null;
  status?: string;
  remarks?: string | null;
  rating?: number | null;
};

/* ---------------- Component ---------------- */
const VisitsTab: React.FC<VisitsTabProps> = ({ buyer, onScheduleVisit }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visits, setVisits] = useState<VisitVM[]>([]);

  // revisits cache keyed by visitId
  const [revisitsMap, setRevisitsMap] = useState<Record<string | number, RevisitVM[]>>({});
  const [expanding, setExpanding] = useState<Record<string | number, boolean>>({});

  // fetch visits for buyer
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await visitsAPI.getAllVisits({ buyer_id: buyer?.id, limit: 100, page: 1 });
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const norm: VisitVM[] = rows.map((v: any) => ({
          id: v.id ?? v.visit_id ?? v._id ?? Math.random(),
          property: `${v.property_title ?? v.property ?? "Property"}`,
          address: v.address ?? v.meet_point ?? "",
          seller: v.seller_name ?? "",
          seller_phone: v.seller_phone ?? null,
          visit_datetime: v.visit_datetime ?? v.datetime ?? null,
          visit_date: v.visit_date ?? null,
          visit_time: v.visit_time ?? null,
          status: (v.status ?? "scheduled").toString(),
          rating: Number.isFinite(+v.rating) ? +v.rating : 0,
          feedback: v.feedback ?? null,
        }));

        // sort by time desc
        norm.sort((a, b) => {
          const ta = parseDbTimestampToDate(
            a.visit_datetime || combineToDateTime(a.visit_date, a.visit_time)
          ).getTime();
          const tb = parseDbTimestampToDate(
            b.visit_datetime || combineToDateTime(b.visit_date, b.visit_time)
          ).getTime();
          return tb - ta;
        });

        if (mounted) setVisits(norm);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load visits");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [buyer?.id]);

  const getVisitStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    const cfg: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "Scheduled", icon: "📅" },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed", icon: "✅" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled", icon: "❌" },
      rescheduled: { bg: "bg-orange-100", text: "text-orange-700", label: "Rescheduled", icon: "🔄" },
      done: { bg: "bg-green-100", text: "text-green-700", label: "Completed", icon: "✅" },
    };
    const c = cfg[s] || cfg.scheduled;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  const stats = useMemo(() => {
    const total = visits.length;
    const completed = visits.filter(v => ["completed", "done"].includes((v.status || "").toLowerCase())).length;
    const scheduled = visits.filter(v => (v.status || "").toLowerCase() === "scheduled").length;
    const highRated = visits.filter(v => (v.rating ?? 0) >= 4).length;
    return { total, completed, scheduled, highRated };
  }, [visits]);

  const toggleExpand = async (visitId: string | number) => {
    // collapse
    if (revisitsMap[visitId]) {
      const copy = { ...revisitsMap };
      delete copy[visitId];
      setRevisitsMap(copy);
      return;
    }

    // expand -> fetch revisits
    setExpanding(prev => ({ ...prev, [visitId]: true }));
    try {
      const res = await visitsAPI.getRevisitsByVisit(visitId);

      // ---- console logs for debugging ----
      // Raw payload from API
      // (You'll see this when you expand a visit in the UI)
      console.log("[Revisits] raw response for visit", visitId, res);

      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const norm: RevisitVM[] = arr.map((r: any) => ({
        id: r.id ?? r.revisit_id ?? Math.random(),
        revisit_datetime: r.revisit_datetime ?? r.datetime ?? null,
        revisit_date: r.revisit_date ?? null,
        revisit_time: r.revisit_time ?? r.time ?? null,
        status: r.status ?? "scheduled",
        remarks: r.remarks ?? r.feedback ?? null,
        rating: Number.isFinite(+r.rating) ? +r.rating : null,
      }));

      // Another log: normalized list (what we actually render)
      console.log("[Revisits] normalized list for visit", visitId, norm);

      // sort asc by time
      norm.sort((a, b) => {
        const ta = parseDbTimestampToDate(
          a.revisit_datetime || combineToDateTime(a.revisit_date, a.revisit_time)
        ).getTime();
        const tb = parseDbTimestampToDate(
          b.revisit_datetime || combineToDateTime(b.revisit_date, b.revisit_time)
        ).getTime();
        return ta - tb;
      });

      setRevisitsMap(prev => ({ ...prev, [visitId]: norm }));
    } catch (e) {
      console.warn("[Revisits] fetch failed for visit", visitId, e);
    } finally {
      setExpanding(prev => {
        const cp = { ...prev };
        delete cp[visitId];
        return cp;
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Site Visits</h3>
        <button
          onClick={onScheduleVisit}
          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
        >
          <Plus size={14} />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Visit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-blue-700">Total Visits</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-green-700">Completed</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-lg font-bold text-orange-600">{stats.scheduled}</div>
          <div className="text-xs text-orange-700">Scheduled</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-600">{stats.highRated}</div>
          <div className="text-xs text-purple-700">Highly Rated</div>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-xs text-gray-500">Loading visits…</div>
        ) : error ? (
          <div className="text-xs text-red-600">{error}</div>
        ) : visits.length === 0 ? (
          <div className="text-xs text-gray-500">No visits yet.</div>
        ) : (
          visits.map((visit) => {
            const ts =
              visit.visit_datetime ||
              combineToDateTime(visit.visit_date || undefined, visit.visit_time || undefined);

            return (
              <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{visit.property}</h4>
                    {!!visit.address && (
                      <div className="flex items-center space-x-1 text-gray-600 mt-0.5 text-xs">
                        <MapPin size={12} />
                        <span>{visit.address}</span>
                      </div>
                    )}
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      {getVisitStatusBadge(visit.status)}
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        <Clock size={11} />
                        {stamp(ts)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {!!visit.seller && (
                      <div className="text-xs text-gray-500 mb-0.5">Seller: {visit.seller}</div>
                    )}
                    {(visit.rating ?? 0) > 0 && (
                      <div className="flex items-center justify-end space-x-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < (visit.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {visit.feedback ? (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500 text-xs">Feedback:</span>
                    <p className="text-gray-700 mt-0.5 text-xs">{visit.feedback}</p>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex items-center flex-wrap gap-2 mt-3">
                  <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
                    <Eye size={12} />
                    <span>View Property</span>
                  </button>

                  <button
                    onClick={onScheduleVisit}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                  >
                    <Calendar size={12} />
                    <span>Schedule Revisit</span>
                  </button>

                  <a
                    href={visit.seller_phone ? `tel:${String(visit.seller_phone).replace(/\D/g, "")}` : "#"}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors text-xs ${
                      visit.seller_phone
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!visit.seller_phone) e.preventDefault();
                    }}
                  >
                    <MessageCircle size={12} />
                    <span>Contact Seller</span>
                  </a>

                  {/* Expand / collapse revisits */}
                  <button
                    onClick={() => toggleExpand(visit.id)}
                    className="ml-auto inline-flex items-center space-x-1 px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                    title={revisitsMap[visit.id] ? "Hide revisits" : "Show revisits"}
                  >
                    {revisitsMap[visit.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>{revisitsMap[visit.id] ? "Hide Revisits" : "Show Revisits"}</span>
                  </button>
                </div>

                {/* Revisits list */}
                {revisitsMap[visit.id] && (
                  <div className="mt-2 border border-gray-200 rounded-md p-2 bg-white">
                    {expanding[visit.id] ? (
                      <div className="text-[11px] text-gray-500">Loading revisits…</div>
                    ) : revisitsMap[visit.id].length === 0 ? (
                      <div className="text-[11px] text-gray-500">No revisits yet.</div>
                    ) : (
                      <ul className="space-y-1">
                        {revisitsMap[visit.id].map((rv) => {
                          const rts =
                            rv.revisit_datetime ||
                            combineToDateTime(rv.revisit_date || undefined, rv.revisit_time || undefined);
                          return (
                            <li key={rv.id} className="text-[11px] text-gray-700 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                <Clock size={11} />
                                {stamp(rts)}
                              </span>
                              <span className="px-1 rounded bg-gray-100 text-gray-700">
                                {(rv.status || "scheduled")}
                              </span>
                              {rv.rating != null && rv.rating > 0 ? (
                                <span className="inline-flex items-center gap-0.5 ml-1">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      size={11}
                                      className={i < (rv.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}
                                    />
                                  ))}
                                </span>
                              ) : null}
                              {rv.remarks ? <span className="text-gray-500">— {rv.remarks}</span> : null}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VisitsTab;
