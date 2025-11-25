import { zhCN, TranslationKeys } from './zh-CN';
import { enUS } from './en-US';

export type Locale = 'zh-CN' | 'en-US';

const translations: Record<Locale, TranslationKeys> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

let currentLocale: Locale = 'zh-CN'; // 默认简体中文

export const setLocale = (locale: Locale) => {
  currentLocale = locale;
};

export const getLocale = (): Locale => {
  return currentLocale;
};

// 格式化字符串，支持 {0}, {1} 等占位符
const formatString = (str: string, ...args: any[]): string => {
  return str.replace(/\{(\d+)\}/g, (match, index) => {
    const argIndex = parseInt(index, 10);
    return args[argIndex] !== undefined ? String(args[argIndex]) : match;
  });
};

// 获取翻译文本的辅助函数
export const t = (path: string, ...args: any[]): string => {
  const keys = path.split('.');
  let value: any = translations[currentLocale];

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      console.warn(`Translation key not found: ${path}`);
      return path;
    }
  }

  if (typeof value === 'string') {
    return args.length > 0 ? formatString(value, ...args) : value;
  }

  console.warn(`Translation value is not a string: ${path}`);
  return path;
};

export { zhCN, enUS };
export type { TranslationKeys };
