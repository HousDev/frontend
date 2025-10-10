import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Clock, Download } from "lucide-react";
import { electronicSignAPI } from "@/lib/electronicSignAPI";

type EsignStatus = "created" | "otp_sent" | "otp_verified" | "redirected" | "signed" | "failed";

interface SessionInfo {
  status: EsignStatus;
  redirect_url?: string | null;
  signed_at?: string | null;
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<{
    signed_pdf_url?: string | null;
    audit_trail_url?: string | null;
  }>({});

  useEffect(() => {
    if (!id) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const res = await electronicSignAPI.pollStatus(id); // expects a string id
        if (!isMounted) return;
        setSession(res);

        if (res.status === "signed") {
          if (interval) clearInterval(interval);
          const art = await electronicSignAPI.fetchArtifacts(id);
          if (!isMounted) return;
          setArtifacts(art);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to fetch session status");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // first fetch + set polling
    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [id]);

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Clock className="animate-spin w-6 h-6 text-gray-500" />
        <span className="ml-2 text-gray-600">Checking status…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No session data.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">e-Sign Session</h1>

        {session.status === "signed" ? (
          <>
            <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-3" />
            <p className="text-green-600 font-medium mb-2">Document Signed!</p>
            <p className="text-gray-500 text-sm mb-4">
              Signed at {session.signed_at || "—"}
            </p>

            {artifacts.signed_pdf_url && (
              <a
                href={artifacts.signed_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" /> Download Signed PDF
              </a>
            )}
          </>
        ) : (
          <>
            <Clock className="text-yellow-500 w-12 h-12 mx-auto mb-3" />
            <p className="text-gray-700">
              Current status: <b>{session.status}</b>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This page will refresh automatically.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
