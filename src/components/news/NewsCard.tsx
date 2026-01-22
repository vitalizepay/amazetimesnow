import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { ta, enIN } from 'date-fns/locale';
import CategoryBadge from './CategoryBadge';

interface NewsCardProps {
  id: string;
  title_en: string;
  title_ta: string;
  content_en: string;
  content_ta: string;
  slug: string;
  category: string;
  featured_image: string | null;
  published_at: string;
  is_breaking?: boolean;
  party?: {
    slug: string;
    name_en: string;
    name_ta: string;
    color: string;
  } | null;
  variant?: 'default' | 'featured' | 'compact';
}

const NewsCard = ({
  title_en,
  title_ta,
  content_en,
  content_ta,
  slug,
  category,
  featured_image,
  published_at,
  is_breaking,
  party,
  variant = 'default',
}: NewsCardProps) => {
  const { language, t } = useLanguage();
  
  const title = language === 'ta' ? title_ta : title_en;
  const content = language === 'ta' ? content_ta : content_en;
  const partyName = party ? (language === 'ta' ? party.name_ta : party.name_en) : null;
  const partySlug = party?.slug || 'general';

  const timeAgo = formatDistanceToNow(new Date(published_at), {
    addSuffix: true,
    locale: language === 'ta' ? ta : enIN,
  });

  const truncatedContent = content.slice(0, 150) + (content.length > 150 ? '...' : '');

  if (variant === 'featured') {
    return (
      <Link
        to={`/party/${partySlug}/${slug}`}
        className="news-card group block relative"
      >
        {party && (
          <div
            className="party-indicator"
            style={{ backgroundColor: party.color }}
          />
        )}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {featured_image ? (
            <img
              src={featured_image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-4xl font-serif font-bold text-primary/30">
                {partyName?.charAt(0) || 'N'}
              </span>
            </div>
          )}
          {is_breaking && (
            <span className="absolute top-4 left-4 bg-breaking text-breaking-foreground px-3 py-1 text-xs font-bold uppercase rounded">
              {t('Breaking', 'முக்கிய')}
            </span>
          )}
        </div>
        <div className="p-4 pl-5">
          <div className="flex items-center gap-2 mb-2">
            <CategoryBadge category={category} />
            {partyName && (
              <span className={`text-xs text-muted-foreground ${language === 'ta' ? 'font-tamil' : ''}`}>
                • {partyName}
              </span>
            )}
          </div>
          <h3 className={`text-xl font-serif font-bold text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {title}
          </h3>
          <p className={`text-sm text-muted-foreground mb-3 line-clamp-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {truncatedContent}
          </p>
          <time className="text-xs text-muted-foreground">{timeAgo}</time>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/party/${partySlug}/${slug}`}
        className="group flex gap-3 py-3 border-b border-border last:border-0"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge category={category} size="sm" />
          </div>
          <h4 className={`text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {title}
          </h4>
          <time className="text-xs text-muted-foreground mt-1 block">{timeAgo}</time>
        </div>
        {featured_image && (
          <div className="w-20 h-16 shrink-0 overflow-hidden rounded bg-muted">
            <img
              src={featured_image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={`/party/${partySlug}/${slug}`}
      className="news-card group block relative"
    >
      {party && (
        <div
          className="party-indicator"
          style={{ backgroundColor: party.color }}
        />
      )}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {featured_image ? (
          <img
            src={featured_image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
            <span className="text-2xl font-serif font-bold text-primary/30">
              {partyName?.charAt(0) || 'N'}
            </span>
          </div>
        )}
        {is_breaking && (
          <span className="absolute top-2 left-2 bg-breaking text-breaking-foreground px-2 py-0.5 text-xs font-bold uppercase rounded">
            {t('Breaking', 'முக்கிய')}
          </span>
        )}
      </div>
      <div className="p-3 pl-4">
        <div className="flex items-center gap-2 mb-1">
          <CategoryBadge category={category} size="sm" />
        </div>
        <h3 className={`font-serif font-bold text-foreground group-hover:text-accent transition-colors mb-1 line-clamp-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
          {title}
        </h3>
        <time className="text-xs text-muted-foreground">{timeAgo}</time>
      </div>
    </Link>
  );
};

export default NewsCard;
