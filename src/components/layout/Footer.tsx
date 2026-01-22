import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">
              {t('AMAZE DAILY TIMES', 'அமேஸ் டெய்லி டைம்ஸ்')}
            </h3>
            <p className={`text-primary-foreground/80 text-sm ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t(
                'Your trusted source for Tamil Nadu political news. Unbiased, accurate, and timely coverage.',
                'தமிழ்நாடு அரசியல் செய்திகளுக்கான உங்கள் நம்பகமான ஆதாரம். நடுநிலையான, துல்லியமான மற்றும் சரியான நேரத்தில் செய்தி.'
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t('Political Parties', 'அரசியல் கட்சிகள்')}
            </h4>
            <ul className={`space-y-2 text-sm text-primary-foreground/80 ${language === 'ta' ? 'font-tamil' : ''}`}>
              <li>
                <Link to="/party/dmk" className="hover:text-primary-foreground transition-colors">
                  {t('DMK', 'திமுக')}
                </Link>
              </li>
              <li>
                <Link to="/party/aiadmk" className="hover:text-primary-foreground transition-colors">
                  {t('AIADMK', 'அதிமுக')}
                </Link>
              </li>
              <li>
                <Link to="/party/bjp" className="hover:text-primary-foreground transition-colors">
                  {t('BJP Tamil Nadu', 'பாஜக தமிழ்நாடு')}
                </Link>
              </li>
              <li>
                <Link to="/party/ntk" className="hover:text-primary-foreground transition-colors">
                  {t('Naam Tamilar Katchi', 'நாம் தமிழர் கட்சி')}
                </Link>
              </li>
              <li>
                <Link to="/party/pmk" className="hover:text-primary-foreground transition-colors">
                  {t('PMK', 'பாமக')}
                </Link>
              </li>
              <li>
                <Link to="/party/congress" className="hover:text-primary-foreground transition-colors">
                  {t('Congress TN', 'காங்கிரஸ் தமிழ்நாடு')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className={`font-semibold mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t('Categories', 'பிரிவுகள்')}
            </h4>
            <ul className={`space-y-2 text-sm text-primary-foreground/80 ${language === 'ta' ? 'font-tamil' : ''}`}>
              <li>{t('Elections', 'தேர்தல்கள்')}</li>
              <li>{t('Government Actions', 'அரசு நடவடிக்கைகள்')}</li>
              <li>{t('Statements', 'அறிக்கைகள்')}</li>
              <li>{t('Protests & Events', 'போராட்டங்கள் & நிகழ்வுகள்')}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Amaze Daily Times. {t('All rights reserved.', 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
