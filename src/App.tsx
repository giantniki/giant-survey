import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Step = 'welcome' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'details' | 'thanks' | 'review';

interface Answers {
  q1: string; q2: string[]; q2_other: string; q3: string;
  q4_1: string; q4_2: string; q4_3: string; q5: string; q6: string;
  name: string; company: string; role: string; email: string;
}

interface Submission extends Answers {
  _id: number; _timestamp: string;
}

const q2Options = [
  "Email & Slack pings", "Meetings that could've been a message",
  "Admin, reporting, invoicing", "Client back-and-forth",
  "Switching between tools and tabs", "Something else",
];

const empty: Answers = {
  q1: '', q2: [], q2_other: '', q3: '', q4_1: '', q4_2: '', q4_3: '',
  q5: '', q6: '', name: '', company: '', role: '', email: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Fade({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[520px] mx-auto px-5">{children}</motion.div>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [ans, setAns] = useState<Answers>(empty);
  const [items, setItems] = useState<Submission[]>([]);
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const nextId = React.useRef(1);

  const upd = (k: keyof Answers, v: any) => setAns(p => ({ ...p, [k]: v }));

  const nav = (to: Step) => {
    window.scrollTo({ top: 0, left: 0 });
    setStep(to);
  };

  const toggleQ2 = (opt: string) => {
    if (opt === 'Something else') return;
    setAns(p => ({
      ...p,
      q2: p.q2.includes(opt) ? p.q2.filter(x => x !== opt) : [...p.q2, opt],
    }));
  };

  const submit = () => {
    if (busy) return;
    const email = ans.email.trim();
    if (!email || !EMAIL_RE.test(email)) {
      alert('Email is required.');
      return;
    }
    setBusy(true);

    const s: Submission = { ...ans, _id: nextId.current++, _timestamp: new Date().toISOString() };
    setItems(prev => [...prev, s]);
    setStep('thanks');

    fetch('/api/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    }).catch(() => {});
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center px-5 py-12">
        {/* Lightbox overlay */}
        {lightbox && (
          <div
            className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <img
                src="/donation-examples.jpg"
                alt="Auction finds examples"
                className="w-full h-auto max-h-[85vh] rounded-2xl shadow-2xl"
              />
              <button
                onClick={() => setLightbox(false)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-black text-[#F4F4F4] rounded-full flex items-center justify-center font-['DM_Sans'] font-bold text-sm hover:bg-black/80 transition-all shadow-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <Fade id="welcome">
          <div className="text-center">
            <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mx-auto mb-8">
              <span className="text-[#F4F4F4] text-2xl font-['DM_Sans'] font-bold">G</span>
            </div>
            <h1 className="font-['Playfair_Display'] italic font-semibold text-5xl md:text-6xl text-black leading-[1.1] mb-6">Meet Your Giant</h1>
            <p className="text-black/70 text-sm mb-6 max-w-md mx-auto">We're building a Giant. A personal AI assistant, big enough to carry the boring, the frustrating, the distracting, and the &ldquo;can you just quickly&mdash;&rdquo; parts of your job.</p>

            {/* Auction Finds section */}
            <div className="mb-6 max-w-md mx-auto text-center">
              <h3 className="font-['Playfair_Display'] italic font-semibold text-lg text-black/40 mb-3">Auction Finds</h3>
              <button onClick={() => setLightbox(true)} className="group cursor-pointer">
                <img
                  src="/donation-examples.jpg"
                  alt="Examples of items you can donate"
                  className="w-1/2 mx-auto rounded-xl border border-black/10 group-hover:opacity-80 transition-opacity shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                  loading="lazy"
                />
              </button>
              <p className="text-[10px] text-black/30 mt-1.5 font-['DM_Sans']">
                Tap to enlarge
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button onClick={() => nav('q1')}
                className="font-['DM_Sans'] font-bold text-lg text-white bg-black px-12 py-4 rounded-xl hover:bg-black/80 transition-all active:scale-[0.97]">
                {items.length > 0 ? 'Add another item →' : 'Start →'}
              </button>
              {items.length > 0 && (
                <button onClick={() => setStep('review')}
                  className="font-['DM_Sans'] font-bold text-sm text-black/40 py-3 hover:text-black transition-colors">
                  View items in auction ({items.length})
                </button>
              )}
            </div>
          </div>
        </Fade>
      </div>
    );
  }

  if (step === 'thanks') {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center px-5 py-12">
        <Fade id="thanks">
          <div className="text-center">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-[#F4F4F4] text-4xl font-['DM_Sans'] font-bold">G</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-black/5 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="text-xs font-['DM_Sans'] font-bold text-black/50 uppercase tracking-wider">
                {items.length} {items.length === 1 ? 'item' : 'items'} collected
              </span>
            </div>
            <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15] mb-6 px-2">
              Thanks for Cleaning Out Your Closet<br />And Supporting International Cinema
            </h2>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => { setAns({ ...empty, email: ans.email, name: ans.name, company: ans.company, role: ans.role }); nav('q1'); }}
                className="font-['DM_Sans'] font-bold text-base text-white bg-black px-10 py-4 rounded-xl hover:bg-black/80 transition-all active:scale-[0.97]">
                Donate another item!
              </button>
              <button onClick={() => nav('welcome')}
                className="font-['DM_Sans'] text-sm text-black/40 hover:text-black transition-colors">
                No, I'm done
              </button>
            </div>
          </div>
        </Fade>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col p-5 pt-6 max-w-[520px] mx-auto w-full">
        <button onClick={() => nav('thanks')} className="text-sm text-black/40 hover:text-black text-left mb-4">← Back</button>
        <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl text-black mb-2">Auction items</h2>
        <p className="text-black/50 text-sm mb-6">{items.length} of 10 listed.</p>
        {items.length === 0 ? (
          <p className="text-black/30 text-center py-8">No items yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map(s => (
              <div key={s._id} className="bg-white rounded-xl border border-black/5 p-4">
                <p className="text-sm text-black/60">{s.q1 || '(empty)'}</p>
                <p className="text-[10px] text-black/20 mt-2">{new Date(s._timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Question steps
  const questions: { id: Step; label: string; subtitle: string; render: () => React.ReactNode }[] = [
    {
      id: 'q1', label: 'Boring is bad for business',
      subtitle: "What eats the most time in your day without earning its keep?",
      render: () => <textarea value={ans.q1} onChange={e => upd('q1', e.target.value)} placeholder="Tell us..." rows={4}
        className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 resize-none outline-none transition-colors" autoFocus />
    },
    {
      id: 'q2', label: 'Where do you get distracted most?',
      subtitle: "Where does your focus leak away?",
      render: () => (
        <div className="space-y-2">
          {q2Options.map(opt => (
            <button key={opt} onClick={() => toggleQ2(opt)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                ans.q2.includes(opt) ? 'bg-black text-white border-black' : 'bg-transparent text-black/70 border-black/10 hover:border-black/30'
              }`}>{opt}</button>
          ))}
        </div>
      )
    },
    {
      id: 'q3', label: 'The frustration files',
      subtitle: "What's the one part of your job that makes you want to shut the laptop?",
      render: () => <textarea value={ans.q3} onChange={e => upd('q3', e.target.value)} placeholder="Tell us..." rows={4}
        className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 resize-none outline-none transition-colors" autoFocus />
    },
    {
      id: 'q4', label: 'Meet your Giant',
      subtitle: "What are the first three things you'd hand over without a second thought?",
      render: () => (
        <div className="space-y-4">
          <input value={ans.q4_1} onChange={e => upd('q4_1', e.target.value)} placeholder="First thing..."
            className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 outline-none transition-colors" autoFocus />
          <input value={ans.q4_2} onChange={e => upd('q4_2', e.target.value)} placeholder="Second thing... (optional)"
            className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/30 outline-none transition-colors" />
          <input value={ans.q4_3} onChange={e => upd('q4_3', e.target.value)} placeholder="Third thing... (optional)"
            className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/30 outline-none transition-colors" />
        </div>
      )
    },
    {
      id: 'q5', label: "Who's carrying you",
      subtitle: "Where do you find yourself waiting on someone or something else?",
      render: () => <textarea value={ans.q5} onChange={e => upd('q5', e.target.value)} placeholder="Tell us..." rows={4}
        className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 resize-none outline-none transition-colors" autoFocus />
    },
    {
      id: 'q6', label: 'Dream big',
      subtitle: "If you woke up tomorrow with one new superpower at work, what would it be?",
      render: () => <textarea value={ans.q6} onChange={e => upd('q6', e.target.value)} placeholder="Tell us..." rows={4}
        className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 resize-none outline-none transition-colors" autoFocus />
    },
    {
      id: 'details' as Step, label: 'Last but not least',
      subtitle: "The boring bit. We promise it's the last one.",
      render: () => (
        <div className="space-y-5">
          <div><label className="text-xs text-black/30 block mb-1">Name</label>
            <input value={ans.name} onChange={e => upd('name', e.target.value)} placeholder="Your name"
              className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 outline-none" /></div>
          <div><label className="text-xs text-black/30 block mb-1">Company</label>
            <input value={ans.company} onChange={e => upd('company', e.target.value)} placeholder="Your company"
              className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 outline-none" /></div>
          <div><label className="text-xs text-black/30 block mb-1">Role</label>
            <input value={ans.role} onChange={e => upd('role', e.target.value)} placeholder="Your role"
              className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 outline-none" /></div>
          <div><label className="text-xs text-black/30 block mb-1">Email *</label>
            <input type="email" value={ans.email} onChange={e => upd('email', e.target.value)} placeholder="your@email.com"
              className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-3 text-black text-base placeholder:text-black/20 outline-none" /></div>
        </div>
      )
    },
  ];

  const qIdx = questions.findIndex(q => q.id === step);
  const currentQ = questions[qIdx] || questions[0];
  const isLast = step === 'details';

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col">
      {/* Fixed progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-black/5 z-50">
        <motion.div className="h-full bg-black"
          animate={{ width: `${((qIdx + 1) / 7) * 100}%` }}
          transition={{ duration: 0.3 }} />
      </div>

      <div className="pt-6 pb-2 px-5 max-w-[520px] mx-auto w-full">
        <button onClick={() => {
          const back: Record<string, Step> = { q1: 'welcome', q2: 'q1', q3: 'q2', q4: 'q3', q5: 'q4', q6: 'q5', details: 'q6' };
          nav(back[step] || 'welcome');
        }} className="text-sm text-black/40 hover:text-black">← Back</button>
      </div>

      <div className="flex-1 flex flex-col justify-center py-8 px-5 max-w-[520px] mx-auto w-full">
        <AnimatePresence mode="wait">
          <Fade id={step} key={step}>
            <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15] mb-2">{currentQ.label}</h2>
            <p className="text-black/50 text-sm mb-8">{currentQ.subtitle}</p>
            {currentQ.render()}
            <div className="flex justify-end mt-8">
              {isLast ? (
                <button onClick={submit} disabled={busy}
                  className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-10 py-4 rounded-xl hover:bg-black/80 transition-all disabled:opacity-50">
                  {busy ? 'Sending...' : 'Submit →'}
                </button>
              ) : (
                <button onClick={() => {
                  const next: Record<string, Step> = { q1: 'q2', q2: 'q3', q3: 'q4', q4: 'q5', q5: 'q6', q6: 'details' };
                  nav(next[step] || 'details');
                }} className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-8 py-3 rounded-xl hover:bg-black/80 transition-all active:scale-[0.97]">
                  Next →
                </button>
              )}
            </div>
          </Fade>
        </AnimatePresence>
      </div>
    </div>
  );
}
