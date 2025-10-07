import es from './es.json';
import en from './en.json';

export type Locale = 'es' | 'en';

const dictionaries = { es, en } as const;

let current: Locale = 'es';

export function t(path: string): string {
  const parts = path.split('.');
  let node: any = dictionaries[current];
  for (const p of parts) {
    node = node?.[p];
    if (!node) return path;
  }
  return typeof node === 'string' ? node : path;
}

export function setLocale(locale: Locale) {
  current = locale;
}


