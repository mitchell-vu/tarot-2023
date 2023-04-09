/// <reference types="vite/client" />

export type RawCard = {
  id: string;
  arcan: string;
  name: string;
  keywords: string;
  description: string;
  relationshipKeywords: string;
  relationship: string;
  careerKeywords: string;
  career: string;
  financeKeywords: string;
  finance: string;
};

declare global {
  interface Window {
    appStartTime: Date;
  }
}
