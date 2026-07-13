import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Lang } from './types';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  text: (pair: { en: string; nl: string }) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const text = (pair: { en: string; nl: string }) => pair[lang];

  return (
    <LangContext.Provider value={{ lang, setLang, text }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
