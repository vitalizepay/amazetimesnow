import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import NewsCard from '@/components/news/NewsCard';
import PartyFilter from '@/components/news/PartyFilter';
import { Skeleton } from '@/components/ui/skeleton';
import AdSense from '@/components/ads/AdSense';

interface NewsItem {
  id: string;
  title_en: string;
  title_ta: string;
  content_en: string;
  content_ta: string;
  slug: string;
  category: string;
  featured_image: string | null;
  published_at: string;
  is_breaking: boolean;
  is_featured: boolean;
  parties: {
    slug: string;
    name_en: string;
    name_ta: string;
    color: string;
  } | null;
}

const Index = () => {
  const { language, t } = useLanguage();

  const { data: news, isLoading } = useQuery({
    queryKey: ['news-latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          title_en,
          title_ta,
          content_en,
          content_ta,
          slug,
          category,
          featured_image,
          published_at,
          is_breaking,
          is_featured,
          parties (
            slug,
            name_en,
            name_ta,
            color
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as NewsItem[];
    },
  });

  const featuredNews = news?.filter((n) => n.is_featured).slice(0, 3) || [];
  const latestNews = news?.filter((n) => !n.is_featured) || [];

  return (
    <Layout>
      <div className="container py-8">
        {/* Top Ad Banner */}
        <div className="mb-6">
          <AdSense className="min-h-[90px]" />
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <section className="mb-10">
            <h2 className={`text-2xl font-serif font-bold mb-6 pb-2 border-b-2 border-primary ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t('Top Stories', 'முக்கிய செய்திகள்')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main featured article */}
              {featuredNews[0] && (
                <div className="lg:col-span-2">
                  <NewsCard {...featuredNews[0]} party={featuredNews[0].parties} variant="featured" />
                </div>
              )}
              {/* Secondary featured articles */}
              <div className="space-y-6">
                {featuredNews.slice(1, 3).map((item) => (
                  <NewsCard key={item.id} {...item} party={item.parties} variant="default" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* News Grid */}
          <div className="lg:col-span-3">
            <h2 className={`text-2xl font-serif font-bold mb-6 pb-2 border-b-2 border-primary ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t('Latest News', 'சமீபத்திய செய்திகள்')}
            </h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestNews.map((item) => (
                  <NewsCard key={item.id} {...item} party={item.parties} />
                ))}
              </div>
            )}

            {latestNews.length === 0 && !isLoading && (
              <p className={`text-center text-muted-foreground py-12 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {t('No news available', 'செய்திகள் இல்லை')}
              </p>
            )}

            {/* Mid-content Ad */}
            <div className="mt-8">
              <AdSense className="min-h-[250px]" />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <PartyFilter />

            {/* Sidebar Ad */}
            <div className="bg-card border border-border rounded-sm p-4">
              <AdSense className="min-h-[250px]" />
            </div>
            
            {/* Categories */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className={`font-serif font-bold text-lg mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {t('Categories', 'பிரிவுகள்')}
              </h3>
              <ul className={`space-y-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {t('Elections', 'தேர்தல்கள்')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {t('Government Actions', 'அரசு நடவடிக்கைகள்')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {t('Statements', 'அறிக்கைகள்')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {t('Protests & Events', 'போராட்டங்கள்')}
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Bottom Ad Banner */}
        <div className="mt-8">
          <AdSense className="min-h-[90px]" />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
