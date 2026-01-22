-- Parties table for Tamil Nadu political parties
CREATE TABLE public.parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description_en TEXT,
  description_ta TEXT,
  founded_year INTEGER,
  color TEXT DEFAULT '#1a365d',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- News articles table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_ta TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  party_id UUID REFERENCES public.parties(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'general',
  featured_image TEXT,
  source TEXT DEFAULT 'manual',
  source_url TEXT,
  is_breaking BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'editor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RSS feed sources for auto-ingestion
CREATE TABLE public.rss_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_sources ENABLE ROW LEVEL SECURITY;

-- Public read access for parties
CREATE POLICY "Parties are publicly readable"
ON public.parties FOR SELECT
USING (true);

-- Public read access for published news
CREATE POLICY "Published news is publicly readable"
ON public.news FOR SELECT
USING (status = 'published');

-- Admin access for news management
CREATE POLICY "Admins can manage news"
ON public.news FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Admin access for parties management
CREATE POLICY "Admins can manage parties"
ON public.parties FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Admin users can read their own record
CREATE POLICY "Admins can read admin_users"
ON public.admin_users FOR SELECT
USING (user_id = auth.uid());

-- Admins can manage RSS sources
CREATE POLICY "Admins can manage RSS sources"
ON public.rss_sources FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_news_party_id ON public.news(party_id);
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_news_status ON public.news(status);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_parties_slug ON public.parties(slug);
CREATE INDEX idx_news_slug ON public.news(slug);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_parties_updated_at
BEFORE UPDATE ON public.parties
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Tamil Nadu political parties
INSERT INTO public.parties (name_en, name_ta, slug, color, description_en, description_ta, founded_year) VALUES
('Dravida Munnetra Kazhagam', 'திராவிட முன்னேற்றக் கழகம்', 'dmk', '#e63946', 'The ruling party of Tamil Nadu, founded by C.N. Annadurai in 1949.', 'தமிழ்நாட்டின் ஆளும் கட்சி, 1949 இல் சி.என்.அண்ணாதுரை நிறுவினார்.', 1949),
('All India Anna Dravida Munnetra Kazhagam', 'அனைத்திந்திய அண்ணா திராவிட முன்னேற்றக் கழகம்', 'aiadmk', '#1d3557', 'One of the two major Dravidian parties, founded by M.G. Ramachandran in 1972.', 'இரண்டு பெரிய திராவிடக் கட்சிகளில் ஒன்று, 1972 இல் எம்.ஜி.ராமச்சந்திரன் நிறுவினார்.', 1972),
('Bharatiya Janata Party Tamil Nadu', 'பாரதிய ஜனதா கட்சி தமிழ்நாடு', 'bjp', '#ff9933', 'The Tamil Nadu unit of the national BJP party.', 'தேசிய பாஜக கட்சியின் தமிழ்நாடு பிரிவு.', 1980),
('Naam Tamilar Katchi', 'நாம் தமிழர் கட்சி', 'ntk', '#8b0000', 'A Tamil nationalist party founded by Seeman in 2010.', '2010 இல் சீமான் நிறுவிய தமிழ் தேசியவாத கட்சி.', 2010),
('Pattali Makkal Katchi', 'பாட்டாளி மக்கள் கட்சி', 'pmk', '#228b22', 'A party representing the Vanniyar community, founded in 1989.', 'வன்னியர் சமூகத்தை பிரதிநிதித்துவப்படுத்தும் கட்சி, 1989 இல் நிறுவப்பட்டது.', 1989),
('Indian National Congress Tamil Nadu', 'இந்திய தேசிய காங்கிரஸ் தமிழ்நாடு', 'congress', '#00bfff', 'The Tamil Nadu unit of the Indian National Congress.', 'இந்திய தேசிய காங்கிரஸின் தமிழ்நாடு பிரிவு.', 1885);

-- Insert sample news articles
INSERT INTO public.news (title_en, title_ta, content_en, content_ta, slug, party_id, category, is_breaking, is_featured, source) VALUES
('DMK Government Announces Major Infrastructure Development Project for Chennai', 'சென்னைக்கான முக்கிய உள்கட்டமைப்பு மேம்பாட்டு திட்டத்தை திமுக அரசு அறிவித்தது', 'The DMK-led Tamil Nadu government has announced a comprehensive infrastructure development project worth Rs 5,000 crore for Chennai. The project includes metro rail extension, road widening, and flood mitigation measures. Chief Minister M.K. Stalin stated that this initiative aims to transform Chennai into a world-class city by 2030.', 'திமுக தலைமையிலான தமிழ்நாடு அரசு சென்னைக்கு ரூ.5,000 கோடி மதிப்பிலான விரிவான உள்கட்டமைப்பு மேம்பாட்டு திட்டத்தை அறிவித்துள்ளது. இந்த திட்டத்தில் மெட்ரோ ரயில் விரிவாக்கம், சாலை அகலப்படுத்தல் மற்றும் வெள்ள தணிப்பு நடவடிக்கைகள் அடங்கும். 2030க்குள் சென்னையை உலகத்தரம் வாய்ந்த நகரமாக மாற்றுவதே இந்த முயற்சியின் நோக்கம் என்று முதலமைச்சர் மு.க.ஸ்டாலின் கூறினார்.', 'dmk-chennai-infrastructure-2024', (SELECT id FROM public.parties WHERE slug = 'dmk'), 'government', true, true, 'manual'),

('AIADMK Holds State-Level Meeting to Discuss Electoral Strategy', 'தேர்தல் உத்தியை விவாதிக்க அதிமுக மாநில அளவிலான கூட்டம் நடத்தியது', 'The AIADMK conducted a state-level executive meeting in Chennai to discuss strategies for the upcoming local body elections. Senior leaders emphasized the need for party unity and grassroots-level campaigning. The meeting was attended by over 500 district-level functionaries from across Tamil Nadu.', 'வரவிருக்கும் உள்ளாட்சித் தேர்தல்களுக்கான உத்திகளை விவாதிக்க அதிமுக சென்னையில் மாநில அளவிலான நிர்வாகக் கூட்டத்தை நடத்தியது. கட்சி ஒற்றுமை மற்றும் அடிமட்ட நிலை பிரச்சாரத்தின் அவசியத்தை மூத்த தலைவர்கள் வலியுறுத்தினர். தமிழ்நாடு முழுவதிலுமிருந்து 500க்கும் மேற்பட்ட மாவட்ட அளவிலான பதவிநிலையினர் இந்த கூட்டத்தில் கலந்துகொண்டனர்.', 'aiadmk-state-meeting-electoral-strategy', (SELECT id FROM public.parties WHERE slug = 'aiadmk'), 'elections', false, true, 'manual'),

('BJP Tamil Nadu Launches Voter Outreach Program in Rural Districts', 'கிராமப்புற மாவட்டங்களில் பாஜக தமிழ்நாடு வாக்காளர் தொடர்பு திட்டத்தை தொடங்கியது', 'The BJP Tamil Nadu unit has launched an extensive voter outreach program targeting rural districts. The program aims to connect with farmers and rural communities through village-level meetings and addressing local issues. State president K. Annamalai led the inaugural meeting in Tirunelveli district.', 'பாஜக தமிழ்நாடு பிரிவு கிராமப்புற மாவட்டங்களை குறிவைத்து விரிவான வாக்காளர் தொடர்பு திட்டத்தை தொடங்கியுள்ளது. கிராம அளவிலான கூட்டங்கள் மற்றும் உள்ளூர் பிரச்சினைகளை தீர்ப்பதன் மூலம் விவசாயிகள் மற்றும் கிராமப்புற சமூகங்களுடன் இணைவதே இந்த திட்டத்தின் நோக்கம். மாநில தலைவர் கே.அண்ணாமலை திருநெல்வேலி மாவட்டத்தில் தொடக்க கூட்டத்திற்கு தலைமை தாங்கினார்.', 'bjp-rural-voter-outreach-program', (SELECT id FROM public.parties WHERE slug = 'bjp'), 'elections', false, false, 'manual'),

('NTK Announces Mass Rally in Support of Tamil Language Rights', 'தமிழ் மொழி உரிமைகளுக்கு ஆதரவாக நாம் தமிழர் கட்சி பேரணி அறிவிப்பு', 'Naam Tamilar Katchi has announced a massive public rally in Madurai to advocate for Tamil language rights and oppose the implementation of the three-language formula. Party chief Seeman stated that protecting Tamil identity is non-negotiable and called upon all Tamils to participate in the rally scheduled for next month.', 'தமிழ் மொழி உரிமைகளுக்கு ஆதரவாகவும், மும்மொழி திட்டத்தை எதிர்க்கவும் நாம் தமிழர் கட்சி மதுரையில் பெரும் பொதுக்கூட்டத்தை அறிவித்துள்ளது. தமிழ் அடையாளத்தைப் பாதுகாப்பது பேரம் பேசக்கூடியது அல்ல என்று கட்சித் தலைவர் சீமான் கூறினார் மற்றும் அடுத்த மாதம் திட்டமிடப்பட்ட பேரணியில் அனைத்து தமிழர்களும் பங்கேற்குமாறு அழைப்பு விடுத்தார்.', 'ntk-tamil-language-rights-rally', (SELECT id FROM public.parties WHERE slug = 'ntk'), 'protests', false, true, 'manual'),

('PMK Demands Reservation in Private Sector Jobs', 'தனியார் துறை வேலைகளில் இட ஒதுக்கீடு கோரி பாமக', 'Pattali Makkal Katchi has intensified its demand for reservation in private sector employment. Party founder Dr. S. Ramadoss met with industrialists and emphasized the need for proportional representation of all communities in the private sector. The party has threatened to launch protests if the demand is not addressed.', 'தனியார் துறை வேலைவாய்ப்பில் இட ஒதுக்கீடு கோரிக்கையை பாட்டாளி மக்கள் கட்சி தீவிரப்படுத்தியுள்ளது. கட்சி நிறுவனர் டாக்டர் எஸ்.ராமதாஸ் தொழிலதிபர்களை சந்தித்து, தனியார் துறையில் அனைத்து சமூகங்களுக்கும் விகிதாசார பிரதிநிதித்துவம் வேண்டிய அவசியத்தை வலியுறுத்தினார். கோரிக்கை தீர்க்கப்படாவிட்டால் போராட்டம் நடத்தப்படும் என்று கட்சி எச்சரித்துள்ளது.', 'pmk-private-sector-reservation-demand', (SELECT id FROM public.parties WHERE slug = 'pmk'), 'statements', false, false, 'manual'),

('Congress TN Welcomes Alliance Partners for United Front', 'ஐக்கிய முன்னணிக்கு கூட்டணி கட்சிகளை காங்கிரஸ் வரவேற்றது', 'The Tamil Nadu Congress Committee held a meeting with alliance partners to discuss the formation of a united front for upcoming elections. TNCC President K. Selvaperunthagai emphasized the importance of secular unity and collective effort against divisive politics. Representatives from multiple parties attended the consultative meeting.', 'வரவிருக்கும் தேர்தல்களுக்கான ஐக்கிய முன்னணி அமைப்பது குறித்து கூட்டணி கட்சிகளுடன் தமிழ்நாடு காங்கிரஸ் கமிட்டி கூட்டம் நடத்தியது. பிரிவினை அரசியலுக்கு எதிரான மதச்சார்பற்ற ஒற்றுமை மற்றும் கூட்டு முயற்சியின் முக்கியத்துவத்தை தமிழ்நாடு காங்கிரஸ் கமிட்டி தலைவர் கே.செல்வப்பெருந்தகை வலியுறுத்தினார். பல கட்சிகளின் பிரதிநிதிகள் ஆலோசனைக் கூட்டத்தில் கலந்துகொண்டனர்.', 'congress-alliance-united-front-meeting', (SELECT id FROM public.parties WHERE slug = 'congress'), 'elections', false, false, 'manual'),

('Chief Minister Inaugurates New Medical College in Villupuram', 'விழுப்புரத்தில் புதிய மருத்துவக் கல்லூரியை முதலமைச்சர் திறந்து வைத்தார்', 'Tamil Nadu Chief Minister M.K. Stalin inaugurated a new government medical college in Villupuram district. The college, built at a cost of Rs 450 crore, will accommodate 150 students annually. This is part of the government ongoing efforts to expand medical education infrastructure across the state.', 'தமிழ்நாடு முதலமைச்சர் மு.க.ஸ்டாலின் விழுப்புரம் மாவட்டத்தில் புதிய அரசு மருத்துவக் கல்லூரியை திறந்து வைத்தார். ரூ.450 கோடியில் கட்டப்பட்ட இந்த கல்லூரியில் ஆண்டுக்கு 150 மாணவர்கள் சேர்க்கப்படுவர். மாநிலம் முழுவதும் மருத்துவக் கல்வி உள்கட்டமைப்பை விரிவுபடுத்தும் அரசின் தொடர்ச்சியான முயற்சிகளின் ஒரு பகுதியாக இது உள்ளது.', 'cm-inaugurates-villupuram-medical-college', (SELECT id FROM public.parties WHERE slug = 'dmk'), 'government', true, true, 'manual'),

('AIADMK Criticizes State Government Over Rising Fuel Prices', 'உயரும் எரிபொருள் விலை குறித்து மாநில அரசை அதிமுக விமர்சனம்', 'AIADMK has criticized the DMK government for failing to reduce state taxes on fuel despite rising prices. Former Chief Minister O. Panneerselvam demanded immediate relief measures for the common people. The party accused the government of being insensitive to the plight of ordinary citizens struggling with inflation.', 'உயரும் விலை இருந்தபோதிலும் எரிபொருள் மீதான மாநில வரிகளைக் குறைக்கத் தவறியதற்காக திமுக அரசை அதிமுக விமர்சித்துள்ளது. சாமானிய மக்களுக்கு உடனடி நிவாரண நடவடிக்கைகள் எடுக்க வேண்டும் என்று முன்னாள் முதலமைச்சர் ஓ.பன்னீர்செல்வம் கோரினார். பணவீக்கத்தால் போராடும் சாதாரண குடிமக்களின் துயரத்தைப் பற்றி அரசு அலட்சியமாக இருப்பதாக கட்சி குற்றம் சாட்டியது.', 'aiadmk-criticizes-fuel-prices', (SELECT id FROM public.parties WHERE slug = 'aiadmk'), 'statements', false, false, 'manual');