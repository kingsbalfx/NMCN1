import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Social media handles from environment variables
  const socialLinks = {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/2347000000000',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/kingsbalfx',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/kingsbalfx',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/kingsbalfx',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://linkedin.com/company/kingsbal',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com/@kingsbalfx',
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/kingsbal',
  };

  const socialIcons = [
    { name: 'WhatsApp', url: socialLinks.whatsapp, color: '#25D366', path: 'M20.52 3.48A11.88 11.88 0 0 0 12 0C5.373 0 .02 5.353.02 12c0 2.112.553 4.176 1.6 6.01L0 24l6.15-1.58A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12 0-1.96-.5-3.81-1.48-5.52z' },
    { name: 'Twitter', url: socialLinks.twitter, color: '#1DA1F2', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.77v.57A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
    { name: 'Facebook', url: socialLinks.facebook, color: '#1877F2', path: 'M22 12.07C22 6.54 17.52 2 12 2S2 6.54 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H8.07v-2.9h2.37V9.41c0-2.34 1.39-3.63 3.52-3.63.99 0 2.03.18 2.03.18v2.23h-1.14c-1.13 0-1.48.7-1.48 1.42v1.71h2.52l-.4 2.9h-2.12v7.03C18.34 21.19 22 17.06 22 12.07z' },
    { name: 'Instagram', url: socialLinks.instagram, color: '#E4405F', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.2A4.8 4.8 0 1 0 16.8 13 4.8 4.8 0 0 0 12 8.2zM18.4 6.3a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z' },
    { name: 'LinkedIn', url: socialLinks.linkedin, color: '#0A66C2', path: 'M4.98 3.5a2.5 2.5 0 1 1 .02 0zM3 8.98h4v12H3zM8.5 8.98h3.84v1.63h.05c.54-1 1.86-2.07 3.83-2.07 4.1 0 4.86 2.7 4.86 6.2v7.24h-4v-6.41c0-1.53-.03-3.5-2.13-3.5-2.13 0-2.46 1.66-2.46 3.38v6.53h-4z' },
    { name: 'YouTube', url: socialLinks.youtube, color: '#FF0000', path: 'M23.5 6.2a3 3 0 0 0-2.12-2.12C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.38.58A3 3 0 0 0 .5 6.2A31.04 31.04 0 0 0 0 12a31.04 31.04 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12C4.4 20.5 12 20.5 12 20.5s7.6 0 9.38-.58A3 3 0 0 0 23.5 17.8A31.04 31.04 0 0 0 24 12a31.04 31.04 0 0 0-.5-5.8zM9.75 15.02v-6.04L15.5 12z' },
    { name: 'Telegram', url: socialLinks.telegram, color: '#26A5E4', path: 'M22.5 3.2 2.9 10.8c-1 .4-.9 1.8.2 2.1l4.7 1.5 1.8 5.8c.2.7 1.1.9 1.6.4l2.6-2.6 4.8 3.5c.6.4 1.4.1 1.6-.6l3.5-16.2c.2-.8-.6-1.5-1.2-1.2zM9.6 13.9l8.9-6.9-6.7 8.2-.3 3.1-1.8-5.7z' }
  ];

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#e2e8f0',
      paddingTop: '48px',
      paddingBottom: '24px',
      marginTop: '80px',
      borderTop: '2px solid rgba(0, 102, 255, 0.2)',
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
        {/* Main Footer Content */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px', 
          marginBottom: '40px' 
        }}>
          {/* Brand Section */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>Kingsbal</h4>
            <p style={{ color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.6 }}>
              Digital healthcare bridge for nursing & midwifery excellence. Your trusted partner in healthcare education.
            </p>
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '20px' }}>
              © {currentYear} Kingsbal. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 style={{ color: '#fff', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Quick Links</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Dashboard
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/subscribe" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Subscribe
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/admin" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Admin Panel
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & Contact */}
          <div>
            <h5 style={{ color: '#fff', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Follow Us</h5>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {socialIcons.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  style={{
                    display: 'inline-flex',
                    opacity: 0.8,
                    transition: 'opacity 0.3s, transform 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={social.color} xmlns="http://www.w3.org/2000/svg">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>Email: support@kingsbal.com</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>WhatsApp: +234 700 000 0000</p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Made with care for healthcare professionals worldwide
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
            <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
              Terms of Service
            </Link>
            <Link href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
              Privacy Policy
            </Link>
            <Link href="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
              Contact
            </Link>
            <Link href="/admin/users" style={{ color: 'rgba(255,255,255,0.08)', fontSize: '10px', textDecoration: 'none', opacity: 0.08 }}>
              hidden admin access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
