import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthed, refreshSession } from "../lib/store";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState(() => (isAuthed() ? "checking" : "anonymous"));

  useEffect(() => {
    let isMounted = true;

    if (!isAuthed()) {
      setStatus("anonymous");
      return () => {
        isMounted = false;
      };
    }

    // A stale or revoked token must not keep the panel open.
    refreshSession().then((admin) => {
      if (isMounted) setStatus(admin ? "authed" : "anonymous");
    });

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="eyebrow text-ink-3">Checking your session…</p>
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
