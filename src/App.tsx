import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  Layers, 
  Info,
  PieChart as PieChartIcon,
  Download,
  Share2,
  Building2,
  CheckCircle2,
  Plus,
  Trash2,
  Database,
  Users,
  Box,
  Package,
  ChevronDown,
  ChevronUp,
  Settings2,
  X,
  Edit3,
  Save,
  History,
  ClipboardList,
  FileText
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_COST_ITEMS, MATERIAL_DATABASE as INITIAL_MATERIALS, LABOR_DATABASE as INITIAL_LABORS } from './constants';
import { QualityLevel, CalculationResult, CostItem, Category, MaterialPrice, LaborRate, SavedCalculation } from './types';
import { generatePDF } from './utils/pdfGenerator';

const COLORS = ['#141414', '#4A4A4A', '#8E8E8E', '#D1D1D1', '#A3A3A3'];

export default function App() {
  const [quality, setQuality] = useState<QualityLevel>(() => {
    const saved = localStorage.getItem('proinsaat_quality');
    return (saved as QualityLevel) || 'Standart';
  });

  const [area, setArea] = useState<number>(() => {
    const saved = localStorage.getItem('proinsaat_area');
    return saved ? Number(saved) : 120;
  });

  const [floors, setFloors] = useState<number>(() => {
    const saved = localStorage.getItem('proinsaat_floors');
    return saved ? Number(saved) : 1;
  });

  const [rooms, setRooms] = useState<number>(() => {
    const saved = localStorage.getItem('proinsaat_rooms');
    return saved ? Number(saved) : 3;
  });

  const [materials, setMaterials] = useState<MaterialPrice[]>(() => {
    const saved = localStorage.getItem('proinsaat_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });
  
  const [labors, setLabors] = useState<LaborRate[]>(() => {
    const saved = localStorage.getItem('proinsaat_labors');
    return saved ? JSON.parse(saved) : INITIAL_LABORS;
  });
  
  // State for calculation items
  const [activeItems, setActiveItems] = useState<CostItem[]>(() => {
    const saved = localStorage.getItem('proinsaat_activeItems');
    return saved ? JSON.parse(saved) : INITIAL_COST_ITEMS[quality];
  });

  const [profitMargin, setProfitMargin] = useState<number>(() => {
    const saved = localStorage.getItem('proinsaat_profitMargin');
    return saved ? Number(saved) : 20;
  });

  const [history, setHistory] = useState<SavedCalculation[]>(() => {
    const saved = localStorage.getItem('proinsaat_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'calculator' | 'database' | 'history'>('calculator');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('proinsaat_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('proinsaat_labors', JSON.stringify(labors));
  }, [labors]);

  useEffect(() => {
    localStorage.setItem('proinsaat_activeItems', JSON.stringify(activeItems));
  }, [activeItems]);

  useEffect(() => {
    localStorage.setItem('proinsaat_area', area.toString());
  }, [area]);

  useEffect(() => {
    localStorage.setItem('proinsaat_floors', floors.toString());
  }, [floors]);

  useEffect(() => {
    localStorage.setItem('proinsaat_rooms', rooms.toString());
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('proinsaat_quality', quality);
  }, [quality]);

  useEffect(() => {
    localStorage.setItem('proinsaat_profitMargin', profitMargin.toString());
  }, [profitMargin]);

  useEffect(() => {
    localStorage.setItem('proinsaat_history', JSON.stringify(history));
  }, [history]);

  // Initialize active items when quality changes (only if it's the first time or user explicitly changes it)
  // We need to be careful not to overwrite custom items if the user just refreshed.
  // We'll use a ref to track if it's the initial mount.
  const isInitialMount = React.useRef(true);
  const isLoadingFromHistory = React.useRef(false);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isLoadingFromHistory.current) {
      isLoadingFromHistory.current = false;
      return;
    }
    setActiveItems(INITIAL_COST_ITEMS[quality]);
  }, [quality]);

  const resetToDefaults = () => {
    setMaterials(INITIAL_MATERIALS);
    setLabors(INITIAL_LABORS);
    setActiveItems(INITIAL_COST_ITEMS[quality]);
    setArea(120);
    setFloors(1);
    setRooms(3);
    setProfitMargin(20);
    setHistory([]);
    setEditingHistoryId(null);
    localStorage.clear();
  };

  const startNewCalculation = () => {
    setArea(120);
    setFloors(1);
    setRooms(3);
    setQuality('Standart');
    setProfitMargin(20);
    setActiveItems(INITIAL_COST_ITEMS['Standart']);
    setEditingHistoryId(null);
    setSaveName('');
    setClientName('');
    setLocation('');
    setActiveTab('calculator');
  };

  const saveToHistory = () => {
    if (!saveName.trim()) return;
    
    if (editingHistoryId) {
      setHistory(history.map(h => h.id === editingHistoryId ? {
        ...h,
        name: saveName,
        clientName,
        location,
        area,
        floors,
        rooms,
        quality,
        profitMargin,
        activeItems,
        totalPrice: results.finalPrice,
        date: new Date().toISOString()
      } : h));
      setEditingHistoryId(null);
    } else {
      const newSave: SavedCalculation = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        name: saveName,
        clientName,
        location,
        area,
        floors,
        rooms,
        quality,
        profitMargin,
        activeItems,
        totalPrice: results.finalPrice
      };
      setHistory([newSave, ...history]);
    }
    
    setShowSaveModal(false);
    setSaveName('');
    setClientName('');
    setLocation('');
    setActiveTab('history');
  };

  const loadFromHistory = (calc: SavedCalculation) => {
    isLoadingFromHistory.current = true;
    setArea(calc.area);
    setFloors(calc.floors);
    setRooms(calc.rooms);
    setQuality(calc.quality);
    setProfitMargin(calc.profitMargin);
    setActiveItems(calc.activeItems);
    setEditingHistoryId(calc.id);
    setSaveName(calc.name);
    setClientName(calc.clientName || '');
    setLocation(calc.location || '');
    setActiveTab('calculator');
  };

  const deleteFromHistory = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setHistory(prev => prev.filter(h => h.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  // New item form state
  const [newItem, setNewItem] = useState<Partial<CostItem>>({
    name: '',
    category: 'Malzeme',
    unitPrice: 0,
    isPerM2: true,
    description: ''
  });

  const results = useMemo((): CalculationResult => {
    const floorMultiplier = 1 + (floors - 1) * 0.05;
    const roomMultiplier = 1 + (rooms * 0.02);

    const calculatedItems = activeItems.map(item => {
      let total = 0;
      if (item.isPerM2) {
        total = item.unitPrice * area * floorMultiplier * roomMultiplier;
      } else {
        total = item.unitPrice;
      }
      return { item, total };
    });

    const subtotals: Record<string, number> = {};
    calculatedItems.forEach(({ item, total }) => {
      subtotals[item.category] = (subtotals[item.category] || 0) + total;
    });

    const grandTotal = calculatedItems.reduce((acc, curr) => acc + curr.total, 0);
    const profitAmount = (grandTotal * profitMargin) / 100;
    const finalPrice = grandTotal + profitAmount;

    return {
      totalArea: area,
      floors,
      rooms,
      items: calculatedItems,
      subtotals,
      grandTotal,
      profitAmount,
      finalPrice
    };
  }, [area, floors, rooms, profitMargin, activeItems]);

  const chartData = useMemo(() => {
    return Object.entries(results.subtotals).map(([name, value]) => ({
      name,
      value
    }));
  }, [results]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.unitPrice) {
      const item: CostItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newItem.name as string,
        category: newItem.category as Category,
        unitPrice: Number(newItem.unitPrice),
        isPerM2: newItem.isPerM2 as boolean,
        description: newItem.description || ''
      };
      setActiveItems([...activeItems, item]);
      setShowAddModal(false);
      setNewItem({ name: '', category: 'Malzeme', unitPrice: 0, isPerM2: true, description: '' });
    }
  };

  const removeItem = (id: string) => {
    setActiveItems(activeItems.filter(item => item.id !== id));
  };

  const startEditing = (item: CostItem) => {
    setEditingItemId(item.id);
    setEditValue(item.unitPrice.toString());
  };

  const saveEdit = () => {
    if (editingItemId) {
      setActiveItems(activeItems.map(item => 
        item.id === editingItemId ? { ...item, unitPrice: Number(editValue) } : item
      ));
      setEditingItemId(null);
    }
  };

  const updateMaterialPrice = (index: number, price: number) => {
    const newMaterials = [...materials];
    newMaterials[index].price = price;
    setMaterials(newMaterials);
  };

  const updateLaborPrice = (index: number, rate: number) => {
    const newLabors = [...labors];
    newLabors[index].dailyRate = rate;
    setLabors(newLabors);
  };

  const handleShare = () => {
    const text = `
Proİnşaat Maliyet Özeti
-----------------------
Yapı: ${area}m², ${floors} Kat, ${rooms} Oda
Kalite: ${quality}
Toplam Teklif: ${formatCurrency(results.finalPrice)}
Net Maliyet: ${formatCurrency(results.grandTotal)}
Kâr Marjı: %${profitMargin}
-----------------------
Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}
    `.trim();
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Teklif özeti panoya kopyalandı!');
    });
  };

  const handleDownload = () => {
    const text = `
Proİnşaat Maliyet Teklifi
=========================
Yapı Özellikleri:
- Alan: ${area} m²
- Kat Sayısı: ${floors}
- Oda Sayısı: ${rooms}
- Kalite: ${quality}

Maliyet Kalemleri:
${results.items.map(res => `- ${res.item.name}: ${formatCurrency(res.total)} (${res.item.unitPrice} TL/${res.item.isPerM2 ? 'm²' : 'Adet'})`).join('\n')}

Özet:
- Net Maliyet: ${formatCurrency(results.grandTotal)}
- Kâr Marjı: %${profitMargin} (${formatCurrency(results.profitAmount)})
- Toplam Teklif: ${formatCurrency(results.finalPrice)}

Tarih: ${new Date().toLocaleString('tr-TR')}
    `.trim();
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insaat_teklif_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans pb-20 lg:pb-0">
      {/* Mobile-Style Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight">Proİnşaat</h1>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Maliyet Yönetimi</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={startNewCalculation}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:scale-[1.02] transition-transform font-bold text-sm shadow-lg shadow-black/10"
            >
              <Plus size={18} /> Yeni Hesapla
            </button>
            <button 
              onClick={resetToDefaults}
              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
              title="Sıfırla"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2.5 bg-black/5 rounded-xl hover:bg-black/10 transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button 
              onClick={handleDownload}
              className="p-2.5 bg-black/5 rounded-xl hover:bg-black/10 transition-colors"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-black/5 p-1 rounded-2xl flex gap-1">
          <button 
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'calculator' ? 'bg-white shadow-sm text-black' : 'text-black/40'}`}
          >
            <Calculator size={18} /> <span className="hidden sm:inline">Hesapla</span>
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'database' ? 'bg-white shadow-sm text-black' : 'text-black/40'}`}
          >
            <Database size={18} /> <span className="hidden sm:inline">Birim Fiyat</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-black' : 'text-black/40'}`}
          >
            <History size={18} /> <span className="hidden sm:inline">Geçmiş</span>
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'calculator' ? (
            <motion.div 
              key="calc"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left: Inputs */}
              <div className="lg:col-span-5 space-y-6">
                <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Settings2 className="text-black/40" size={20} />
                      <h2 className="font-bold">Yapı Özellikleri</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Area */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold uppercase text-black/40">İnşaat Alanı</label>
                        <span className="text-sm font-bold">{area} m²</span>
                      </div>
                      <input 
                        type="range" min="50" max="2000" step="10" value={area}
                        onChange={(e) => setArea(Number(e.target.value))}
                        className="w-full accent-black"
                      />
                    </div>

                    {/* Floors & Rooms */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/5 p-4 rounded-2xl">
                        <label className="block text-[10px] font-bold uppercase text-black/40 mb-1">Kat Sayısı</label>
                        <div className="flex items-center justify-between">
                          <button onClick={() => setFloors(Math.max(1, floors - 1))} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><ChevronDown size={16}/></button>
                          <span className="font-bold text-lg">{floors}</span>
                          <button onClick={() => setFloors(floors + 1)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><ChevronUp size={16}/></button>
                        </div>
                      </div>
                      <div className="bg-black/5 p-4 rounded-2xl">
                        <label className="block text-[10px] font-bold uppercase text-black/40 mb-1">Oda Sayısı</label>
                        <div className="flex items-center justify-between">
                          <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><ChevronDown size={16}/></button>
                          <span className="font-bold text-lg">{rooms}</span>
                          <button onClick={() => setRooms(rooms + 1)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><ChevronUp size={16}/></button>
                        </div>
                      </div>
                    </div>

                    {/* Quality */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-black/40 mb-3">İnşaat Kalitesi</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Standart', 'Lüks', 'Premium'] as QualityLevel[]).map(l => (
                          <button 
                            key={l} onClick={() => setQuality(l)}
                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${quality === l ? 'bg-black text-white border-black' : 'bg-white border-black/10 text-black/60'}`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Profit Margin */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold uppercase text-black/40">Kâr Marjı</label>
                        <span className="text-sm font-bold">%{profitMargin}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5" value={profitMargin}
                        onChange={(e) => setProfitMargin(Number(e.target.value))}
                        className="w-full accent-black"
                      />
                    </div>
                  </div>
                </section>

                {/* Total Price Card */}
                <section className="bg-black rounded-[32px] p-8 text-white shadow-2xl shadow-black/20 overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Tahmini Teklif Tutarı</p>
                    <h3 className="text-4xl font-black mb-6 tracking-tight">{formatCurrency(results.finalPrice)}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                      <div>
                        <p className="text-[10px] font-bold text-white/30 uppercase">Net Maliyet</p>
                        <p className="font-bold">{formatCurrency(results.grandTotal)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/30 uppercase">Birim Fiyat</p>
                        <p className="font-bold">{(results.finalPrice / area).toFixed(0)} TL/m²</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                </section>
              </div>

              {/* Right: Details */}
              <div className="lg:col-span-7 space-y-6">
                {/* Chart */}
                <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChartIcon className="text-black/40" size={20} />
                    <h2 className="font-bold">Gider Dağılımı</h2>
                  </div>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Legend verticalAlign="bottom" iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Items List */}
                <section className="bg-white rounded-[32px] shadow-sm border border-black/5 overflow-hidden">
                  <div className="p-6 border-b border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="text-black/40" size={20} />
                      <h2 className="font-bold">Maliyet Kalemleri</h2>
                    </div>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="divide-y divide-black/5 max-h-[500px] overflow-y-auto">
                    {results.items.map((res, idx) => (
                      <div key={res.item.id || idx} className="p-5 flex justify-between items-center group">
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            res.item.category === 'Malzeme' ? 'bg-blue-50 text-blue-600' :
                            res.item.category === 'İşçilik' ? 'bg-orange-50 text-orange-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            {res.item.category === 'Malzeme' ? <Box size={18}/> : <Users size={18}/>}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{res.item.name}</h4>
                            <p className="text-[10px] text-black/40 font-medium uppercase tracking-wider">{res.item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {editingItemId === res.item.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-24 bg-black/5 border-none rounded-lg px-2 py-1 text-right font-bold text-sm outline-none"
                                  autoFocus
                                />
                                <button onClick={saveEdit} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                                  <Save size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group/price">
                                <div>
                                  <p className="font-bold text-sm">{formatCurrency(res.total)}</p>
                                  <p className="text-[10px] text-black/30 font-medium">
                                    {res.item.unitPrice} TL/{res.item.isPerM2 ? 'm²' : 'Adet'}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => startEditing(res.item)}
                                  className="p-1 text-black/20 hover:text-black hover:bg-black/5 rounded-lg opacity-0 group-hover/price:opacity-100 transition-all"
                                >
                                  <Edit3 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          <button onClick={() => removeItem(res.item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : activeTab === 'database' ? (
            <motion.div 
              key="db"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Material Database */}
              <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
                <div className="flex items-center gap-2 mb-6">
                  <Box className="text-black/40" size={20} />
                  <h2 className="font-bold">Güncel Malzeme Fiyatları</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((m, i) => (
                    <div key={i} className="bg-black/5 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{m.name}</p>
                        <p className="text-[10px] text-black/40 font-medium">Birim: {m.unit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right relative">
                          <div className="flex items-center bg-white rounded-xl border border-black/5 focus-within:border-black transition-colors px-3 py-1">
                            <input 
                              type="number" 
                              value={m.price} 
                              onChange={(e) => updateMaterialPrice(i, Number(e.target.value))}
                              className="w-20 border-none text-right font-bold text-sm outline-none bg-transparent"
                            />
                            <span className="text-[10px] font-bold text-black/20 ml-1">TL</span>
                          </div>
                          <p className="text-[10px] text-black/30 font-medium mt-1">~{m.consumptionPerM2} {m.unit}/m²</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Labor Database */}
              <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="text-black/40" size={20} />
                  <h2 className="font-bold">İşçilik Yevmiyeleri</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {labors.map((l, i) => (
                    <div key={i} className="bg-black/5 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{l.trade}</p>
                        <p className="text-[10px] text-black/40 font-medium">Günlük Ücret</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center bg-white rounded-xl border border-black/5 focus-within:border-black transition-colors px-3 py-1">
                          <input 
                            type="number" 
                            value={l.dailyRate} 
                            onChange={(e) => updateLaborPrice(i, Number(e.target.value))}
                            className="w-20 border-none text-right font-bold text-sm outline-none bg-transparent"
                          />
                          <span className="text-[10px] font-bold text-black/20 ml-1">TL</span>
                        </div>
                        <p className="text-[10px] text-black/30 font-medium mt-1">~{l.daysPer100M2} gün / 100m²</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <History className="text-black/40" size={20} />
                    <h2 className="font-bold">Hesaplama Geçmişi</h2>
                  </div>
                  <span className="text-xs font-bold text-black/40">{history.length} Kayıt</span>
                </div>

                {history.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4 text-black/20">
                      <ClipboardList size={32} />
                    </div>
                    <p className="text-black/40 font-bold">Henüz kaydedilmiş bir hesaplama yok.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((h) => (
                      <div key={h.id} className="bg-black/5 p-6 rounded-[24px] group relative">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-black text-lg leading-tight">{h.name}</h3>
                            <div className="flex flex-col gap-0.5 mt-1">
                              {h.clientName && <p className="text-xs font-bold text-black/60">{h.clientName}</p>}
                              {h.location && <p className="text-[10px] font-medium text-black/40">{h.location}</p>}
                              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
                                {new Date(h.date).toLocaleDateString('tr-TR')} {new Date(h.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteFromHistory(h.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-[10px] font-bold text-black/30 uppercase">Alan / Kalite</p>
                            <p className="font-bold text-sm">{h.area}m² / {h.quality}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-black/30 uppercase">Toplam Teklif</p>
                            <p className="font-bold text-sm">{formatCurrency(h.totalPrice)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => loadFromHistory(h)}
                            className="flex-1 bg-white border border-black/10 py-3 rounded-xl font-bold text-sm hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Edit3 size={16} /> Düzenle
                          </button>
                          <button 
                            onClick={() => generatePDF(h)}
                            className="flex-1 bg-black/5 py-3 rounded-xl font-bold text-sm hover:bg-black/10 transition-all flex items-center justify-center gap-2"
                          >
                            <FileText size={16} /> PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Yeni Kalem Ekle</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-black/40 mb-1">Kalem Adı</label>
                  <input 
                    type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Örn: Nakliye, Hafriyat..."
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-black/40 mb-1">Kategori</label>
                    <select 
                      value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as Category})}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 font-bold outline-none"
                    >
                      <option value="Malzeme">Malzeme</option>
                      <option value="İşçilik">İşçilik</option>
                      <option value="Ruhsat/Proje">Ruhsat/Proje</option>
                      <option value="Ek Gider">Ek Gider</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-black/40 mb-1">Birim Fiyat (TL)</label>
                    <input 
                      type="number" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 font-bold outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-black/5 rounded-2xl">
                  <input 
                    type="checkbox" checked={newItem.isPerM2} onChange={e => setNewItem({...newItem, isPerM2: e.target.checked})}
                    className="w-5 h-5 accent-black"
                  />
                  <span className="text-xs font-bold text-black/60">Metrekare bazlı hesapla</span>
                </div>
                <button 
                  onClick={handleAddItem}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-black/20"
                >
                  Listeye Ekle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-6 py-4 flex justify-between items-center z-40">
        <div>
          <p className="text-[10px] font-bold text-black/30 uppercase">Toplam Teklif</p>
          <p className="font-black text-lg">{formatCurrency(results.finalPrice)}</p>
        </div>
        <button 
          onClick={() => setShowSummaryModal(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-black/10"
        >
          Teklif Oluştur
        </button>
      </div>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSummaryModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Teklif Özeti</h2>
                <button onClick={() => setShowSummaryModal(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20}/></button>
              </div>

              <div className="space-y-6">
                <div className="bg-black/5 p-6 rounded-[24px]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-black/30 uppercase">Yapı Alanı</p>
                      <p className="font-bold">{area} m²</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black/30 uppercase">Kalite</p>
                      <p className="font-bold">{quality}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black/30 uppercase">Kat/Oda</p>
                      <p className="font-bold">{floors} Kat / {rooms} Oda</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black/30 uppercase">Kâr Marjı</p>
                      <p className="font-bold">%{profitMargin}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase text-black/40">Maliyet Detayları</h3>
                  <div className="space-y-2">
                    {results.items.map((res, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-black/60">{res.item.name}</span>
                        <span className="font-bold">{formatCurrency(res.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-black/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-black/40">Net Toplam</span>
                    <span className="text-lg font-bold">{formatCurrency(results.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-black/40">Kâr Tutarı</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(results.profitAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-black/5">
                    <span className="text-lg font-black">Genel Toplam</span>
                    <span className="text-2xl font-black">{formatCurrency(results.finalPrice)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 bg-black/5 py-4 rounded-2xl font-bold text-sm hover:bg-black/10 transition-colors"
                  >
                    <Share2 size={18} /> Paylaş
                  </button>
                  <button 
                    onClick={() => generatePDF(results)}
                    className="flex items-center justify-center gap-2 bg-black/5 py-4 rounded-2xl font-bold text-sm hover:bg-black/10 transition-colors"
                  >
                    <FileText size={18} /> PDF
                  </button>
                  <button 
                    onClick={() => {
                      setShowSummaryModal(false);
                      setShowSaveModal(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform"
                  >
                    <Save size={18} /> {editingHistoryId ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Geçmişe Kaydet</h2>
                <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-black/40 mb-1">Kayıt Adı</label>
                  <input 
                    type="text" value={saveName} onChange={e => setSaveName(e.target.value)}
                    placeholder="Örn: Ahmet Bey Villa Teklifi..."
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-black/5"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-black/40 mb-1">Müşteri Adı (Opsiyonel)</label>
                  <input 
                    type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-black/40 mb-1">Konum (Opsiyonel)</label>
                  <input 
                    type="text" value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="Örn: İstanbul, Kadıköy"
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <button 
                  onClick={saveToHistory}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-black/20"
                >
                  {editingHistoryId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-black mb-2">Kaydı Sil</h2>
              <p className="text-black/60 font-medium text-sm mb-8">
                Bu kaydı geçmişten silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 bg-black/5 hover:bg-black/10 text-black font-bold rounded-xl transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                >
                  Evet, Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
