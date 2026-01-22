import { useEffect } from 'react';

interface AdSenseProps {
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdSense = ({ className = '', style }: AdSenseProps) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-6592137877448044"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense;
