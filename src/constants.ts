import { CostItem, MaterialPrice, LaborRate, QualityLevel } from './types';

export const MATERIAL_DATABASE: MaterialPrice[] = [
  { name: 'Demir (Q8-Q32)', unit: 'Ton', price: 28500, consumptionPerM2: 0.045 },
  { name: 'Hazır Beton (C25/30)', unit: 'm³', price: 2400, consumptionPerM2: 0.45 },
  { name: 'Tuğla (13.5\'luk)', unit: 'Adet', price: 8.5, consumptionPerM2: 45 },
  { name: 'Çimento (50kg)', unit: 'Torba', price: 185, consumptionPerM2: 0.8 },
  { name: 'Kum/Çakıl', unit: 'm³', price: 650, consumptionPerM2: 0.15 },
  { name: 'Seramik (1. Sınıf)', unit: 'm²', price: 450, consumptionPerM2: 1.1 },
];

export const LABOR_DATABASE: LaborRate[] = [
  { trade: 'Kalıpçı/Demirci', dailyRate: 1800, daysPer100M2: 25 },
  { trade: 'Duvarcı', dailyRate: 1500, daysPer100M2: 10 },
  { trade: 'Sıvacı', dailyRate: 1400, daysPer100M2: 15 },
  { trade: 'Tesisatçı (Sıhhi/Elek)', dailyRate: 2000, daysPer100M2: 8 },
  { trade: 'Boyacı', dailyRate: 1300, daysPer100M2: 5 },
];

export const INITIAL_COST_ITEMS: Record<QualityLevel, CostItem[]> = {
  Standart: [
    { id: '1', name: 'Demir ve Beton (Kaba)', category: 'Malzeme', unitPrice: 4800, isPerM2: true, description: 'Temel ve karkas malzemeleri' },
    { id: '2', name: 'İşçilik (Kaba İnşaat)', category: 'İşçilik', unitPrice: 2500, isPerM2: true, description: 'Kalıp, demir ve beton işçiliği' },
    { id: '3', name: 'Tesisat İşçiliği', category: 'İşçilik', unitPrice: 1200, isPerM2: true, description: 'Elektrik ve su tesisat ustalık bedeli' },
    { id: '4', name: 'Belediye Ruhsat Harçları', category: 'Ruhsat/Proje', unitPrice: 45000, isPerM2: false, description: 'Standart belediye ödemeleri' },
    { id: '5', name: 'Mimari/Statik Proje', category: 'Ruhsat/Proje', unitPrice: 35000, isPerM2: false, description: 'Onaylı proje çizimleri' },
    { id: '6', name: 'Nakliye ve Lojistik', category: 'Ek Gider', unitPrice: 15000, isPerM2: false, description: 'Malzeme sevkiyat giderleri' },
  ],
  Lüks: [
    { id: '1', name: 'Demir ve Beton (Güçlendirilmiş)', category: 'Malzeme', unitPrice: 5500, isPerM2: true, description: 'Yüksek dayanımlı karkas' },
    { id: '2', name: 'İşçilik (Özel Ekip)', category: 'İşçilik', unitPrice: 4000, isPerM2: true, description: 'Sertifikalı usta işçiliği' },
    { id: '3', name: 'Akıllı Ev Tesisat İşçiliği', category: 'İşçilik', unitPrice: 2500, isPerM2: true, description: 'Otomasyon ve özel tesisat' },
    { id: '4', name: 'Ruhsat ve Denetim Giderleri', category: 'Ruhsat/Proje', unitPrice: 65000, isPerM2: false, description: 'Kapsamlı belediye ve yapı denetim' },
    { id: '5', name: 'İç Mimari Tasarım', category: 'Ruhsat/Proje', unitPrice: 50000, isPerM2: false, description: 'Özel dekorasyon projeleri' },
    { id: '6', name: 'Sigorta ve Güvenlik', category: 'Ek Gider', unitPrice: 25000, isPerM2: false, description: 'Şantiye güvenliği ve sigorta' },
  ],
  Premium: [
    { id: '1', name: 'Özel Karkas Sistemleri', category: 'Malzeme', unitPrice: 7500, isPerM2: true, description: 'En üst segment yapı malzemeleri' },
    { id: '2', name: 'Sanatkar İşçiliği', category: 'İşçilik', unitPrice: 7000, isPerM2: true, description: 'Kusursuz detay işçiliği' },
    { id: '3', name: 'Mühendislik Danışmanlığı', category: 'Ruhsat/Proje', unitPrice: 120000, isPerM2: false, description: 'Özel teknik danışmanlık' },
    { id: '4', name: 'Uluslararası Sertifikasyon', category: 'Ruhsat/Proje', unitPrice: 80000, isPerM2: false, description: 'Yeşil bina vb. sertifikalar' },
    { id: '5', name: 'Özel Nakliye (Vinç/Tır)', category: 'Ek Gider', unitPrice: 45000, isPerM2: false, description: 'Ağır iş makinesi ve özel sevkiyat' },
  ],
};
