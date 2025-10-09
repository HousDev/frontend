// src/components/DashboardTab.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
  Eye,
  ArrowRight,
} from "lucide-react";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";
import documentStatusAPI, { SnapshotRow } from "@/lib/documentStatusAPI";

type UIDoc = {
  id: number;
  title: string;
  type: string;
  client: string;              // legacy fallback
  buyerName?: string | null;
  sellerName?: string | null;
  status: string;              // fallback (overridden by snapshot current_status)
  date: string;                // YYYY-MM-DD
  priority: "high" | "medium" | "low";
};

const DashboardTab = ({ onNavigateToTracking }: { onNavigateToTracking?: () => void }) => {
  const [recentDocuments, setRecentDocuments] = useState<UIDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // snapshot status/progress cache by document id
  const [statusById, setStatusById] = useState<Record<number, SnapshotRow | undefined>>({});

  /* ------------------------ helpers ------------------------ */
  const toArray = (r: any): any[] => {
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.rows)) return r.rows;
    if (Array.isArray(r?.data)) return r.data;
    if (Array.isArray(r?.data?.rows)) return r.data.rows;
    if (Array.isArray(r?.list)) return r.list;
    return [];
  };

  const get = (o: any, paths: string[]) => {
    for (const p of paths) {
      const v = p.split(".").reduce((a: any, k: string) => (a ? a[k] : undefined), o);
      if (v != null && v !== "") return v;
    }
    return undefined;
  };

  const join = (...parts: (string | null | undefined)[]) =>
    parts.map((s) => (s ?? "").trim()).filter(Boolean).join(" ");

  const withDot = (s?: string) => (s ? (/\.$/.test(s) ? s : `${s}.`) : "");

  const pickName = (obj: any): string | null => {
    if (!obj) return null;
    return (
      obj.name ??
      obj.full_name ??
      obj.fullName ??
      obj.display_name ??
      (obj.first_name && obj.last_name ? `${obj.first_name} ${obj.last_name}` : null) ??
      obj.first_name ??
      obj.last_name ??
      null
    );
  };

  const normalizeEsign = (s?: string) =>
    s === "esign_pending" ? "e-sign_pending" : s;

  // true if ISO date is "today" in IST
  const isTodayIST = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    const fmt = (dt: Date) =>
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dt);
    const todayIST = fmt(new Date());
    const dateIST = fmt(d);
    return todayIST === dateIST;
  };

  // map backend item -> UI doc
  const mapToUIDoc = (d: any): UIDoc => {
    const title =
      d?.name ?? d?.title ?? d?.document_title ?? d?.template_name ?? "Untitled Document";
    const type = d?.category ?? d?.type ?? d?.template_type ?? "Document";

    // variables could be object or JSON string
    const vars =
      typeof d?.variables === "string"
        ? (() => {
            try {
              return JSON.parse(d.variables);
            } catch {
              return {};
            }
          })()
        : d?.variables || {};

    const snap = vars?.__form_snapshot || {};

    const sellerSal = get({ vars, snap, d }, [
      "vars.seller_salutation",
      "vars.seller.salutation",
      "vars.seller_title",
      "vars.seller.title",
      "snap.seller.salutation",
      "d.seller.salutation",
    ]) as string | undefined;

    const buyerSal = get({ vars, snap, d }, [
      "vars.buyer_salutation",
      "vars.buyer.salutation",
      "vars.buyer_title",
      "vars.buyer.title",
      "snap.buyer.salutation",
      "d.buyer.salutation",
    ]) as string | undefined;

    const sellerFull =
      (get({ vars, snap, d }, [
        "vars.seller_name",
        "vars.seller.name",
        "snap.seller.name",
        "d.seller.name",
      ]) as string | undefined) ||
      join(
        get({ vars, snap }, ["vars.seller.first_name", "snap.seller.first_name"]) as string,
        get({ vars, snap }, ["vars.seller.middle_name", "snap.seller.middle_name"]) as string,
        get({ vars, snap }, ["vars.seller.last_name", "snap.seller.last_name"]) as string
      ) ||
      pickName(d?.seller) ||
      (Array.isArray(d?.sellers) && d.sellers.length ? pickName(d.sellers[0]) : null);

    const buyerFull =
      (get({ vars, snap, d }, [
        "vars.buyer_name",
        "vars.buyer.name",
        "snap.buyer.name",
        "d.buyer.name",
      ]) as string | undefined) ||
      join(
        get({ vars, snap }, ["vars.buyer.first_name", "snap.buyer.first_name"]) as string,
        get({ vars, snap }, ["vars.buyer.middle_name", "snap.buyer.middle_name"]) as string,
        get({ vars, snap }, ["vars.buyer.last_name", "snap.buyer.last_name"]) as string
      ) ||
      pickName(d?.buyer) ||
      (Array.isArray(d?.buyers) && d.buyers.length ? pickName(d.buyers[0]) : null);

    const sellerName = join(withDot(sellerSal), sellerFull) || null;
    const buyerName = join(withDot(buyerSal), buyerFull) || null;

    const clientJoined =
      buyerName && sellerName
        ? `${buyerName} • ${sellerName}`
        : buyerName || sellerName || d?.client?.name || d?.party_name || "—";

    const apiStatus = normalizeEsign(d?.status) ?? "created";
    const iso = d?.updated_at ?? d?.created_at ?? new Date().toISOString();
    const date = String(iso).slice(0, 10);

    let priority: UIDoc["priority"] = "low";
    if (apiStatus === "e-sign_pending" || apiStatus === "otp_verified") priority = "high";
    else if (apiStatus === "shared") priority = "medium";

    return {
      id: Number(d?.id),
      title,
      type,
      client: clientJoined,
      buyerName,
      sellerName,
      status: apiStatus,
      date,
      priority,
    };
  };

  /* ------------------------ load docs ------------------------ */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const raw = await documentsGeneratedAPI.getAllWithRelations({
          limit: 10,
          order: "desc",
        });
        const list = toArray(raw).map(mapToUIDoc);
        list.sort((a, b) => (a.date < b.date ? 1 : -1));
        if (mounted) setRecentDocuments(list);
      } catch (e: any) {
        console.error(e);
        if (mounted) setErr(e?.message || "Failed to load documents");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------ fetch snapshots per id ------------------------ */
  useEffect(() => {
    if (!recentDocuments.length) return;
    let cancelled = false;

    const run = async () => {
      const ids = Array.from(
        new Set(recentDocuments.map((d) => Number(d.id)).filter((n) => Number.isFinite(n)))
      );
      const results = await Promise.allSettled(ids.map((id) => documentStatusAPI.getSnapshot(id)));
      if (cancelled) return;

      const map: Record<number, SnapshotRow | undefined> = {};
      results.forEach((res, i) => {
        const id = ids[i];
        if (res.status === "fulfilled" && res.value) map[id] = res.value;
      });
      setStatusById((prev) => ({ ...prev, ...map }));
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [recentDocuments]);

  /* ------------------------ live status + stats ------------------------ */
  const getLiveStatus = (doc: UIDoc): string => {
    const snap = statusById[doc.id];
    const fromSnap = normalizeEsign(snap?.current_status);
    return fromSnap || doc.status;
  };

  const derivedStats = useMemo(() => {
    const totalDocs = recentDocuments.length;

    // unique buyer+seller names (non-empty)
    const clients = new Set<string>();
    for (const d of recentDocuments) {
      if (d.buyerName && d.buyerName.trim()) clients.add(d.buyerName.trim());
      if (d.sellerName && d.sellerName.trim()) clients.add(d.sellerName.trim());
    }
    const activeClients = clients.size;

    // pending approvals = e-sign pending
    let pending = 0;

    // completed today (prefer snapshot.changed_at; fallback to doc.date)
    let completedToday = 0;

    for (const d of recentDocuments) {
      const live = getLiveStatus(d); // snapshot-aware
      if (live === "e-sign_pending") pending += 1;

      if (live === "completed") {
        const changedAt = statusById[d.id]?.changed_at || statusById[d.id]?.updated_at;
        if (isTodayIST(changedAt)) {
          completedToday += 1;
        } else {
          // fallback if no snapshot timestamp
          const docDayISO = d.date ? `${d.date}T00:00:00.000Z` : undefined;
          if (isTodayIST(docDayISO)) completedToday += 1;
        }
      }
    }

    return {
      totalDocs,
      activeClients,
      pendingApprovals: pending,
      completedToday,
    };
  }, [recentDocuments, statusById]);

  /* ------------------------ UI helpers ------------------------ */
  const getStatusBadge = (statusRaw: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
      "e-sign_pending": { bg: "bg-orange-100", text: "text-orange-800", label: "E-Sign Pending" },
      otp_verified: { bg: "bg-blue-100", text: "text-blue-800", label: "OTP Verified" },
      shared: { bg: "bg-purple-100", text: "text-purple-800", label: "Shared" },
      created: { bg: "bg-gray-100", text: "text-gray-800", label: "Created" },
      on_hold: { bg: "bg-amber-100", text: "text-amber-800", label: "On Hold" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
    };
    const config = statusConfig[statusRaw] ?? statusConfig.created;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: UIDoc["priority"]) => {
    const priorityConfig = {
      high: { bg: "bg-red-100", text: "text-red-700", label: "High" },
      medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
      low: { bg: "bg-green-100", text: "text-green-700", label: "Low" },
    } as const;

    const config = priorityConfig[priority];
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDocument = (docId: number) => {
    onNavigateToTracking?.();
  };

  const handleDownloadDocument = async (docId: number) => {
    try {
      setDownloadingId(docId);
      await documentsGeneratedAPI.downloadPdf(docId, {
        page: "a4",
        filenameFallback: `document-${docId}.pdf`,
      });
    } catch (e) {
      console.error(e);
      alert("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Buyer/Seller chips
  const PartiesCell: React.FC<{ buyer?: string | null; seller?: string | null; fallback: string }> = ({
    buyer,
    seller,
    fallback,
  }) => {
    if (!buyer && !seller) return <span className="text-xs text-gray-900">{fallback}</span>;
    return (
      <div className="grid items-center gap-1">
        {buyer ? (
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">
            Buyer: {buyer}
          </span>
        ) : null}
        {seller ? (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium">
            Seller: {seller}
          </span>
        ) : null}
      </div>
    );
  };

  /* ------------------------ render ------------------------ */
  return (
    <div className="p-4 space-y-4">
      {/* Error */}
      {err ? (
        <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-xs">
          {err}
        </div>
      ) : null}

      {/* Statistics Cards (dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Documents",
            value: String(derivedStats.totalDocs),
            icon: FileText,
            color: "blue",
          },
          {
            label: "Active Clients",
            value: String(derivedStats.activeClients),
            icon: Users,
            color: "green",
          },
          {
            label: "Pending Approvals",
            value: String(derivedStats.pendingApprovals),
            icon: Clock,
            color: "orange",
          },
          {
            label: "Completed Today",
            value: String(derivedStats.completedToday),
            icon: CheckCircle,
            color: "emerald",
          },
        ].map((stat, index) => {
          const Icon = stat.icon as any;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                {/* if Tailwind purges dynamic classes, map colors explicitly */}
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`text-${stat.color}-600`} size={18} />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-green-500" size={14} />
                <span className="text-gray-500 text-xs ml-1">live</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Documents</h2>
            <button
              onClick={onNavigateToTracking}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-xs text-gray-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {["Document", "Client", "Status", "Priority", "Date", "Actions"].map((col, i) => (
                    <th
                      key={i}
                      className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentDocuments.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500 text-xs" colSpan={6}>
                      No documents yet.
                    </td>
                  </tr>
                ) : (
                  recentDocuments.map((doc) => {
                    const liveStatus = getLiveStatus(doc);
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2">
                          <div>
                            <div className="text-xs font-medium text-gray-900">{doc.title}</div>
                            <div className="text-[11px] text-gray-500">{doc.type}</div>
                          </div>
                        </td>

                        {/* Buyer & Seller chips */}
                        <td className="px-4 py-2">
                          <PartiesCell buyer={doc.buyerName} seller={doc.sellerName} fallback={doc.client} />
                        </td>

                        <td className="px-4 py-2">{getStatusBadge(liveStatus)}</td>
                        <td className="px-4 py-2">{getPriorityBadge(doc.priority)}</td>
                        <td className="px-4 py-2 text-[11px] text-gray-500">{doc.date}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-1">
                            <button
                              title="View Document"
                              onClick={() => handleViewDocument(doc.id)}
                              className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              title="Download Document"
                              onClick={() => handleDownloadDocument(doc.id)}
                              disabled={downloadingId === doc.id}
                              className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-60 transition-colors"
                            >
                              {downloadingId === doc.id ? (
                                <span className="px-1 text-[10px]">…</span>
                              ) : (
                                <Download size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions + Template Usage + System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <button className="w-full sm:w-auto bg-blue-600 text-white py-1.5 px-4 rounded-lg hover:bg-blue-700 transition-colors text-xs">
              Generate New Document
            </button>
            <button className="w-full sm:w-auto bg-gray-100 text-gray-700 py-1.5 px-4 rounded-lg hover:bg-gray-200 transition-colors text-xs">
              Create Template
            </button>
            <button className="w-full sm:w-auto bg-gray-100 text-gray-700 py-1.5 px-4 rounded-lg hover:bg-gray-200 transition-colors text-xs">
              Add New Client
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Template Usage</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Sale Agreement</span>
              <span className="text-sm font-semibold">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Token Receipt</span>
              <span className="text-sm font-semibold">32</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">NOC Request</span>
              <span className="text-sm font-semibold">18</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">System Health</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">API Status: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Storage: Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
