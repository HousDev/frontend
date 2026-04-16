// src/pages/dashboard/components/TemplateContentAI.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Wand2, Loader2, SlidersHorizontal, X } from "lucide-react";

type WithContent = { content: string; name?: string; channel?: string; category?: string; priority?: string; subject?: string };

type Props<T extends WithContent> = {
    formData: T;
    setFormData: (updater: (prev: T) => T) => void;
    /** Optional: if provided, component will POST here using fetch */
    endpoint?: string; // e.g. "/api/ai/generate-template"
};

export default function TemplateContentAI<T extends WithContent>({ formData, setFormData, endpoint }: Props<T>) {
    const [loading, setLoading] = useState(false);
    const [openPanel, setOpenPanel] = useState(false);

    // Local content mirrors formData.content so editor shows prefilled data and remains editable.
    const [localContent, setLocalContent] = useState<string>(() => (formData as any).content ?? "");
    // Local subject kept separate from template name (and optionally synced to parent subject field)
    const [subject, setSubject] = useState<string>(() => (formData as any).subject ?? "");

    const [tone, setTone] = useState<"friendly" | "formal" | "marketing" | "concise">("friendly");
    const [lang, setLang] = useState<"English" | "Hindi">("English");
    const [length, setLength] = useState<"short" | "medium" | "long">("short");
    const [err, setErr] = useState<string | null>(null);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);

    // panel positioning state (for non-small screens)
    const [panelStyle, setPanelStyle] = useState<any>(null);
    const [isSmallScreen, setIsSmallScreen] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth < 640 : false);

    // Keep localContent in sync when parent updates (e.g. initial edit load)
    useEffect(() => {
        const parentContent = (formData as any).content ?? "";
        if (parentContent !== localContent) {
            setLocalContent(parentContent);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.content]);

    // Keep local subject in sync when parent updates subject (but don't overwrite user's typing aggressively)
    useEffect(() => {
        const parentSubject = (formData as any).subject ?? "";
        if (parentSubject !== subject) {
            setSubject(parentSubject);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.subject]);

    // When localContent changes, update parent formData content (so parent state stays authoritative)
    useEffect(() => {
        // Only update parent if it's actually different
        const parentContent = (formData as any).content ?? "";
        if (localContent !== parentContent) {
            setFormData((prev) => ({ ...(prev as any), content: localContent } as T));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localContent]);

    // Keep formData.subject in sync (but do NOT change formData.name here).
    useEffect(() => {
        const parentSubject = (formData as any).subject ?? "";
        if (parentSubject !== subject) {
            // ensure parent sees subject value (optional, but helpful if you persist subject)
            setFormData((prev) => ({ ...(prev as any), subject } as T));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subject]);

    // compute and set panel position whenever opened or window resizes
    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
            if (openPanel) computePosition();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openPanel]);

    // click outside / escape to close
    useEffect(() => {
        if (!openPanel) return;

        const onDocClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (panelRef.current && triggerRef.current && !panelRef.current.contains(t) && !triggerRef.current.contains(t)) {
                setOpenPanel(false);
            }
        };

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenPanel(false);
        };

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [openPanel]);

    /**
     * computePosition:
     * - On larger screens: prefer to position the small panel directly above the trigger button (aligned to button's right edge).
     *   If there isn't enough space above, open it below.
     * - Panel size is intentionally small (width 320 or 280 depending on viewport).
     */
    const computePosition = () => {
        const trigger = triggerRef.current;
        if (!trigger) {
            setPanelStyle(null);
            return;
        }

        const rect = trigger.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        // small panel dimensions (tune as needed)
        const panelWidth = Math.min(340, Math.max(260, Math.floor(viewportW * 0.28)));
        const panelHeight = 220; // fixed guess for small panel
        const gap = 8;

        // prefer above the trigger
        const spaceAbove = rect.top;
        const spaceBelow = viewportH - rect.bottom;

        const placeAbove = spaceAbove > panelHeight + gap + 10 || spaceAbove >= spaceBelow;

        const top = placeAbove ? Math.max(8, rect.top - panelHeight - gap) : Math.min(viewportH - panelHeight - 8, rect.bottom + gap);

        // align the panel so that its right edge matches the trigger's right edge,
        // but keep it within viewport with at least 8px margin
        let left = rect.right - panelWidth;
        if (left < 8) left = 8;
        if (left + panelWidth > viewportW - 8) left = viewportW - panelWidth - 8;

        setPanelStyle({
            position: "fixed",
            top: `${top}px`,
            left: `${left}px`,
            width: `${panelWidth}px`,
            height: `${panelHeight}px`,
            zIndex: 9999,
            boxShadow: "0 8px 40px rgba(17,24,39,0.12)",
            overflow: "hidden",
            borderRadius: 8,
            background: "white",
            border: "1px solid rgba(0,0,0,0.06)",
        });
    };

    useEffect(() => {
        if (openPanel) computePosition();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openPanel, isSmallScreen]);

    async function generateWithAI() {
        if (loading) return;
        setErr(null);

        // Validation: require channel and (subject or category) only
        const channel = (formData as any).channel?.toString?.()?.trim?.() || "";
        const category = (formData as any).category?.toString?.()?.trim?.() || "";
        const priority = (formData as any).priority?.toString?.()?.trim?.() || "";

        if (!channel) {
            setErr("Please select channel (sms/whatsapp/email).");
            setOpenPanel(true);
            return;
        }

        if (!subject && !category) {
            setErr("Provide at least one: Content Subject or Category to generate a template.");
            setOpenPanel(true);
            return;
        }

        setLoading(true);

        try {
            // Payload deliberately uses subject + category (and not name)
            const payload = {
                subject: subject || undefined,
                channel,
                category: category || undefined,
                priority: priority || undefined,
                tone,
                lang,
                length,
            };

            const url = endpoint ?? "/api/ai/generate-template";
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const bodyText = await res.text();

            if (!res.ok) {
                try {
                    const j = JSON.parse(bodyText);
                    throw new Error(j?.error || j?.message || `Request failed (${res.status})`);
                } catch {
                    throw new Error(bodyText || `Request failed (${res.status})`);
                }
            }

            let text = "";
            try {
                const data = JSON.parse(bodyText);
                text = data?.content ?? data?.generated ?? data?.template ?? "";
            } catch {
                throw new Error("Invalid JSON returned from server.");
            }

            if (!text) throw new Error("AI returned empty content.");

            // Only update content (do NOT overwrite formData.name)
            setFormData((prev) => {
                const existing = (prev as any).content?.toString()?.trim?.() || "";
                const nextContent = existing ? `${existing}\n\n${text}` : text;
                return ({ ...(prev as any), content: nextContent } as T);
            });

            // Also reflect in local editor immediately
            setLocalContent((prev) => {
                const existing = prev?.toString()?.trim?.() || "";
                return existing ? `${existing}\n\n${text}` : text;
            });

            setOpenPanel(false);
        } catch (e: any) {
            const message = e?.message || "Failed to generate template. Please try again.";
            setErr(message);
            setOpenPanel(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-2">
            <div className="relative">
                <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    className="w-full px-3 py-3 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[140px]"
                    placeholder="Template content will appear here. You can edit it after generation."
                />

                {/* Trigger button */}
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => {
                        setOpenPanel((s) => {
                            const next = !s;
                            // if opening, compute position after next paint
                            if (next) {
                                // slight delay to ensure DOM measurement correct
                                setTimeout(() => computePosition(), 0);
                            }
                            return next;
                        });
                    }}
                    disabled={loading}
                    aria-expanded={openPanel}
                    aria-controls="ai-settings-panel"
                    className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white/90 px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-white disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating…
                        </>
                    ) : (
                        <>
                            <Wand2 className="h-4 w-4" />
                            Generate with AI
                        </>
                    )}
                </button>

                {/* Panel */}
                {openPanel && (
                    <>
                        {/* small-screen backdrop and full-width small modal (kept compact) */}
                        {isSmallScreen && <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={() => setOpenPanel(false)} aria-hidden />}

                        <div
                            id="ai-settings-panel"
                            ref={panelRef}
                            role="dialog"
                            aria-modal={isSmallScreen ? "true" : "false"}
                            className={`bg-white rounded shadow-lg border border-gray-200 z-[9999] ${isSmallScreen ? "fixed inset-x-4 top-20 mx-auto max-w-md p-3" : "p-0 overflow-hidden"}`}
                            style={isSmallScreen ? undefined : panelStyle ?? { position: "fixed", top: "calc(50% - 110px)", left: "calc(50% - 180px)", width: "220px", height: "220px", zIndex: 9999 }}
                        >
                            <div className="flex items-center justify-between px-3 py-2 border-b">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    AI Settings
                                </span>
                                <button type="button" onClick={() => setOpenPanel(false)} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-3 pb-0 space-y-2" style={{ maxHeight: 220 - 44, overflowY: "auto" }}>
                                    {/* Subject input (local) */}
                                    <div>
                                        <label className="text-[11px] text-gray-600 block mb-1">Content Subject*</label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Enter your content subject"
                                            className="w-full border rounded px-2 py-1 text-xs"
                                        />
                                    </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">

                                    {/* Tone */}
                                    <div>
                                        <label className="text-[11px] text-gray-600 block mb-1">Tone</label>
                                        <select className="w-full border rounded px-2 py-1 text-xs" value={tone} onChange={(e) => setTone(e.target.value as any)}>
                                            <option value="friendly">Friendly</option>
                                            <option value="formal">Formal</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="concise">Concise</option>
                                        </select>
                                    </div>

                                    {/* Language */}
                                    <div>
                                        <label className="text-[11px] text-gray-600 block mb-1">Language</label>
                                        <select className="w-full border rounded px-2 py-1 text-xs" value={lang} onChange={(e) => setLang(e.target.value as any)}>
                                            <option>English</option>
                                            <option>Hindi</option>
                                        </select>
                                    </div>

                                    {/* Length */}
                                    <div>
                                        <label className="text-[11px] text-gray-600 block mb-1">Length</label>
                                        <select className="w-full border rounded px-2 py-1 text-xs" value={length} onChange={(e) => setLength(e.target.value as any)}>
                                            <option value="short">Short</option>
                                            <option value="medium">Medium</option>
                                            <option value="long">Long</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Generate */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={generateWithAI}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Generating…
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="h-4 w-4" />
                                                Generate
                                            </>
                                        )}
                                    </button>
                                </div>

                                {err && <p className="text-xs text-red-600 break-words">{err}</p>}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <p className="text-[11px] text-gray-500">Tip: Provide a content subject or a category and select the channel for best results.</p>
        </div>
    );
}
