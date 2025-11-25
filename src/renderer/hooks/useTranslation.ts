import { useState, useEffect } from 'react';
import { t as translate, getLocale, setLocale as setAppLocale, Locale } from '../i18n';

// 创建一个事件系统来通知语言变化
const localeChangeListeners: Array<() => void> = [];

const notifyLocaleChange = () => {
  localeChangeListeners.forEach(listener => listener());
};

export const changeLocale = async (newLocale: Locale) => {
  setAppLocale(newLocale);
  // 保存到配置
  if (window.electronAPI) {
    await window.electronAPI.setConfig('app.locale', newLocale);
  }
  notifyLocaleChange();
};

export const loadSavedLocale = async () => {
  if (window.electronAPI) {
    const savedLocale = await window.electronAPI.getConfig('app.locale');
    if (savedLocale === 'zh-CN' || savedLocale === 'en-US') {
      setAppLocale(savedLocale);
    }
  }
};

export const useTranslation = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    localeChangeListeners.push(listener);

    return () => {
      const index = localeChangeListeners.indexOf(listener);
      if (index > -1) {
        localeChangeListeners.splice(index, 1);
      }
    };
  }, []);

  const t = (key: string, ...args: any[]) => {
    return translate(key, ...args);
  };

  return {
    t,
    locale: getLocale(),
    changeLocale,
  };
};
