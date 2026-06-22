import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const years = [
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
];

export default function AuthSplit({ onSignedIn }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ full_name: '', school_name: '', year_of_study: '1', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const signUp = async () => {
    setLoading(true);
    try {
      const username = form.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `student${Date.now()}`;
      const res = await api.post('/auth/register', {
        full_name: form.full_name,
        username,
        email: form.email,
        password: form.password,
      });

      if (res.data?.token) localStorage.setItem('token', res.data.token);
      toast.success('Account created. Complete payment to unlock your missions.');
      window.location.href = '/subscribe';
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      if (form.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        const adminRes = await fetch('/api/supabase-super-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        if (!adminRes.ok) throw new Error('Super admin login failed');
        window.location.href = '/admin/users';
        return;
      }

      const res = await api.post('/auth/login', {
        username_or_email: form.email,
        password: form.password,
      });

      if (res.data?.token) localStorage.setItem('token', res.data.token);
      toast.success('Welcome back! Redirecting to your clinical dashboard...');
      window.location.href = res.data?.user?.permanent_access ? '/dashboard' : '/subscribe';
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-[32px] bg-white/90 p-8 shadow-glow backdrop-blur-xl ring-1 ring-slate-200/60">
        <div className="mb-6 flex items-center gap-3 rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
          AI + Paystack powered nursing mastery
        </div>

        <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-950/95 to-sky-600/80 p-8 text-white shadow-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-cyan-200">From the Classroom to the Ward</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Master the NMCN Curriculum with AI-Powered Precision.</h2>
          <p className="mt-4 text-slate-200">Instant Upgrade via OPay & Kuda. Don't let payment delays stop your progress. Our Paystack integration ensures your RN license prep starts the second you hit send.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: 'AI-Generated Q&A', copy: 'Dynamic questions from Anatomy to Health Economics.' },
            { title: 'Clinical XP', copy: 'Earn points for vital signs, IV therapy, and bedside care.' },
            { title: 'Local Payments', copy: 'OPay, Kuda, or Bank Transfer via Paystack.' },
            { title: '3-Year Licensing', copy: 'Built around the NMCN 3-year renewal cycle.' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200/90 bg-slate-50 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>

      <motion.div className="rounded-[32px] bg-slate-950/95 p-8 text-white shadow-glow backdrop-blur-lg ring-1 ring-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <div className="mb-6 flex justify-between items-center gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Student Nurse Login</p>
            <h3 className="mt-2 text-2xl font-semibold">Split-screen access</h3>
          </div>
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="rounded-full border border-slate-700/90 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {mode === 'login' ? 'Switch to Signup' : 'Switch to Login'}
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'signup' && (
            <>
              <label className="block text-sm font-semibold text-slate-200">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} className="w-full rounded-3xl border border-slate-700/90 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400" />
              <label className="block text-sm font-semibold text-slate-200">School Name</label>
              <input type="text" value={form.school_name} onChange={(e) => handleChange('school_name', e.target.value)} className="w-full rounded-3xl border border-slate-700/90 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400" />
              <label className="block text-sm font-semibold text-slate-200">Year of Study</label>
              <select value={form.year_of_study} onChange={(e) => handleChange('year_of_study', e.target.value)} className="w-full rounded-3xl border border-slate-700/90 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400">
                {years.map((year) => <option key={year.value} value={year.value}>{year.label}</option>)}
              </select>
            </>
          )}

          <label className="block text-sm font-semibold text-slate-200">Email address</label>
          <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full rounded-3xl border border-slate-700/90 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400" />

          <label className="block text-sm font-semibold text-slate-200">Password</label>
          <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="w-full rounded-3xl border border-slate-700/90 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400" />

          <button onClick={mode === 'login' ? login : signUp} disabled={loading} className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Processing...' : mode === 'login' ? 'Login and Launch Mission' : 'Create Account and Begin'}
          </button>
          <p className="text-sm text-slate-400">Don’t just read the curriculum—conquer it with personalized NMCN missions and clinical XP rewards.</p>
        </div>
      </motion.div>
    </div>
  );
}
