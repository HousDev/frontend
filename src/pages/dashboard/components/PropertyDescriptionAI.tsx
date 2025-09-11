// src/pages/dashboard/components/PropertyDescriptionAI.tsx
"use client";

import React, { useState } from "react";
import { Wand2, Loader2, SlidersHorizontal, X } from "lucide-react";
import { propertiesAPI } from "@/lib/propertiesAPI";

type WithDescription = { description: string };

type Props<T extends WithDescription> = {
    formData: T;
    setFormData: (updater: (prev: T) => T) => void;
    /** Optional: if provided, component will POST here using fetch */
    endpoint?: string; // e.g. "/api/ai/generate-description"
};

export default function PropertyDescriptionAI<T extends WithDescription>({
    formData,
    setFormData,
    endpoint,
}: Props<T>) {
    const [loading, setLoading] = useState(false);
    const [openPanel, setOpenPanel] = useState(false);

    const [tone, setTone] = useState<"professional" | "friendly" | "luxury">(
        "friendly"
    );
    const [lang, setLang] = useState<"English" | "Hindi" | "Hinglish">(
        "English"
    );
    const [words, setWords] = useState<number>(120);
    const [err, setErr] = useState<string | null>(null);

    async function generateWithAI() {
        if (loading) return;
        setErr(null);
        setLoading(true);

        try {
            // Collect only the fields we actually use
            const selected = {
                propertyType: (formData as any).propertyType || "",
                propertySubtype: (formData as any).propertySubtype || "",
                unitType: (formData as any).unitType || "",
                furnishing: (formData as any).furnishing || "",
                city: (formData as any).city || "",
                location: (formData as any).location || "",
                budget: (formData as any).budget || "",
                parkingType: (formData as any).parkingType || "",
                carpetArea: (formData as any).carpetArea || "",
                floor: (formData as any).floor || "",
            };

            // Friendly, inline validation (no alert)
            if (!selected.propertyType || !selected.city) {
                setErr("Please select Property Type and City first.");
                setOpenPanel(true);
                return;
            }

            let text = "";

            if (endpoint) {
                // Use explicit endpoint (your current PropertyFormModal passes this)
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        formData: selected,
                        tone,
                        lang,
                        words: Number(words),
                    }),
                });

                const maybeText = await res.text();
                if (!res.ok) {
                    // try to show server error message if available
                    try {
                        const j = JSON.parse(maybeText);
                        throw new Error(j?.error || j?.message || `Request failed (${res.status})`);
                    } catch {
                        throw new Error(maybeText || `Request failed (${res.status})`);
                    }
                }

                let data: any;
                try {
                    data = JSON.parse(maybeText);
                } catch {
                    throw new Error("Invalid JSON from server.");
                }
                text = (data?.text ?? data?.description ?? "").toString();
            } else {
                // Fallback: use propertiesAPI helper (baseURL -> /api)
                const resp = await propertiesAPI.generateDescription({
                    formData: selected,
                    tone,
                    lang,
                    words: Number(words),
                });
                text = resp?.text ?? "";
            }

            if (!text) {
                throw new Error("Server did not return a description.");
            }

            setFormData((prev) => ({ ...prev, description: text } as T));
            setOpenPanel(false);
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ||
                e?.message ||
                "AI description generate nahi ho paya. Please try again.";
            setErr(msg);
            setOpenPanel(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-2 p-4">
            <label className="block text-xs font-medium text-gray-700">
                Description/Notes
            </label>

            <div className="relative">
                <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                        setFormData((p) => ({ ...p, description: e.target.value } as T))
                    }
                    className="w-full px-3 py-3 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[160px]"
                    placeholder="Additional property details, special features, etc."
                />

                {/* Popover panel */}
                {openPanel && (
                    <div className="absolute right-2 bottom-14 z-20 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
                        <div className="flex items-center justify-between px-2.5 py-2 border-b">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                AI Settings
                            </span>
                            <button
                                type="button"
                                onClick={() => setOpenPanel(false)}
                                className="p-0.5 rounded hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <X className="h-3.5 w-3.5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-3 space-y-2">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[11px] text-gray-600">Tone</label>
                                    <select
                                        className="w-full border rounded px-1.5 py-1 text-xs"
                                        value={tone}
                                        onChange={(e) =>
                                            setTone(
                                                e.target.value as "professional" | "friendly" | "luxury"
                                            )
                                        }
                                    >
                                        <option value="professional">Pro</option>
                                        <option value="friendly">Friendly</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="text-[11px] text-gray-600">Lang</label>
                                    <select
                                        className="w-full border rounded px-1.5 py-1 text-xs"
                                        value={lang}
                                        onChange={(e) =>
                                            setLang(e.target.value as "English" | "Hindi" | "Hinglish")
                                        }
                                    >
                                        <option>English</option>
                                        <option>Hindi</option>
                                        <option>Hinglish</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] text-gray-600">~Words</label>
                                <input
                                    type="number"
                                    min={60}
                                    max={250}
                                    value={words}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value);
                                        setWords(Number.isFinite(v) ? v : 120);
                                    }}
                                    className="w-full border rounded px-1.5 py-1 text-xs"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={generateWithAI}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Generating…
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="h-3.5 w-3.5" />
                                            Generate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trigger button inside textarea, bottom-right */}
                <button
                    type="button"
                    onClick={() => !loading && setOpenPanel((s) => !s)}
                    disabled={loading}
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
            </div>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <p className="text-[11px] text-gray-500">
                AI sirf: Property Type, Subtype, Unit Type, Furnishing, City, Location,
                Carpet Area, Floor ko use karega.
            </p>
        </div>
    );
}
