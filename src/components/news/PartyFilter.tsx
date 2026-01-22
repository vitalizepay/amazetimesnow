import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';

interface Party {
  id: string;
  name_en: string;
  name_ta: string;
  slug: string;
  color: string;
}

const PartyFilter = () => {
  const { language, t } = useLanguage();
  const location = useLocation();

  const { data: parties } = useQuery({
    queryKey: ['parties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parties')
        .select('id, name_en, name_ta, slug, color')
        .order('name_en');

      if (error) throw error;
      return data as Party[];
    },
  });

  const isActive = (slug: string) => location.pathname === `/party/${slug}`;

  return (
    <div className="bg-card border border-border rounded-sm p-4">
      <h3 className={`font-serif font-bold text-lg mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
        {t('Political Parties', 'அரசியல் கட்சிகள்')}
      </h3>
      <ul className="space-y-2">
        {parties?.map((party) => (
          <li key={party.id}>
            <Link
              to={`/party/${party.slug}`}
              className={`flex items-center gap-3 py-2 px-3 rounded transition-colors ${
                isActive(party.slug)
                  ? 'bg-secondary font-semibold'
                  : 'hover:bg-secondary/50'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: party.color }}
              />
              <span className={language === 'ta' ? 'font-tamil' : ''}>
                {language === 'ta' ? party.name_ta : party.name_en}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PartyFilter;
