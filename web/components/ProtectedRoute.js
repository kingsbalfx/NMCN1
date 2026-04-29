import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../services/api";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await api.get("/auth/me");
        if (mounted) setLoading(false);
      } catch (err) {
        // Not authenticated — redirect to login
        if (mounted) {
          setError("Authentication required");
          router.push("/login?redirect=" + router.pathname);
        }
      }
    })();

    return () => { mounted = false; };
  }, [router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #0066ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) return null;
  
  return children;
}
