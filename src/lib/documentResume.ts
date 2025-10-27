// src/lib/documentResume.ts
export const RESUME_KEY = "documentEditor:resume";

export function saveResumeLocal(payload: {
  draftId?: string | number | null;
  templateId?: string | number | null;
  title?: string;
  initialVariables?: Record<string, any>;
  editorState?: Record<string, any>;
  source?: string;
}) {
  const data = {
    draftId: payload.draftId ?? null,
    templateId: payload.templateId ?? null,
    title: payload.title ?? "Untitled Draft",
    initialVariables: payload.initialVariables ?? {},
    editorState: payload.editorState ?? {},
    source: payload.source ?? "server-draft",
    savedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(RESUME_KEY, JSON.stringify(data));
}

export function readResumeLocal() {
  const raw = sessionStorage.getItem(RESUME_KEY);
  if (!raw) {
    console.warn("[RESUME] no snapshot in sessionStorage");
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    console.groupEnd();
    return parsed;
  } catch (e) {
    console.error("[RESUME] parse failed", e);
    return null;
  }
}
