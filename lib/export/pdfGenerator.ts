import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface CompanyInfo {
  name: string;
  npwp: string;
  address: string;
  phone: string;
  email: string;
}

interface ReportData {
  title: string;
  period?: string;
  date?: string;
  data: any[];
  columns: string[];
  totals?: { [key: string]: any };
}

/**
 * Generate company header for PDF reports
 */
export function addCompanyHeader(doc: jsPDF, company: CompanyInfo, y: number = 20): number {
  // Company name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, doc.internal.pageSize.width / 2, y, { align: 'center' });
  
  // NPWP
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`NPWP: ${company.npwp}`, doc.internal.pageSize.width / 2, y + 7, { align: 'center' });
  
  // Address
  doc.setFontSize(9);
  doc.text(company.address || '', doc.internal.pageSize.width / 2, y + 12, { align: 'center' });
  
  // Contact
  doc.text(
    `Tel: ${company.phone} | Email: ${company.email}`,
    doc.internal.pageSize.width / 2,
    y + 17,
    { align: 'center' }
  );
  
  // Separator line
  doc.setLineWidth(0.5);
  doc.line(20, y + 22, doc.internal.pageSize.width - 20, y + 22);
  
  return y + 27; // Return next Y position
}

/**
 * Generate Balance Sheet PDF
 */
export async function generateBalanceSheetPDF(
  company: CompanyInfo,
  report: any,
  fromDate?: string,
  toDate?: string
): Promise<void> {
  const doc = new jsPDF();
  
  // Add company header
  let yPos = addCompanyHeader(doc, company);
  
  // Report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BALANCE SHEET', doc.internal.pageSize.width / 2, yPos + 5, { align: 'center' });
  
  // Report period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const periodText = fromDate && toDate
    ? `From ${format(new Date(fromDate), 'MMM dd, yyyy')} To ${format(new Date(toDate), 'MMM dd, yyyy')}`
    : `As of ${format(new Date(toDate || new Date()), 'MMMM dd, yyyy')}`;
  doc.text(
    periodText,
    doc.internal.pageSize.width / 2,
    yPos + 12,
    { align: 'center' }
  );
  
  yPos += 20;
  
  // ASSETS Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(20, yPos, doc.internal.pageSize.width - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('ASSETS', 22, yPos + 6);
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  // Assets table
  if (report?.assets && report.assets.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Account', 'Balance']],
      body: report.assets.map((item: any) => [
        item.account_name,
        `Rp ${(item.balance || 0).toLocaleString('id-ID')}`
      ]),
      foot: [['Total Assets', `Rp ${(report.total_assets || 0).toLocaleString('id-ID')}`]],
      theme: 'grid',
      headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0] },
      footStyles: { fillColor: [219, 234, 254], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 10 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // LIABILITIES Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(239, 68, 68); // Red
  doc.rect(20, yPos, doc.internal.pageSize.width - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('LIABILITIES', 22, yPos + 6);
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  // Liabilities table
  if (report?.liabilities && report.liabilities.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Account', 'Balance']],
      body: report.liabilities.map((item: any) => [
        item.account_name,
        `Rp ${(item.balance || 0).toLocaleString('id-ID')}`
      ]),
      foot: [['Total Liabilities', `Rp ${(report.total_liabilities || 0).toLocaleString('id-ID')}`]],
      theme: 'grid',
      headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0] },
      footStyles: { fillColor: [254, 226, 226], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 10 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // EQUITY Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(20, yPos, doc.internal.pageSize.width - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('EQUITY', 22, yPos + 6);
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  // Equity table
  if (report?.equity && report.equity.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Account', 'Balance']],
      body: report.equity.map((item: any) => [
        item.account_name,
        `Rp ${(item.balance || 0).toLocaleString('id-ID')}`
      ]),
      foot: [['Total Equity', `Rp ${(report.total_equity || 0).toLocaleString('id-ID')}`]],
      theme: 'grid',
      headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0] },
      footStyles: { fillColor: [220, 252, 231], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 10 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Total Liabilities + Equity
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(31, 41, 55);
  doc.rect(20, yPos, doc.internal.pageSize.width - 40, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL LIABILITIES + EQUITY', 22, yPos + 7);
  doc.text(
    `Rp ${((report?.total_liabilities || 0) + (report?.total_equity || 0)).toLocaleString('id-ID')}`,
    doc.internal.pageSize.width - 22,
    yPos + 7,
    { align: 'right' }
  );
  doc.setTextColor(0, 0, 0);
  
  // Footer
  yPos += 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
    doc.internal.pageSize.width / 2,
    yPos,
    { align: 'center' }
  );
  doc.text('This is a system-generated report', doc.internal.pageSize.width / 2, yPos + 5, { align: 'center' });
  
  // Save PDF
  const filename = fromDate && toDate
    ? `Balance-Sheet-${format(new Date(fromDate), 'yyyy-MM-dd')}_${format(new Date(toDate), 'yyyy-MM-dd')}.pdf`
    : `Balance-Sheet-${format(new Date(toDate || new Date()), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

/**
 * Generate Profit & Loss PDF
 */
export async function generateProfitLossPDF(
  company: CompanyInfo,
  report: any,
  startDate: string,
  endDate: string
): Promise<void> {
  const doc = new jsPDF();
  
  // Add company header
  let yPos = addCompanyHeader(doc, company);
  
  // Report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFIT & LOSS STATEMENT', doc.internal.pageSize.width / 2, yPos + 5, { align: 'center' });
  
  // Report period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Period: ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`,
    doc.internal.pageSize.width / 2,
    yPos + 12,
    { align: 'center' }
  );
  
  yPos += 20;
  
  // REVENUE Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(20, yPos, doc.internal.pageSize.width - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('REVENUE', 22, yPos + 6);
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  // Revenue table
  if (report?.revenue && report.revenue.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Account', 'Amount']],
      body: report.revenue.map((item: any) => [
        item.account_name,
        `Rp ${(item.amount || 0).toLocaleString('id-ID')}`
      ]),
      foot: [['Total Revenue', `Rp ${(report.total_revenue || 0).toLocaleString('id-ID')}`]],
      theme: 'grid',
      headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0] },
      footStyles: { fillColor: [220, 252, 231], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 10 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // EXPENSES Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(239, 68, 68); // Red
  doc.rect(20, yPos, doc.internal.pageSize.width - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('EXPENSES', 22, yPos + 6);
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  // Expenses table
  if (report?.expenses && report.expenses.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Account', 'Amount']],
      body: report.expenses.map((item: any) => [
        item.account_name,
        `Rp ${(item.amount || 0).toLocaleString('id-ID')}`
      ]),
      foot: [['Total Expenses', `Rp ${(report.total_expense || 0).toLocaleString('id-ID')}`]],
      theme: 'grid',
      headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0] },
      footStyles: { fillColor: [254, 226, 226], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 10 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Net Income/Loss
  const netIncome = (report?.total_revenue || 0) - (report?.total_expense || 0);
  const isProfitable = netIncome > 0;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(isProfitable ? 34 : 239, isProfitable ? 197 : 68, isProfitable ? 94 : 68);
  doc.rect(20, yPos, doc.internal.pageSize.width - 40, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(isProfitable ? 'NET PROFIT' : 'NET LOSS', 22, yPos + 7);
  doc.text(
    `Rp ${Math.abs(netIncome).toLocaleString('id-ID')}`,
    doc.internal.pageSize.width - 22,
    yPos + 7,
    { align: 'right' }
  );
  doc.setTextColor(0, 0, 0);
  
  // Performance Indicators
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const netMargin = report?.total_revenue > 0 
    ? ((netIncome / report?.total_revenue) * 100).toFixed(2) 
    : '0.00';
  
  doc.text(`Net Margin: ${netMargin}%`, 22, yPos);
  
  // Footer
  yPos += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
    doc.internal.pageSize.width / 2,
    yPos,
    { align: 'center' }
  );
  doc.text('This is a system-generated report', doc.internal.pageSize.width / 2, yPos + 5, { align: 'center' });
  
  // Save PDF
  doc.save(`Profit-Loss-${format(new Date(startDate), 'yyyy-MM-dd')}_${format(new Date(endDate), 'yyyy-MM-dd')}.pdf`);
}

/**
 * Generate generic table report PDF
 */
export async function generateTableReportPDF(
  company: CompanyInfo,
  reportData: ReportData
): Promise<void> {
  const doc = new jsPDF();
  
  // Add company header
  let yPos = addCompanyHeader(doc, company);
  
  // Report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(reportData.title, doc.internal.pageSize.width / 2, yPos + 5, { align: 'center' });
  
  // Period/Date
  if (reportData.period) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(reportData.period, doc.internal.pageSize.width / 2, yPos + 12, { align: 'center' });
    yPos += 20;
  } else {
    yPos += 15;
  }
  
  // Data table
  if (reportData.data && reportData.data.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [reportData.columns],
      body: reportData.data,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });
  }
  
  // Footer
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
    doc.internal.pageSize.width / 2,
    yPos,
    { align: 'center' }
  );
  
  // Save PDF
  const filename = reportData.title.replace(/\s+/g, '-') + '-' + format(new Date(), 'yyyy-MM-dd') + '.pdf';
  doc.save(filename);
}
