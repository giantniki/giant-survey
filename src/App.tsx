import React, { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Step = 'welcome' | 1 | 2 | 3 | 4 | 5 | 6 | 'details' | 'thanks' | 'review';

interface Answers {
  q1: string;
  q2: string[];
  q2_other: string;
  q3: string;
  q4_1: string;
  q4_2: string;
  q4_3: string;
  q5: string;
  q6: string;
  name: string;
  company: string;
  role: string;
  email: string;
}

interface Submission extends Answers {
  _id: number;
  _timestamp: string;
}

type SubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

const q2Options = [
  'Email & Slack pings',
  'Meetings that could\'ve been a message',
  'Admin, reporting, invoicing',
  'Client back-and-forth',
  'Switching between tools and tabs',
  'Something else',
];

const initialAnswers: Answers = {
  q1: '', q2: [], q2_other: '', q3: '', q4_1: '', q4_2: '', q4_3: '',
  q5: '', q6: '', name: '', company: '', role: '', email: '',
};

function FadeSlide({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[520px] mx-auto px-5"
    >
      {children}
    </motion.div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step) / total) * 100;
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-black/5 z-50">
      <motion.div
        className="h-full bg-black"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/** Summarise one submission into a compact preview string */
function summarise(s: Submission): string {
  const parts: string[] = [];
  if (s.q1) parts.push(`Boring: "${s.q1.slice(0, 60)}${s.q1.length > 60 ? '…' : ''}"`);
  if (s.q2.length || s.q2_other) {
    const q2items = [...s.q2];
    if (s.q2_other) q2items.push(s.q2_other);
    parts.push(`Distractions: ${q2items.join(', ')}`);
  }
  if (s.q3) parts.push(`Frustration: "${s.q3.slice(0, 60)}${s.q3.length > 60 ? '…' : ''}"`);
  if (s.q4_1) parts.push(`Hand-off: ${s.q4_1}${s.q4_2 ? `, ${s.q4_2}` : ''}${s.q4_3 ? `, ${s.q4_3}` : ''}`);
  if (s.q5) parts.push(`Waiting: "${s.q5.slice(0, 60)}${s.q5.length > 60 ? '…' : ''}"`);
  if (s.q6) parts.push(`Superpower: "${s.q6.slice(0, 60)}${s.q6.length > 60 ? '…' : ''}"`);
  return parts.join(' · ') || '(empty)';
}

export default function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [a, setA] = useState<Answers>(initialAnswers);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const nextId = useRef(1);

  const update = useCallback(<K extends keyof Answers>(key: K, val: Answers[K]) => {
    setA(prev => ({ ...prev, [key]: val }));
  }, []);

  const totalQ = 7;

  const toggleQ2 = (opt: string) => {
    if (opt === 'Something else') {
      // handled separately
    } else {
      setA(prev => ({
        ...prev,
        q2: prev.q2.includes(opt) ? prev.q2.filter(x => x !== opt) : [...prev.q2, opt],
      }));
    }
  };

  const go = (to: Step) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setStep(to), 50);
  };

  const handleSubmit = () => {
    if (!a.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) {
      alert('Email is required so we can show you your Giant!');
      return;
    }
    if (submissions.length >= 10) {
      alert('Thanks! You\'ve reached the maximum of 10 items. We\'ve got plenty to work with.');
      return;
    }

    const submission: Submission = {
      ...a,
      _id: nextId.current++,
      _timestamp: new Date().toISOString(),
    };

    setSubmissions(prev => [...prev, submission]);
    setSubmitStatus('sent');

    // Navigate directly — don't use go() which has a setTimeout
    setStep('thanks');

    // Fire-and-forget to API
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    }).catch((err) => {
      console.error('Submit failed (submission saved locally):', err);
    });
  };

  const handleAddAnother = () => {
    setA({
      ...initialAnswers,
      email: a.email,
      name: a.name,
      company: a.company,
      role: a.role,
    });
    go('welcome');
  };

  const handleDeleteItem = (id: number) => {
    setSubmissions(prev => prev.filter(s => s._id !== id));
  };

  const handleEditItem = (id: number) => {
    const item = submissions.find(s => s._id === id);
    if (!item) return;
    // Fill form with the item's answers (keep personal details)
    setA({
      q1: item.q1,
      q2: item.q2,
      q2_other: item.q2_other,
      q3: item.q3,
      q4_1: item.q4_1,
      q4_2: item.q4_2,
      q4_3: item.q4_3,
      q5: item.q5,
      q6: item.q6,
      name: a.name || item.name,
      company: a.company || item.company,
      role: a.role || item.role,
      email: a.email || item.email,
    });
    // Remove the old version — it'll be re-added on re-submit
    handleDeleteItem(id);
    go('welcome');
  };

  // === WELCOME ===
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center px-5 py-12">
        <FadeSlide id="welcome">
          <div className="text-center">
            {/* Logo mark */}
            <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mx-auto mb-8">
              <span className="text-[#F4F4F4] text-2xl font-['DM_Sans'] font-bold">G</span>
            </div>

            <h1 className="font-['Playfair_Display'] italic font-semibold text-5xl md:text-6xl text-black leading-[1.1] mb-6">
              Meet Your Giant
            </h1>

            <div className="space-y-4 text-left text-black/70 text-base leading-relaxed max-w-md mx-auto mb-10">
              <p>
                We're building a <span className="font-['DM_Sans'] font-bold text-black">Giant</span>. A personal AI assistant, big enough to carry the boring, the frustrating, the distracting, and the <em>"can you just quickly—"</em> parts of your job — so you can get back to the parts that made someone hire you in the first place.
              </p>
              <p>
                Your pain is the useful part here. Be honest, we can take it.
              </p>
              <p className="text-sm text-black/50">
                Six questions. Under three minutes. Answer in whatever language feels most natural. Nothing here is a trick question — only Email is required, skip anything else that doesn't apply.
              </p>

              <div className="bg-black/[0.03] rounded-xl px-4 py-3 mt-4">
                <p className="font-['DM_Sans'] font-bold text-xs text-black/30 uppercase tracking-wider text-center">
                  Min. 1 submission · Max. 10 — you can always add more later
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => go(1)}
                className="font-['DM_Sans'] font-bold text-lg text-white bg-black px-12 py-4 rounded-xl
                  hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
              >
                {submissions.length > 0 ? 'Add another item →' : 'Start →'}
              </button>

              <button
                onClick={() => go('review')}
                className="font-['DM_Sans'] font-bold text-sm text-black bg-black/5 px-8 py-3 rounded-xl
                  hover:bg-black/10 transition-all duration-300"
              >
                View items in auction ({submissions.length})
              </button>
            </div>
          </div>
        </FadeSlide>
      </div>
    );
  }

  // === REVIEW ===
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col">
        <div className="pt-6 pb-2 px-5 max-w-[520px] mx-auto w-full">
          <button
            onClick={() => go('thanks')}
            className="text-sm text-black/40 hover:text-black transition-colors duration-200"
          >
            ← Back
          </button>
        </div>

        <div className="flex-1 flex flex-col py-8">
          <FadeSlide id="review">
            <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15] mb-2">
              Auction items
            </h2>
            <p className="text-black/50 text-sm mb-8">
              {submissions.length} of 10 listed. Tap any item to edit it, or delete to remove.
            </p>

            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-black/30 text-base font-['DM_Sans']">No items yet.</p>
                <button
                  onClick={() => go(1)}
                  className="mt-4 font-['DM_Sans'] font-bold text-sm text-white bg-black px-8 py-3 rounded-xl
                    hover:bg-black/80 transition-all duration-300"
                >
                  Add your first item →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((s, i) => (
                  <div
                    key={s._id}
                    className="bg-white rounded-xl border border-black/5 p-4 space-y-3"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <span className="font-['DM_Sans'] font-bold text-xs text-black/30 uppercase tracking-wider">
                        Item #{i + 1}
                      </span>
                      <span className="text-[10px] text-black/20 font-['DM_Sans']">
                        {new Date(s._timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-black/60 leading-relaxed line-clamp-3">
                      {summarise(s)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleEditItem(s._id)}
                        className="text-xs font-['DM_Sans'] font-bold text-black/40 hover:text-black
                          bg-black/5 hover:bg-black/10 px-4 py-2 rounded-lg transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(s._id)}
                        className="text-xs font-['DM_Sans'] font-bold text-red-400 hover:text-red-600
                          bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enter another item button */}
            {submissions.length > 0 && submissions.length < 10 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setA({
                      ...initialAnswers,
                      email: a.email || submissions[submissions.length - 1].email,
                      name: a.name || submissions[submissions.length - 1].name,
                      company: a.company || submissions[submissions.length - 1].company,
                      role: a.role || submissions[submissions.length - 1].role,
                    });
                    go('welcome');
                  }}
                  className="font-['DM_Sans'] font-bold text-base text-white bg-black px-10 py-4 rounded-xl
                    hover:bg-black/80 transition-all duration-300 active:scale-[0.97]
                    shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.2)]"
                >
                  ENTER ANOTHER ITEM →
                </button>
              </div>
            )}
          </FadeSlide>
        </div>
      </div>
    );
  }

  // === THANKS ===
  if (step === 'thanks') {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center px-5 py-12">
        <FadeSlide id="thanks">
          <div className="text-center">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-[#F4F4F4] text-4xl font-['DM_Sans'] font-bold">G</span>
            </div>

            {/* Subconscious social proof: submission counter */}
            <div className="inline-flex items-center gap-2 bg-black/5 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="text-xs font-['DM_Sans'] font-bold text-black/50 uppercase tracking-wider">
                {submissions.length} {submissions.length === 1 ? 'item' : 'items'} collected
              </span>
            </div>

            <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15] mb-6 px-2">
              Thanks for Cleaning Out Your Closet<br />
              And Supporting International Cinema
            </h2>

            {/* Divider */}
            <div className="w-16 h-[1px] bg-black/10 mx-auto mb-8" />

            <div className="flex flex-col items-center gap-3">
              {submissions.length < 10 && (
                <button
                  onClick={handleAddAnother}
                  className="font-['DM_Sans'] font-bold text-base text-white bg-black px-10 py-4 rounded-xl
                    hover:bg-black/80 transition-all duration-300 active:scale-[0.97]
                    shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.2)]"
                >
                  Donate another item!
                </button>
              )}

              <button
                onClick={() => go('review')}
                className="font-['DM_Sans'] font-bold text-sm text-black bg-black/5 px-8 py-3 rounded-xl
                  hover:bg-black/10 transition-all duration-300"
              >
                View all auction items ({submissions.length})
              </button>

              {submissions.length >= 1 && (
                <button
                  onClick={() => {
                    setA(initialAnswers);
                    setSubmissions([]);
                    nextId.current = 1;
                    go('welcome');
                  }}
                  className="font-['DM_Sans'] text-sm text-black/40 hover:text-black transition-colors duration-200"
                >
                  {submissions.length >= 10 ? "I'm done — submit all" : "No, I'm done"}
                </button>
              )}
            </div>

            <p className="mt-10 text-xs text-black/20 font-['DM_Sans']">
              You've contributed {submissions.length} {submissions.length === 1 ? 'item' : 'items'} so far. Every donation supports international cinema.
            </p>
          </div>
        </FadeSlide>
      </div>
    );
  }

  // === QUESTION STEPS ===
  const steps: { id: Step; total: number }[] = [
    { id: 1, total: totalQ },
    { id: 2, total: totalQ },
    { id: 3, total: totalQ },
    { id: 4, total: totalQ },
    { id: 5, total: totalQ },
    { id: 6, total: totalQ },
    { id: 'details', total: totalQ },
  ];

  const currentIdx = steps.findIndex(s => s.id === step);
  const progressStep = currentIdx >= 0 ? currentIdx + 1 : 0;

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col">
      <ProgressBar step={progressStep} total={totalQ} />

      {/* Back link */}
      <div className="pt-6 pb-2 px-5 max-w-[520px] mx-auto w-full">
        <button
          onClick={() => {
            const prev: Record<string, Step> = { '1': 'welcome', '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, 'details': 6 };
            go(prev[String(step)] as Step);
          }}
          className="text-sm text-black/40 hover:text-black transition-colors duration-200"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <FadeSlide id="q1">
              <div className="space-y-6">
                <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15]">
                  Boring is bad for business
                </h2>
                <p className="text-black/50 text-sm">
                  Every job has its unglamorous side — the stuff you do because someone has to, not because you love it. What eats the most time in your day without earning its keep?<br />
                  <span className="text-black/30">(optional)</span>
                </p>
                <textarea
                  value={a.q1}
                  onChange={e => update('q1', e.target.value)}
                  placeholder="Tell us..."
                  rows={5}
                  className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                    py-3 text-black text-base placeholder:text-black/20 resize-none outline-none
                    transition-colors duration-200"
                  autoFocus
                />
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => go(2)}
                    className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-8 py-3 rounded-xl
                      hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </FadeSlide>
          )}

          {step === 2 && (
            <FadeSlide id="q2">
              <div className="space-y-6">
                <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15]">
                  Where do you get distracted most?
                </h2>
                <p className="text-black/50 text-sm">
                  You want most of your hours going to the work you're actually good at. Everything else is noise. Where does your focus leak away?<br />
                  <span className="text-black/30">(multi-select — optional)</span>
                </p>
                <div className="space-y-2">
                  {q2Options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        if (opt === 'Something else') {
                          // just focus the input
                          document.getElementById('q2_other')?.focus();
                        } else {
                          toggleQ2(opt);
                        }
                      }}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                        a.q2.includes(opt)
                          ? 'bg-black text-white border-black'
                          : 'bg-transparent text-black/70 border-black/10 hover:border-black/30'
                      }`}
                    >
                      <span className={a.q2.includes(opt) ? 'font-["DM_Sans"] font-bold' : ''}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
                {a.q2.includes('Something else') || (
                  <input
                    id="q2_other"
                    value={a.q2_other}
                    onChange={e => update('q2_other', e.target.value)}
                    placeholder="Something else: tell us..."
                    className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                      py-3 text-black text-base placeholder:text-black/20 outline-none transition-colors"
                  />
                )}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => go(3)}
                    className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-8 py-3 rounded-xl
                      hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </FadeSlide>
          )}

          {step === 3 && (
            <FadeSlide id="q3">
              <div className="space-y-6">
                <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15]">
                  The frustration files
                </h2>
                <p className="text-black/50 text-sm">
                  Time isn't the only thing that goes to waste. What's the one part of your job that makes you want to shut the laptop and take a very long walk?<br />
                  <span className="text-black/30">(optional)</span>
                </p>
                <textarea
                  value={a.q3}
                  onChange={e => update('q3', e.target.value)}
                  placeholder="Tell us..."
                  rows={5}
                  className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                    py-3 text-black text-base placeholder:text-black/20 resize-none outline-none
                    transition-colors duration-200"
                  autoFocus
                />
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => go(4)}
                    className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-8 py-3 rounded-xl
                      hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </FadeSlide>
          )}

          {step === 4 && (
            <FadeSlide id="q4">
              <div className="space-y-6">
                <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15]">
                  Meet your Giant
                </h2>
                <p className="text-black/50 text-sm">
                  Say you had a personal giant on call — enormous, capable, permanently on your side. What are the first three things you'd hand over without a second thought?<br />
                  <span className="text-black/30">(one is fine too — just tell us the first thing that comes to mind)</span>
                </p>
                <div className="space-y-4">
                  <input
                    value={a.q4_1}
                    onChange={e => update('q4_1', e.target.value)}
                    placeholder="First thing..."
                    className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                      py-3 text-black text-base placeholder:text-black/20 outline-none transition-colors"
                    autoFocus
                  />
                  <input
                    value={a.q4_2}
                    onChange={e => update('q4_2', e.target.value)}
                    placeholder="Second thing... (optional)"
                    className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                      py-3 text-black text-base placeholder:text-black/30 outline-none transition-colors"
                  />
                  <input
                    value={a.q4_3}
                    onChange={e => update('q4_3', e.target.value)}
                    placeholder="Third thing... (optional)"
                    className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                      py-3 text-black text-base placeholder:text-black/30 outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => go(5)}
                    className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-8 py-3 rounded-xl
                      hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </FadeSlide>
          )}

          {step === 5 && (
            <FadeSlide id="q5">
              <div className="space-y-6">
                <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15]">
                  Who's carrying you
                </h2>
                <p className="text-black/50 text-sm">
                  Nobody does it alone, and that's fine. But where in your work do you find yourself waiting on someone — or something — else just to move forward?<br />
                  <span className="text-black/30">(optional)</span>
                </p>
                <textarea
                  value={a.q5}
                  onChange={e => update('q5', e.target.value)}
                  placeholder="Tell us..."
                  rows={5}
                  className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                    py-3 text-black text-base placeholder:text-black/20 resize-none outline-none
                    transition-colors duration-200"
                  autoFocus
                />
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => go(6)}
                    className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-8 py-3 rounded-xl
                      hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </FadeSlide>
          )}

          {step === 6 && (
            <FadeSlide id="q6">
              <div className="space-y-6">
                <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15]">
                  Dream big
                </h2>
                <p className="text-black/50 text-sm">
                  If you woke up tomorrow with one new skill or superpower that made you excellent at your job — no studying required — what would it be?<br />
                  <span className="text-black/30">(optional)</span>
                </p>
                <textarea
                  value={a.q6}
                  onChange={e => update('q6', e.target.value)}
                  placeholder="Tell us..."
                  rows={5}
                  className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                    py-3 text-black text-base placeholder:text-black/20 resize-none outline-none
                    transition-colors duration-200"
                  autoFocus
                />
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => go('details')}
                    className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-8 py-3 rounded-xl
                      hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </FadeSlide>
          )}

          {step === 'details' && (
            <FadeSlide id="details">
              <div className="space-y-6">
                <h2 className="font-['Playfair_Display'] italic font-semibold text-3xl md:text-4xl text-black leading-[1.15]">
                  Last but not least
                </h2>
                <p className="text-black/50 text-sm">
                  The boring bit. We promise it's the last one.
                </p>

                {/* Minimum / maximum notice */}
                <div className="bg-black/5 rounded-xl px-4 py-3 text-center">
                  <p className="font-['DM_Sans'] font-bold text-xs text-black/50 uppercase tracking-wider">
                    Minimum 1 item · Maximum 10 items
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-black/30 mb-1 block">Name (optional)</label>
                    <input
                      value={a.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                        py-3 text-black text-base placeholder:text-black/20 outline-none transition-colors"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-black/30 mb-1 block">Company (optional)</label>
                    <input
                      value={a.company}
                      onChange={e => update('company', e.target.value)}
                      placeholder="Your company"
                      className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                        py-3 text-black text-base placeholder:text-black/20 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-black/30 mb-1 block">Role (optional)</label>
                    <input
                      value={a.role}
                      onChange={e => update('role', e.target.value)}
                      placeholder="Your role"
                      className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                        py-3 text-black text-base placeholder:text-black/20 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-black/30 mb-1 block">
                      Email <span className="text-black/50">(required — so we can come back and show you your Giant)</span>
                    </label>
                    <input
                      type="email"
                      value={a.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-transparent border-b-2 border-black/10 focus:border-black 
                        py-3 text-black text-base placeholder:text-black/20 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={submitStatus === 'sending'}
                    className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-10 py-4 rounded-xl
                      hover:bg-black/80 transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitStatus === 'sending' ? 'Sending...' : 'Submit →'}
                  </button>
                </div>
              </div>
            </FadeSlide>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
