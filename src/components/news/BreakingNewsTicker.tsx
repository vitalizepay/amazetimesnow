import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface BreakingNews {
  id: string;
  title_en: string;
  title_ta: string;
  slug: string;
  parties: {
    slug: string;
  } | null;
}

const BreakingNewsTicker = () => {
  const { language, t } = useLanguage();

  const { data: breakingNews } = useQuery({
    queryKey: ['breaking-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('id, title_en, title_ta, slug, parties(slug)')
        .eq('is_breaking', true)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as BreakingNews[];
    },
  });

  if (!breakingNews || breakingNews.length === 0) return null;

  return (
    <div className="breaking-ticker overflow-hidden py-2">
      <div className="container flex items-center gap-4">
        <span className={`font-bold uppercase text-sm shrink-0 px-3 py-1 bg-white/10 rounded ${language === 'ta' ? 'font-tamil' : ''}`}>
          {t('Breaking', 'முக்கிய செய்தி')}
        </span>
        <div className="overflow-hidden flex-1">
          <div className="breaking-ticker-text whitespace-nowrap flex gap-8">
            {breakingNews.map((news) => (
              <Link
                key={news.id}
                to={`/party/${news.parties?.slug || 'general'}/${news.slug}`}
                className={`hover:underline ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {language === 'ta' ? news.title_ta : news.title_en}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
