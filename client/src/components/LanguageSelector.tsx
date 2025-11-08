import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <div className="flex gap-1">
        <Button
          variant={i18n.language === 'es' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage('es')}
          className="text-xs px-2 py-1"
        >
          {t('lang.es')}
        </Button>
        <Button
          variant={i18n.language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage('en')}
          className="text-xs px-2 py-1"
        >
          {t('lang.en')}
        </Button>
      </div>
    </div>
  );
}