import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Send, Check } from 'lucide-react';
import { useLang } from './LangContext';
import { questions } from './questions';
import type { SurveyData } from './types';

export default function Survey() {
  const { lang, setLang, text } = useLang();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>({});
  const [submitted, setSubmitted] = useState(false);

  const isLast = step === questions.length - 1;
  const current = questions[step];
  const value = data[current.id] || (current.type === 'checkbox' ? [] : '');

  const update = (val: string | string[]) => {
    setData(prev => ({ ...prev, [current.id]: val }));
  };

  const toggleCheckbox = (opt: string) => {
    const arr = (data[current.id] as string[]) || [];
    const next = arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt];
    update(next);
  };

  const canProceed = () => {
    if (!current.required) return true;
    if (current.type === 'checkbox') return (data[current.id] as string[] || []).length > 0;
    const v = data[current.id];
    if (current.type === 'email') return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return typeof v === 'string' && v.trim().length > 0;
  };

  const next = () => canProceed() && setStep(s => Math.min(s + 1, questions.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = () => {
    // TODO: Send to Google Sheets
    setSubmitted(true);
  };

  const progress = ((step + 1) / questions.length) * 100;

  const renderInput = (q: typeof current) => {
    const label = text({ en: q.keyEn, nl: q.keyNl });
    const currentVal = value as string;

    switch (q.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={q.type}
            value={currentVal}
            onChange={e => update(e.target.value)}
            placeholder={label}
            className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl
              focus:border-[#ffaebc] focus:outline-none focus:ring-4 focus:ring-[#ffaebc]/20
              transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentVal}
            onChange={e => update(e.target.value)}
            placeholder={label}
            rows={5}
            className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl
              focus:border-[#ffaebc] focus:outline-none focus:ring-4 focus:ring-[#ffaebc]/20
              transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 resize-none"
            autoFocus
          />
        );

      case 'select':
        return (
          <select
            value={currentVal}
            onChange={e => update(e.target.value)}
            className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl
              focus:border-[#ffaebc] focus:outline-none focus:ring-4 focus:ring-[#ffaebc]/20
              transition-all duration-200 bg-white text-gray-900 appearance-none cursor-pointer"
            autoFocus
          >
            <option value="">{lang === 'en' ? '— Select —' : '— Selecteer —'}</option>
            {q.options?.map((opt, i) => (
              <option key={i} value={opt.en}>{text(opt)}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {q.options?.map((opt, i) => (
              <label
                key={i}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 cursor-pointer
                  transition-all duration-200 ${
                  currentVal === opt.en
                    ? 'border-[#ffaebc] bg-[#ffaebc]/10 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt.en}
                  checked={currentVal === opt.en}
                  onChange={() => update(opt.en)}
                  className="w-5 h-5 accent-[#ffaebc]"
                />
                <span className="text-base font-medium">{text(opt)}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {q.options?.map((opt, i) => {
              const checked = ((data[q.id] as string[]) || []).includes(opt.en);
              return (
                <label
                  key={i}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 cursor-pointer
                    transition-all duration-200 ${
                    checked
                      ? 'border-[#ffaebc] bg-[#ffaebc]/10 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCheckbox(opt.en)}
                    className="w-5 h-5 accent-[#ffaebc]"
                  />
                  <span className="text-base font-medium">{text(opt)}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-20 h-20 bg-[#ffaebc]/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-[#ffaebc]" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {lang === 'en' ? 'Thank you!' : 'Dank u wel!'}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {lang === 'en'
              ? 'Your responses have been received. Our team at GIANT Agency will review your message and get back to you within 1-2 business days.'
              : 'Uw antwoorden zijn ontvangen. Ons team bij GIANT Agency zal uw bericht bekijken en binnen 1-2 werkdagen contact met u opnemen.'}
          </p>
          <div className="mt-10">
            <a
              href="https://giantagency.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#ffaebc] text-white font-semibold rounded-xl
                hover:bg-[#f59aa8] transition-colors duration-200"
            >
              {lang === 'en' ? 'Visit GIANT Agency' : 'Bezoek GIANT Agency'}
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffaebc]/5 to-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-[#ffaebc]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ffaebc] mb-6 shadow-lg shadow-[#ffaebc]/20">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            {lang === 'en' ? "Let's Create Something" : 'Laten we iets'}
            <br />
            <span className="text-[#ffaebc]">
              {lang === 'en' ? 'Extraordinary Together' : 'Buitengewoons Creëren'}
            </span>
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            {lang === 'en'
              ? 'Tell us about your vision and we\'ll bring it to life. Every campaign starts with a conversation.'
              : 'Vertel ons over uw visie en wij brengen deze tot leven. Elke campagne begint met een gesprek.'}
          </p>

          {/* Lang toggle */}
          <div className="mt-6 inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('nl')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                lang === 'nl' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Nederlands
            </button>
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100"
          >
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-[#ffaebc] bg-[#ffaebc]/10 px-3 py-1 rounded-full">
                {step + 1} / {questions.length}
              </span>
              <span className="text-xs text-gray-400">
                {lang === 'en' ? `Question ${step + 1} of ${questions.length}` : `Vraag ${step + 1} van ${questions.length}`}
              </span>
            </div>

            {/* Question label */}
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 leading-snug">
              {text({ en: current.keyEn, nl: current.keyNl })}
              {current.required && <span className="text-[#ffaebc] ml-1">*</span>}
            </h2>

            {/* Input */}
            <div className="mb-6">
              {renderInput(current)}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={prev}
                disabled={step === 0}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  step === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                {lang === 'en' ? 'Back' : 'Vorige'}
              </button>

              {isLast ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-[#ffaebc] text-white font-semibold rounded-xl
                    hover:bg-[#f59aa8] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#ffaebc]/20"
                >
                  {lang === 'en' ? 'Submit' : 'Verzenden'}
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={next}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl
                    hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-gray-900/10"
                >
                  {lang === 'en' ? 'Next' : 'Volgende'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-400">
            <span className="font-medium text-gray-500">GIANT Agency</span> — Spoorlaan 35, 5038 CB Tilburg
          </p>
          <p className="text-sm text-gray-400 mt-1">
            © {new Date().getFullYear()} GIANT Agency. {lang === 'en' ? 'All rights reserved.' : 'Alle rechten voorbehouden.'}
          </p>
        </div>
      </div>
    </div>
  );
}
