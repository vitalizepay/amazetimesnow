import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import NewsCard from '@/components/news/NewsCard';
import CategoryBadge from '@/components/news/CategoryBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ta, enIN } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import AdSense from '@/components/ads/AdSense';

interface Article {
  id: string;
  title_en: string;
  title_ta: string;
  content_en: string;
  content_ta: string;
  slug: string;
  category: string;
  featured_image: string | null;
  published_at: string;
  source: string;
  source_url: string | null;
  parties: {
    id: string;
    name_en: string;
    name_ta: string;
    slug: string;
    color: string;
  } | null;
}

interface RelatedNews {
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
  parties: {
    slug: string;
    name_en: string;
    name_ta: string;
    color: string;
  } | null;
}

const ArticlePage = () => {
  const { partySlug, newsSlug } = useParams<{ partySlug: string; newsSlug: string }>();
  const { language, t } = useLanguage();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', newsSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          parties (
            id,
            name_en,
            name_ta,
            slug,
            color
          )
        `)
        .eq('slug', newsSlug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data as Article | null;
    },
    enabled: !!newsSlug,
  });

  const { data: relatedNews } = useQuery({
    queryKey: ['related-news', article?.parties?.id, article?.id],
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
            slug,
            name_en,
            name_ta,
            color
          )
        `)
        .eq('party_id', article?.parties?.id)
        .eq('status', 'published')
        .neq('id', article?.id)
        .order('published_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data as RelatedNews[];
    },
    enabled: !!article?.parties?.id,
  });

  if (isLoading) {
    return (
      <Layout>
        <article className="container py-8 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="aspect-video w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </article>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">
            {t('Article Not Found', 'செய்தி கிடைக்கவில்லை')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('The article you are looking for does not exist.', 'நீங்கள் தேடும் செய்தி இல்லை.')}
          </p>
          <Link to="/" className="text-accent hover:underline">
            {t('Return to Home', 'முகப்புக்கு திரும்பு')}
          </Link>
        </div>
      </Layout>
    );
  }

  const title = language === 'ta' ? article.title_ta : article.title_en;
  const content = language === 'ta' ? article.content_ta : article.content_en;
  const partyName = article.parties ? (language === 'ta' ? article.parties.name_ta : article.parties.name_en) : null;

  const publishedDate = format(
    new Date(article.published_at),
    'EEEE, MMMM d, yyyy • h:mm a',
    { locale: language === 'ta' ? ta : enIN }
  );

  return (
    <Layout>
      <article className="container py-8 max-w-4xl mx-auto">
        {/* Top Ad Banner */}
        <div className="mb-6">
          <AdSense className="min-h-[90px]" />
        </div>

        {/* Back link */}
        <Link
          to={article.parties ? `/party/${article.parties.slug}` : '/'}
          className={`inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 ${language === 'ta' ? 'font-tamil' : ''}`}
        >
          <ArrowLeft className="w-4 h-4" />
          {partyName ? (
            <>
              {t('Back to', 'திரும்பு')} {partyName}
            </>
          ) : (
            t('Back to Home', 'முகப்புக்கு திரும்பு')
          )}
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CategoryBadge category={article.category} />
            {partyName && (
              <>
                <span className="text-muted-foreground">•</span>
                <span
                  className={`text-sm font-medium ${language === 'ta' ? 'font-tamil' : ''}`}
                  style={{ color: article.parties?.color }}
                >
                  {partyName}
                </span>
              </>
            )}
          </div>

          <h1 className={`text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight ${language === 'ta' ? 'font-tamil' : ''}`}>
            {title}
          </h1>

          <time className="text-muted-foreground text-sm block mb-6">
            {publishedDate}
          </time>

          {article.featured_image && (
            <figure className="mb-8">
              <img
                src={article.featured_image}
                alt={title}
                className="w-full aspect-video object-cover rounded-sm"
              />
            </figure>
          )}
        </header>

        {/* Article Content */}
        <div
          className={`prose prose-lg max-w-none mb-8 ${language === 'ta' ? 'font-tamil' : ''}`}
        >
          {content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 text-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Mid-article Ad */}
        <div className="mb-8">
          <AdSense className="min-h-[250px]" />
        </div>

        {/* Source */}
        {article.source === 'auto' && article.source_url && (
          <div className="border-t border-border pt-4 mb-12">
            <p className="text-sm text-muted-foreground">
              {t('Source:', 'ஆதாரம்:')} 
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline ml-1"
              >
                {new URL(article.source_url).hostname}
              </a>
            </p>
          </div>
        )}

        {/* Related News */}
        {relatedNews && relatedNews.length > 0 && (
          <section className="border-t-2 border-primary pt-8">
            <h2 className={`text-2xl font-serif font-bold mb-6 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t('Related News', 'தொடர்புடைய செய்திகள்')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedNews.map((item) => (
                <NewsCard key={item.id} {...item} party={item.parties} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Ad Banner */}
        <div className="mt-8">
          <AdSense className="min-h-[90px]" />
        </div>
      </article>
    </Layout>
  );
};

export default ArticlePage;
