import { useState } from 'react';
import Layout from "../components/Layout";
import axios from 'axios';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});

  // Social media URLs from environment variables
  const socialLinks = {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/2347000000000',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/kingsbalfx',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/kingsbalfx',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/kingsbalfx',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://linkedin.com/company/kingsbalfx',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com/@kingsbalfx',
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/kingsbal'
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    setStatusMessage({ text: '', type: '' });
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      await axios.post(`${apiBaseUrl}/contact`, formData, {
        withCredentials: true,
        timeout: 10000
      });

      setStatusMessage({
        text: '✅ Message sent successfully! We will get back to you soon.',
        type: 'success'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText = 'Failed to send message. Please try:';
      
      setStatusMessage({
        text: `${errorText} WhatsApp, Email, or another contact method below.`,
        type: 'error'
      });
      
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 7000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '40px auto', paddingBottom: '60px', paddingLeft: '20px', paddingRight: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '10px', color: '#0066ff', fontSize: '32px', fontWeight: '700' }}>Contact Us</h1>
          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            We'd love to hear from you. Get in touch with us today! Choose your preferred contact method below.
          </p>
        </div>

        {/* Main Contact Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          {/* Contact Methods - Left */}
          <div>
            <h3 style={{ marginBottom: '30px', color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>Quick Contact</h3>
            
            {/* WhatsApp */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ color: '#25D366', marginBottom: '10px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>💬</span> WhatsApp
              </h4>
              <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '14px' }}>
                Chat with us directly for instant support
              </p>
              <a 
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#25D366',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'opacity 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Message on WhatsApp
              </a>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ color: '#0066ff', marginBottom: '10px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>✉️</span> Email
              </h4>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>support@kingsbal.com</p>
              <a 
                href="mailto:support@kingsbal.com"
                style={{
                  color: '#0066ff',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Send Email →
              </a>
            </div>

            {/* Hours */}
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ color: '#0066ff', marginBottom: '10px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>🕐</span> Business Hours
              </h4>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: 0 }}>
                Mon - Fri: 9:00 AM - 6:00 PM WAT<br />
                Saturday: 10:00 AM - 2:00 PM WAT<br />
                Sunday: Closed
              </p>
            </div>
          </div>

          {/* Contact Form - Right */}
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>Send us a Message</h3>
            
            {statusMessage.text && (
              <div style={{
                padding: '14px',
                marginBottom: '20px',
                borderRadius: '8px',
                backgroundColor: statusMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
                fontSize: '14px',
                border: `1px solid ${statusMessage.type === 'success' ? '#6ee7b7' : '#fca5a5'}`
              }}>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>
                  Name {<span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.name ? '#ef4444' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Poppins, sans-serif',
                    backgroundColor: errors.name ? '#fee2e2' : '#fff'
                  }}
                  placeholder="Your full name"
                />
                {errors.name && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>
                  Email {<span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.email ? '#ef4444' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Poppins, sans-serif',
                    backgroundColor: errors.email ? '#fee2e2' : '#fff'
                  }}
                  placeholder="your@email.com"
                />
                {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>{errors.email}</p>}
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>
                  Subject {<span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.subject ? '#ef4444' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Poppins, sans-serif',
                    backgroundColor: errors.subject ? '#fee2e2' : '#fff'
                  }}
                  placeholder="What is this about?"
                />
                {errors.subject && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>{errors.subject}</p>}
              </div>

              {/* Message */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>
                  Message {<span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.message ? '#ef4444' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Poppins, sans-serif',
                    resize: 'vertical',
                    minHeight: '120px',
                    backgroundColor: errors.message ? '#fee2e2' : '#fff'
                  }}
                  placeholder="Tell us how we can help..."
                />
                {errors.message && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loading ? '#94a3b8' : '#0066ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0052cc')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0066ff')}
              >
                {loading ? '⏳ Sending...' : '📧 Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* Social Links */}
        <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '60px' }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b', textAlign: 'center', fontSize: '20px', fontWeight: '600' }}>Connect With Us</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" style={{ display: 'inline-flex', padding: '10px', borderRadius: '8px', backgroundColor: '#dbeafe', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1DA1F2'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#1DA1F2' }} xmlns="http://www.w3.org/2000/svg"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.77v.57A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" style={{ display: 'inline-flex', padding: '10px', borderRadius: '8px', backgroundColor: '#dbeafe', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1877F2'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#1877F2' }} xmlns="http://www.w3.org/2000/svg"><path d="M22 12.07C22 6.54 17.52 2 12 2S2 6.54 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H8.07v-2.9h2.37V9.41c0-2.34 1.39-3.63 3.52-3.63.99 0 2.03.18 2.03.18v2.23h-1.14c-1.13 0-1.48.7-1.48 1.42v1.71h2.52l-.4 2.9h-2.12v7.03C18.34 21.19 22 17.06 22 12.07z"/></svg>
            </a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ display: 'inline-flex', padding: '10px', borderRadius: '8px', backgroundColor: '#fce7f3', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E4405F'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fce7f3'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#E4405F' }} xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.2A4.8 4.8 0 1 0 16.8 13 4.8 4.8 0 0 0 12 8.2zM18.4 6.3a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z"/></svg>
            </a>
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ display: 'inline-flex', padding: '10px', borderRadius: '8px', backgroundColor: '#dbeafe', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0A66C2'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0A66C2' }} xmlns="http://www.w3.org/2000/svg"><path d="M4.98 3.5a2.5 2.5 0 1 1 .02 0zM3 8.98h4v12H3zM8.5 8.98h3.84v1.63h.05c.54-1 1.86-2.07 3.83-2.07 4.1 0 4.86 2.7 4.86 6.2v7.24h-4v-6.41c0-1.53-.03-3.5-2.13-3.5-2.13 0-2.46 1.66-2.46 3.38v6.53h-4z"/></svg>
            </a>
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" style={{ display: 'inline-flex', padding: '10px', borderRadius: '8px', backgroundColor: '#fee2e2', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FF0000'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FF0000' }} xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2a3 3 0 0 0-2.12-2.12C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.38.58A3 3 0 0 0 .5 6.2A31.04 31.04 0 0 0 0 12a31.04 31.04 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12C4.4 20.5 12 20.5 12 20.5s7.6 0 9.38-.58A3 3 0 0 0 23.5 17.8A31.04 31.04 0 0 0 24 12a31.04 31.04 0 0 0-.5-5.8zM9.75 15.02v-6.04L15.5 12z"/></svg>
            </a>
            <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" title="Telegram" style={{ display: 'inline-flex', padding: '10px', borderRadius: '8px', backgroundColor: '#cffafe', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#26A5E4'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#cffafe'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#26A5E4' }} xmlns="http://www.w3.org/2000/svg"><path d="M22.5 3.2 2.9 10.8c-1 .4-.9 1.8.2 2.1l4.7 1.5 1.8 5.8c.2.7 1.1.9 1.6.4l2.6-2.6 4.8 3.5c.6.4 1.4.1 1.6-.6l3.5-16.2c.2-.8-.6-1.5-1.2-1.2zM9.6 13.9l8.9-6.9-6.7 8.2-.3 3.1-1.8-5.7z"/></svg>
            </a>
          </div>
        </div>

        {/* Info Section */}
        <div style={{ backgroundColor: '#f0f9ff', padding: '30px', borderRadius: '12px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>📋 Learn More</h3>
          <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
            Review our policies and legal information
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/terms" style={{
              display: 'inline-block',
              backgroundColor: '#0066ff',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'opacity 0.3s'
            }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              Terms of Service
            </a>
            <a href="/privacy" style={{
              display: 'inline-block',
              backgroundColor: '#0066ff',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'opacity 0.3s'
            }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
