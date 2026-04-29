import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../services/api";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user || res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      padding: '0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#0066ff',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🏥</span> Kingsbal
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: 'none',
          '@media (min-width: 768px)': { display: 'flex' },
          gap: '30px',
          alignItems: 'center'
        }}>
          <Link href="/dashboard" style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            transition: 'color 0.3s',
            fontSize: '14px',
            fontWeight: '500'
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
            Dashboard
          </Link>
          <Link href="/subjects" style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            transition: 'color 0.3s',
            fontSize: '14px',
            fontWeight: '500'
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
            Subjects
          </Link>
          <Link href="/curriculum-quiz" style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            transition: 'color 0.3s',
            fontSize: '14px',
            fontWeight: '500'
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
            Curriculum Quiz
          </Link>
          <Link href="/contact" style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            transition: 'color 0.3s',
            fontSize: '14px',
            fontWeight: '500'
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
            Contact
          </Link>
          
          {user?.role === "admin" && (
            <Link href="/admin" style={{
              color: '#ffcc00',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'color 0.3s'
            }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffed99'} onMouseLeave={(e) => e.currentTarget.style.color = '#ffcc00'}>
              🔧 Admin
            </Link>
          )}
          
          {user ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {user.email || user.username || 'User'}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'opacity 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" style={{
              backgroundColor: '#0066ff',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'opacity 0.3s'
            }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'flex',
            '@media (min-width: 768px)': { display: 'none' },
            flexDirection: 'column',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Toggle mobile menu"
        >
          <div style={{ width: '24px', height: '2px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
          <div style={{ width: '24px', height: '2px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
          <div style={{ width: '24px', height: '2px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div style={{
          display: 'flex',
          '@media (min-width: 768px)': { display: 'none' },
          flexDirection: 'column',
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#0f172a'
        }}>
          <Link href="/dashboard" style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            padding: '10px 0',
            fontSize: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={() => setMobileMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/subjects" style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            padding: '10px 0',
            fontSize: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={() => setMobileMenuOpen(false)}>
            Subjects
          </Link>
          <Link href="/curriculum-quiz" style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            padding: '10px 0',
            fontSize: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={() => setMobileMenuOpen(false)}>
            Curriculum Quiz
          </Link>
          <Link href="/contact" style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            padding: '10px 0',
            fontSize: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          
          {user?.role === "admin" && (
            <Link href="/admin" style={{
              color: '#ffcc00',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '10px 0',
              fontSize: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }} onClick={() => setMobileMenuOpen(false)}>
              🔧 Admin Panel
            </Link>
          )}
          
          {user ? (
            <>
              <div style={{ padding: '10px 0', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {user.email || user.username || 'User'}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '10px'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" style={{
              backgroundColor: '#0066ff',
              color: '#fff',
              padding: '10px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
              marginTop: '10px'
            }} onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
