import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="masthead bg-card">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between py-2 text-sm">
          <span className={language === 'ta' ? 'font-tamil' : ''}>{today}</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                language === 'en' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-primary-foreground/10'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 rounded text-sm font-tamil font-medium transition-colors ${
                language === 'ta' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-primary-foreground/10'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="container py-6 text-center border-b border-border">
        <Link to="/" className="inline-block">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-primary tracking-tight">
            {t('AMAZETIMES NOW', 'அமேஸ்டைம்ஸ் நவ்')}
          </h1>
          <p className={`mt-1 text-sm text-muted-foreground uppercase tracking-widest ${language === 'ta' ? 'font-tamil' : ''}`}>
            {t('Tamil Nadu Political News', 'தமிழ்நாடு அரசியல் செய்திகள்')}
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="bg-secondary border-b border-border">
        <div className="container">
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center justify-between py-3">
            <span className={`font-semibold ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t('Menu', 'பட்டியல்')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <ul className={`md:flex md:items-center md:justify-center md:gap-6 py-3 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
            <li>
              <Link 
                to="/" 
                className={`block py-2 md:py-0 font-semibold text-foreground hover:text-accent transition-colors ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {t('Home', 'முகப்பு')}
              </Link>
            </li>
            <li>
              <Link 
                to="/party/dmk" 
                className={`block py-2 md:py-0 font-medium text-foreground hover:text-accent transition-colors ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {t('DMK', 'திமுக')}
              </Link>
            </li>
            <li>
              <Link 
                to="/party/aiadmk" 
                className={`block py-2 md:py-0 font-medium text-foreground hover:text-accent transition-colors ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {t('AIADMK', 'அதிமுக')}
              </Link>
            </li>
            <li>
              <Link 
                to="/party/bjp" 
                className={`block py-2 md:py-0 font-medium text-foreground hover:text-accent transition-colors ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {t('BJP', 'பாஜக')}
              </Link>
            </li>
            <li>
              <Link 
                to="/party/ntk" 
                className={`block py-2 md:py-0 font-medium text-foreground hover:text-accent transition-colors ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {t('NTK', 'நாம் தமிழர்')}
              </Link>
            </li>
            <li>
              <Link 
                to="/party/pmk" 
                className={`block py-2 md:py-0 font-medium text-foreground hover:text-accent transition-colors ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {t('PMK', 'பாமக')}
              </Link>
            </li>
            <li>
              <Link 
                to="/party/congress" 
                className={`block py-2 md:py-0 font-medium text-foreground hover:text-accent transition-colors ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {t('Congress', 'காங்கிரஸ்')}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
