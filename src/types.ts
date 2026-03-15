export type Category = 'Malzeme' | 'İşçilik' | 'Ruhsat/Proje' | 'Ek Gider';

export interface CostItem {
  id: string;
  name: string;
  category: Category;
  unitPrice: number; // per m2 or fixed
  isPerM2: boolean;
  description: string;
}

export interface MaterialPrice {
  name: string;
  unit: string;
  price: number;
  consumptionPerM2: number; // average consumption per m2 of construction
}

export interface LaborRate {
  trade: string;
  dailyRate: number;
  daysPer100M2: number; // estimated days needed for 100m2
}

export interface CalculationResult {
  totalArea: number;
  floors: number;
  rooms: number;
  items: {
    item: CostItem;
    total: number;
  }[];
  subtotals: {
    [key in Category]?: number;
  };
  grandTotal: number;
  profitAmount: number;
  finalPrice: number;
}

export type QualityLevel = 'Standart' | 'Lüks' | 'Premium';

export interface SavedCalculation {
  id: string;
  date: string;
  name: string;
  clientName?: string;
  location?: string;
  area: number;
  floors: number;
  rooms: number;
  quality: QualityLevel;
  profitMargin: number;
  activeItems: CostItem[];
  totalPrice: number;
}
