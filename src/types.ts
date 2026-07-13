export type Lang = 'en' | 'nl';

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'email' | 'tel' | 'select';
  keyEn: string;
  keyNl: string;
  options?: { en: string; nl: string }[];
  required?: boolean;
}

export interface SurveyData {
  [key: string]: string | string[];
}
