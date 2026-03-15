import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, SavedCalculation, CostItem } from '../types';

// Helper to replace Turkish characters for better PDF compatibility with standard fonts
const cleanTurkishChars = (text: string): string => {
  const charMap: { [key: string]: string } = {
    'İ': 'I', 'ı': 'i', 'Ş': 'S', 'ş': 's', 'Ğ': 'G', 'ğ': 'g', 'Ü': 'U', 'ü': 'u', 'Ö': 'O', 'ö': 'o', 'Ç': 'C', 'ç': 'c'
  };
  return text.split('').map(char => charMap[char] || char).join('');
};

export const generatePDF = (data: CalculationResult | SavedCalculation, title: string = 'Insaat Maliyet Teklifi') => {
  const doc = new jsPDF();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value).replace('₺', 'TL'); // Replace symbol with text for PDF compatibility
  };

  // Title
  doc.setFontSize(20);
  doc.text(cleanTurkishChars('ProInsaat Maliyet Teklifi'), 14, 22);
  
  const name = 'name' in data ? data.name : 'Yeni Teklif';
  const clientName = 'clientName' in data ? data.clientName : '';
  const location = 'location' in data ? data.location : '';

  doc.setFontSize(12);
  doc.text(cleanTurkishChars(`Teklif Adi: ${name}`), 14, 32);
  
  let currentY = 38;
  if (clientName) {
    doc.text(cleanTurkishChars(`Musteri: ${clientName}`), 14, currentY);
    currentY += 6;
  }
  if (location) {
    doc.text(cleanTurkishChars(`Konum: ${location}`), 14, currentY);
    currentY += 6;
  }
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, currentY);

  // Project Details
  doc.setFontSize(14);
  doc.text(cleanTurkishChars('Yapi Ozellikleri'), 14, currentY + 12);
  
  const area = 'totalArea' in data ? data.totalArea : data.area;
  const floors = data.floors;
  const rooms = data.rooms;
  const quality = 'quality' in data ? data.quality : ''; // Quality might not be in CalculationResult

  doc.setFontSize(10);
  doc.text(cleanTurkishChars(`Insaat Alani: ${area} m2`), 14, currentY + 20);
  doc.text(cleanTurkishChars(`Kat Sayisi: ${floors}`), 14, currentY + 26);
  doc.text(cleanTurkishChars(`Oda Sayisi: ${rooms}`), 14, currentY + 32);
  if (quality) {
    doc.text(cleanTurkishChars(`Insaat Kalitesi: ${quality}`), 14, currentY + 38);
  }

  // Items Table
  let tableData: any[] = [];
  let grandTotal = 0;
  let finalPrice = 0;

  if ('items' in data) {
    tableData = data.items.map(res => [
      cleanTurkishChars(res.item.name), 
      cleanTurkishChars(res.item.category), 
      formatCurrency(res.total)
    ]);
    grandTotal = data.grandTotal;
    finalPrice = data.finalPrice;
  } else {
    // Recalculate for SavedCalculation if items are provided
    const floorMultiplier = 1 + (data.floors - 1) * 0.05;
    const roomMultiplier = 1 + (data.rooms * 0.02);
    
    tableData = data.activeItems.map((item: CostItem) => {
      const total = item.isPerM2 
        ? item.unitPrice * data.area * floorMultiplier * roomMultiplier
        : item.unitPrice;
      grandTotal += total;
      return [
        cleanTurkishChars(item.name),
        cleanTurkishChars(item.category),
        formatCurrency(total)
      ];
    });
    
    const profitAmount = (grandTotal * data.profitMargin) / 100;
    finalPrice = grandTotal + profitAmount;
  }

  autoTable(doc, {
    startY: currentY + 45,
    head: [[cleanTurkishChars('Kalem Adi'), 'Kategori', 'Tutar']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [20, 20, 20] },
    styles: { font: 'helvetica', fontSize: 10 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Summary
  doc.setFontSize(14);
  doc.text('Ozet', 14, finalY + 15);
  
  doc.setFontSize(10);
  doc.text(cleanTurkishChars(`Net Maliyet: ${formatCurrency(grandTotal)}`), 14, finalY + 25);
  
  doc.setFontSize(16);
  doc.text(cleanTurkishChars(`Toplam Teklif Tutari: ${formatCurrency(finalPrice)}`), 14, finalY + 35);

  doc.save(`teklif_${new Date().getTime()}.pdf`);
};
