import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import NewsCard from '@/components/news/NewsCard';
import PartyFilter from '@/components/news/PartyFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdSense from '@/components/ads/AdSense';

interface Party {
  id: string;
  name_en: string;
  name_ta: string;
  slug: string;
  color: string;
  description_en: string | null;
  description_ta: string | null;
  founded_year: number | null;
  logo_url: string | null;
}

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
  parties: Party | null;
}

const PartyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();

  const { data: party, isLoading: partyLoading } = useQuery({
    queryKey: ['party', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Party | null;
    },
    enabled: !!slug,
  });

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['party-news', party?.id],
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
          parties (
            id,
            name_en,
            name_ta,
            slug,
            color,
            description_en,
            description_ta,
            founded_year,
            logo_url
          )
        `)
        .eq('party_id', party?.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as NewsItem[];
    },
    enabled: !!party?.id,
  });

  const partyName = party ? (language === 'ta' ? party.name_ta : party.name_en) : '';
  const partyDesc = party ? (language === 'ta' ? party.description_ta : party.description_en) : '';

  const categories = ['all', 'elections', 'government', 'statements', 'protests'];
  
  const filterByCategory = (category: string) => {
    if (category === 'all') return news || [];
    return news?.filter((n) => n.category === category) || [];
  };

  if (partyLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
      </Layout>
    );
  }

  if (!party) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">
            {t('Party Not Found', 'கட்சி கிடைக்கவில்லை')}
          </h1>
          <p className="text-muted-foreground">
            {t('The political party you are looking for does not exist.', 'நீங்கள் தேடும் அரசியல் கட்சி இல்லை.')}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Top Ad Banner */}
        <div className="mb-6">
          <AdSense className="min-h-[90px]" />
        </div>

        {/* Party Header */}
        <div className="mb-8 pb-6 border-b-4" style={{ borderColor: party.color }}>
          <div className="flex items-start gap-6">
            {party.logo_url ? (
              <img
                src={party.logo_url}
                alt={partyName}
                className="w-24 h-24 object-contain rounded bg-white shadow"
              />
            ) : (
              <div
                className="w-24 h-24 rounded flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: party.color }}
              >
                {partyName.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className={`text-3xl md:text-4xl font-serif font-bold mb-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {partyName}
              </h1>
              {partyDesc && (
                <p className={`text-muted-foreground ${language === 'ta' ? 'font-tamil' : ''}`}>
                  {partyDesc}
                </p>
              )}
              {party.founded_year && (
                <p className={`text-sm text-muted-foreground mt-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
                  {t(`Founded: ${party.founded_year}`, `நிறுவப்பட்டது: ${party.founded_year}`)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6 flex-wrap h-auto gap-2">
                <TabsTrigger value="all" className={language === 'ta' ? 'font-tamil' : ''}>
                  {t('All', 'அனைத்தும்')}
                </TabsTrigger>
                <TabsTrigger value="elections" className={language === 'ta' ? 'font-tamil' : ''}>
                  {t('Elections', 'தேர்தல்கள்')}
                </TabsTrigger>
                <TabsTrigger value="government" className={language === 'ta' ? 'font-tamil' : ''}>
                  {t('Government', 'அரசு')}
                </TabsTrigger>
                <TabsTrigger value="statements" className={language === 'ta' ? 'font-tamil' : ''}>
                  {t('Statements', 'அறிக்கைகள்')}
                </TabsTrigger>
                <TabsTrigger value="protests" className={language === 'ta' ? 'font-tamil' : ''}>
                  {t('Protests', 'போராட்டங்கள்')}
                </TabsTrigger>
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat} value={cat}>
                  {newsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="aspect-[4/3] w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {filterByCategory(cat).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByCategory(cat).map((item) => (
                            <NewsCard 
                              key={item.id} 
                              {...item} 
                              party={item.parties}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className={`text-center text-muted-foreground py-12 ${language === 'ta' ? 'font-tamil' : ''}`}>
                          {t('No news in this category', 'இந்த பிரிவில் செய்திகள் இல்லை')}
                        </p>
                      )}
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <PartyFilter />
            
            {/* Sidebar Ad */}
            <div className="bg-card border border-border rounded-sm p-4">
              <AdSense className="min-h-[250px]" />
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

export default PartyPage;
