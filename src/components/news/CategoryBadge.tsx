import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'default';
}

const categoryConfig: Record<string, { 
  en: string; 
  ta: string; 
  className: string;
}> = {
  elections: {
    en: 'Elections',
    ta: 'தேர்தல்கள்',
    className: 'category-elections',
  },
  statements: {
    en: 'Statements',
    ta: 'அறிக்கைகள்',
    className: 'category-statements',
  },
  government: {
    en: 'Government',
    ta: 'அரசு',
    className: 'category-government',
  },
  protests: {
    en: 'Protests',
    ta: 'போராட்டங்கள்',
    className: 'category-protests',
  },
  general: {
    en: 'General',
    ta: 'பொது',
    className: 'bg-gray-100 text-gray-800',
  },
};

const CategoryBadge = ({ category, size = 'default' }: CategoryBadgeProps) => {
  const { language } = useLanguage();
  
  const config = categoryConfig[category] || categoryConfig.general;
  const label = language === 'ta' ? config.ta : config.en;

  return (
    <span
      className={`category-badge ${config.className} ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : ''
      } ${language === 'ta' ? 'font-tamil' : ''}`}
    >
      {label}
    </span>
  );
};

export default CategoryBadge;
