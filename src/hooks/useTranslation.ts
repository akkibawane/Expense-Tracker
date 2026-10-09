import { useAppSelector } from './useRedux';
import { t as translate, LanguageCode } from '../utils/i18n';

export const useTranslation = () => {
  const language = useAppSelector((state) => (state.ui as any).language || 'en') as LanguageCode;

  const t = (key: string, fallback?: string): string => {
    return translate(key, language, fallback);
  };

  return { t, language };
};
