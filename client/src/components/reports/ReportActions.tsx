'use client';

import { useTranslation } from '@/contexts/I18nContext';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportActionsProps {
  reportTitle: string;
  reportData?: unknown;
  onPrint?: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  customPDFGenerator?: () => jsPDF;
  customExcelGenerator?: () => void;
}

export default function ReportActions({
  reportTitle,
  reportData,
  onPrint,
  onExportPDF,
  onExportExcel,
  customPDFGenerator,
  customExcelGenerator
}: ReportActionsProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      if (onExportPDF) {
        onExportPDF();
      } else if (customPDFGenerator) {
        const pdf = customPDFGenerator();
        pdf.save(`${reportTitle}_${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        // Default PDF generation
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Add title
        pdf.setFontSize(18);
        pdf.text(reportTitle, 15, 20);
        
        // Add date
        pdf.setFontSize(10);
        pdf.text(`${t('reports.generatedOn')}: ${new Date().toLocaleString()}`, 15, 30);
        
        // If reportData is provided, try to create a table
        if (reportData && typeof reportData === 'object') {
          const data = Array.isArray(reportData) ? reportData : [reportData];
          if (data.length > 0) {
            const columns = Object.keys(data[0] as object);
            const rows = data.map(item => Object.values(item as object));
            
            autoTable(pdf, {
              head: [columns],
              body: rows,
              startY: 40,
              styles: { font: 'helvetica', fontSize: 9 },
              headStyles: { fillColor: [66, 139, 202] }
            });
          }
        }
        
        pdf.save(`${reportTitle}_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t('reports.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      if (onExportExcel) {
        onExportExcel();
      } else if (customExcelGenerator) {
        customExcelGenerator();
      } else {
        // Default Excel generation
        if (reportData) {
          const data = Array.isArray(reportData) ? reportData : [reportData];
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, reportTitle.substring(0, 31)); // Excel sheet names max 31 chars
          XLSX.writeFile(wb, `${reportTitle}_${new Date().toISOString().split('T')[0]}.xlsx`);
        }
      }
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert(t('reports.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 print:hidden"
        disabled={isExporting}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span>{t('reports.print')}</span>
      </button>

      {/* Export PDF Button */}
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 print:hidden"
        disabled={isExporting}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span>{isExporting ? t('reports.exporting') : t('reports.exportPDF')}</span>
      </button>

      {/* Export Excel Button */}
      <button
        onClick={handleExportExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 print:hidden"
        disabled={isExporting}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{isExporting ? t('reports.exporting') : t('reports.exportExcel')}</span>
      </button>
    </div>
  );
}

