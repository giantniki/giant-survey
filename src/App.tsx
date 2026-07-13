import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Step = 'welcome' | 1 | 2 | 3 | 4 | 5 | 6 | 'details' | 'thanks';

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

export default function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [a, setA] = useState<Answers>(initialAnswers);

  const update = useCallback(<K extends keyof Answers>(key: K, val: Answers[K]) => {
    setA(prev => ({ ...prev, [key]: val }));
  }, []);

  const totalQ = 7; // 6 questions + details

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
            </div>

            <button
              onClick={() => go(1)}
              className="font-['DM_Sans'] font-bold text-lg text-white bg-black px-12 py-4 rounded-xl
                hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
            >
              Start →
            </button>
          </div>
        </FadeSlide>
      </div>
    );
  }

  // === THANKS ===
  if (step === 'thanks') {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center px-5 py-12">
        <FadeSlide id="thanks">
          <div className="text-center">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-10">
              <span className="text-[#F4F4F4] text-4xl font-['DM_Sans'] font-bold">G</span>
            </div>

            <h2 className="font-['Playfair_Display'] italic font-semibold text-4xl md:text-5xl text-black leading-[1.15] mb-4">
              You just made a giant a little more real.
            </h2>

            <p className="text-black/60 text-base leading-relaxed max-w-sm mx-auto mb-10">
              Thanks for the honesty — pain is genuinely the most useful thing you could've given us today. We're building your Giant based on exactly this kind of answer, and you'll be first in line to meet it.
            </p>

            <p className="font-['DM_Sans'] font-bold text-black text-lg">
              Talk soon.
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
                      <span className={a.q2.includes(opt) ? 'font-[\'DM_Sans\'] font-bold' : ''}>
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
                    onClick={() => {
                      if (!a.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) {
                        alert('Email is required so we can show you your Giant!');
                        return;
                      }
                      // TODO: send to Google Sheets / email
                      console.log('ANSWERS:', a);
                      go('thanks');
                    }}
                    className="font-['DM_Sans'] font-bold text-sm text-white bg-black px-10 py-4 rounded-xl
                      hover:bg-black/80 transition-all duration-300 active:scale-[0.97]"
                  >
                    Submit →
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
