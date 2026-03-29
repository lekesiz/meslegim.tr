/**
 * Meslegim.tr - Ürün ve Fiyat Tanımları
 * 
 * Freemium Model:
 * - İlk etap (Etap 1) ücretsiz
 * - Sonraki etaplar ve AI raporlar ücretli
 * 
 * Paketler:
 * - Temel: 2. ve 3. etap erişimi
 * - Profesyonel: Tüm etaplar + AI rapor + Kariyer Profili Özeti
 * - Kurumsal: Profesyonel + Sertifika + Mentor desteği + Öncelikli destek
 * 
 * Tek Seferlik:
 * - Kapsamlı AI Kariyer Raporu (bağımsız satın alma)
 */

export type ProductId = 
  | 'basic_package'
  | 'professional_package'
  | 'enterprise_package'
  | 'ai_career_report'
  | 'single_stage_unlock';

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  features: string[];
  priceInCents: number; // TRY kuruş cinsinden
  currency: string;
  type: 'one_time' | 'subscription';
  popular?: boolean;
  badge?: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  basic_package: {
    id: 'basic_package',
    name: 'Temel Paket',
    description: 'Kariyer keşfine ilk adım',
    features: [
      'Etap 1: İlgi Alanları Testi (Ücretsiz)',
      'Etap 2: Yetenek Değerlendirmesi',
      'Etap 3: Kişilik Envanteri',
      'Temel RIASEC Profili',
      'Etap bazlı sonuç raporları',
    ],
    priceInCents: 14900, // 149 TL
    currency: 'try',
    type: 'one_time',
    badge: 'Başlangıç',
  },

  professional_package: {
    id: 'professional_package',
    name: 'Profesyonel Paket',
    description: 'Kapsamlı kariyer analizi',
    features: [
      'Temel Paket\'teki her şey',
      'Etap 4: Kariyer Değerleri Envanteri',
      'Etap 5: Kariyer Risk Analizi',
      'AI Destekli Kapsamlı Kariyer Raporu',
      'Kariyer Profili Özeti (Big Five + RIASEC)',
      'AI-Proof Kariyer Önerileri',
      'PDF Rapor İndirme',
    ],
    priceInCents: 29900, // 299 TL
    currency: 'try',
    type: 'one_time',
    popular: true,
    badge: 'En Popüler',
  },

  enterprise_package: {
    id: 'enterprise_package',
    name: 'Kurumsal Paket',
    description: 'Tam kapsamlı kariyer rehberliği',
    features: [
      'Profesyonel Paket\'teki her şey',
      'Profesyonel Sertifika (PDF + QR Doğrulama)',
      'Birebir Mentor Desteği',
      'Öncelikli Destek',
      'Detaylı Karşılaştırmalı Rapor',
      'Kariyer Yol Haritası',
      'Sınırsız Rapor Güncelleme',
    ],
    priceInCents: 49900, // 499 TL
    currency: 'try',
    type: 'one_time',
    badge: 'Premium',
  },

  ai_career_report: {
    id: 'ai_career_report',
    name: 'AI Kariyer Raporu',
    description: 'Tek seferlik kapsamlı AI kariyer analizi raporu',
    features: [
      'Tüm tamamlanan etapların birleşik analizi',
      'AI destekli kariyer önerileri',
      'Big Five + RIASEC profil analizi',
      'AI-Proof kariyer değerlendirmesi',
      'PDF formatında indirilebilir rapor',
    ],
    priceInCents: 9900, // 99 TL
    currency: 'try',
    type: 'one_time',
  },

  single_stage_unlock: {
    id: 'single_stage_unlock',
    name: 'Tekli Etap Açma',
    description: 'İstediğiniz bir etabı açın',
    features: [
      'Seçtiğiniz 1 etaba erişim',
      'Etap sonuç raporu',
    ],
    priceInCents: 4900, // 49 TL
    currency: 'try',
    type: 'one_time',
  },
};

// Paket bazlı erişim hakları
export const PACKAGE_ACCESS: Record<string, {
  maxStages: number;
  aiReport: boolean;
  careerProfile: boolean;
  certificate: boolean;
  mentorSupport: boolean;
  prioritySupport: boolean;
}> = {
  free: {
    maxStages: 1,
    aiReport: false,
    careerProfile: false,
    certificate: false,
    mentorSupport: false,
    prioritySupport: false,
  },
  basic_package: {
    maxStages: 3,
    aiReport: false,
    careerProfile: false,
    certificate: false,
    mentorSupport: false,
    prioritySupport: false,
  },
  professional_package: {
    maxStages: 99, // tüm etaplar
    aiReport: true,
    careerProfile: true,
    certificate: false,
    mentorSupport: false,
    prioritySupport: false,
  },
  enterprise_package: {
    maxStages: 99,
    aiReport: true,
    careerProfile: true,
    certificate: true,
    mentorSupport: true,
    prioritySupport: true,
  },
};

// Freemium: İlk etap her zaman ücretsiz
export const FREE_STAGE_COUNT = 1;

// Fiyatı formatla (TRY)
export function formatPrice(priceInCents: number): string {
  return `${(priceInCents / 100).toFixed(0)} ₺`;
}

// Tüm paketleri listele (fiyatlandırma sayfası için)
export function getPackages(): Product[] {
  return [
    PRODUCTS.basic_package,
    PRODUCTS.professional_package,
    PRODUCTS.enterprise_package,
  ];
}
