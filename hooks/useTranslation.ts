import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { translations, TranslationKey } from '../constants/translations';

export function useTranslation() {
  const language = useSelector((s: RootState) => s.language.current);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return { t, language };
}
