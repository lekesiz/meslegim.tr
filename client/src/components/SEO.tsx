import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

const SITE_NAME = "Meslegim.tr";
const DEFAULT_DESCRIPTION = "Kariyer değerlendirme platformu - Kişisel yeteneklerini keşfet, kariyer yolunu belirle. Yapay zeka destekli kariyer analizi ve profesyonel rehberlik.";
const DEFAULT_KEYWORDS = "kariyer değerlendirme, meslek seçimi, yetenek testi, kariyer rehberliği, meslek testi, üniversite tercih, bölüm seçimi, kariyer analizi";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage,
  canonical,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Kariyer Değerlendirme Platformu`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
