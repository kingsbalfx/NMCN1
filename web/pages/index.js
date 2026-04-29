import { motion } from 'framer-motion';
import { ArrowRight, Atom, HeartPulse, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import AuthSplit from '../components/AuthSplit';

const stats = [
  { label: 'Active Nurses', value: '12,400+', icon: Atom, color: 'from-cyan-500 to-sky-500' },
  { label: 'Practice Questions', value: '18,600+', icon: Zap, color: 'from-slate-900 to-cyan-500' },
  { label: 'Success Rate', value: '76%', icon: ShieldCheck, color: 'from-emerald-500 to-teal-500' },
];

const levels = [
  { title: 'Year 1: The Foundation Quest', description: 'Start with Anatomy, Pharmacology, Biology, and Foundation Nursing.', badge: 'Beginner' },
  { title: 'Year 2: The Clinical Rise', description: 'Deep-dive into Medical-Surgical, Community Health, and Research.', badge: 'Intermediate' },
  { title: 'Year 3: The RN Final Challenge', description: 'Master Mental Health, Home Care, Leadership, and Patient Safety.', badge: 'Advanced' },
];

const features = [
  { title: 'AI-Generated Q&A', description: 'Dynamic questions from Anatomy & Physiology I to Health Economics.', icon: Sparkles },
  { title: 'Clinical XP', description: 'Earn points for every procedure mastered, from vital signs to IV therapy.', icon: HeartPulse },
  { title: 'Paystack Local Access', description: 'Instant access via OPay, Kuda, or Bank Transfer with Paystack.', icon: Zap },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_24%)]" />
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-200 shadow-sm">
                From Student to RN: The Smart Way
              </span>
              <h1 className="mt-8 max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl">
                Master the NMCN Curriculum. <span className="text-cyan-300">Level Up Your Nursing Career.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                The first gamified prep-app for Nigerian Student Nurses. Turn Anatomy, Pharmacology, and Medical-Surgical Nursing into a winning game.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#mission" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-8 py-4 text-sm font-semibold text-slate-950 shadow-glow transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                  Start Your Mission <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a href="#features" className="inline-flex items-center justify-center rounded-full border border-slate-700/60 bg-slate-950/80 px-8 py-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300">
                  Learn How It Works
                </a>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12 }} className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-2xl ring-1 ring-white/10">
              <AuthSplit />
            </motion.div>
          </div>
        </div>
      </div>

      <section id="mission" className="container mx-auto px-6 py-16 text-slate-100">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_0.8fr] lg:items-center">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">NurseQuest Perfection Mode</p>
            <h2 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl">Don’t just read the curriculum—conquer it.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Our AI generates personalized challenges from the official NMCN modules, so every practice session is mapped directly to the revised General Nursing Curriculum.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <div className="rounded-[32px] border border-cyan-300/10 bg-gradient-to-br from-slate-900/90 to-slate-950/80 p-8 shadow-[0_30px_90px_-50px_rgba(56,189,248,0.45)]">
              <div className="mb-6 flex items-center justify-between rounded-3xl bg-slate-950/80 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Curriculum Flow</p>
                  <p className="mt-3 text-2xl font-bold text-white">Year 1 — 3 mission map</p>
                </div>
                <div className="rounded-2xl bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">50% pass mark focus</div>
              </div>
              <div className="space-y-4">
                {levels.map((level) => (
                  <div key={level.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">{level.title}</p>
                        <p className="mt-2 text-sm text-slate-400">{level.description}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">{level.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-6 pb-16 text-slate-100">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-10 shadow-glow backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Technical Edge</p>
              <h2 className="text-4xl font-bold text-white">Every question is mapped directly to the Revised General Nursing Curriculum.</h2>
              <p className="text-slate-400">Master Nursing Informatics, Politics & Governance, Clinical Procedures, and exam-ready content across the full NMCN syllabus.</p>
              <a href="/subscribe" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5">
                Unlock now <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {levels.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} className="rounded-[28px] border border-white/10 bg-slate-900/90 p-6 shadow-xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-cyan-300">
                  {index === 0 ? <Atom className="h-6 w-6" /> : index === 1 ? <TrendingUp className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                </div>
                <p className="text-xl font-semibold text-white">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
