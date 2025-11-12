import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface CompanyInfo {
  name: string;
  npwp: string;
  address: string;
  phone: string;
  email: string;
}

/**
 * Generate Balance Sheet Excel
 */
export async function generateBalanceSheetExcel(
  company: CompanyInfo,
  report: any,
  fromDate?: string,
  toDate?: string
): Promise<void> {
  const wb = XLSX.utils.book_new();
  
  // Create worksheet data
  const wsData: any[][] = [];
  
  // Company header
  wsData.push([company.name]);
  wsData.push([`NPWP: ${company.npwp}`]);
  wsData.push([company.address]);
  wsData.push([`Tel: ${company.phone} | Email: ${company.email}`]);
  wsData.push([]);
  wsData.push(['BALANCE SHEET']);
  const periodText = fromDate && toDate
    ? `From ${format(new Date(fromDate), 'MMM dd, yyyy')} To ${format(new Date(toDate), 'MMM dd, yyyy')}`
    : `As of ${format(new Date(toDate || new Date()), 'MMMM dd, yyyy')}`;
  wsData.push([periodText]);
  wsData.push([]);
  
  // ASSETS
  wsData.push(['ASSETS']);
  wsData.push(['Account', 'Balance']);
  if (report?.assets && report.assets.length > 0) {
    report.assets.forEach((item: any) => {
      wsData.push([item.account_name, item.balance || 0]);
    });
  }
  wsData.push(['Total Assets', report?.total_assets || 0]);
  wsData.push([]);
  
  // LIABILITIES
  wsData.push(['LIABILITIES']);
  wsData.push(['Account', 'Balance']);
  if (report?.liabilities && report.liabilities.length > 0) {
    report.liabilities.forEach((item: any) => {
      wsData.push([item.account_name, item.balance || 0]);
    });
  }
  wsData.push(['Total Liabilities', report?.total_liabilities || 0]);
  wsData.push([]);
  
  // EQUITY
  wsData.push(['EQUITY']);
  wsData.push(['Account', 'Balance']);
  if (report?.equity && report.equity.length > 0) {
    report.equity.forEach((item: any) => {
      wsData.push([item.account_name, item.balance || 0]);
    });
  }
  wsData.push(['Total Equity', report?.total_equity || 0]);
  wsData.push([]);
  
  // TOTAL
  wsData.push(['TOTAL LIABILITIES + EQUITY', (report?.total_liabilities || 0) + (report?.total_equity || 0)]);
  wsData.push([]);
  
  // Balance check
  const isBalanced = report?.total_assets === (report?.total_liabilities || 0) + (report?.total_equity || 0);
  wsData.push(['Balance Check', isBalanced ? 'BALANCED' : 'UNBALANCED']);
  wsData.push([]);
  wsData.push([`Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 40 },  // Account column
    { wch: 20 },  // Balance column
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const filename = fromDate && toDate
    ? `Balance-Sheet-${format(new Date(fromDate), 'yyyy-MM-dd')}_${format(new Date(toDate), 'yyyy-MM-dd')}.xlsx`
    : `Balance-Sheet-${format(new Date(toDate || new Date()), 'yyyy-MM-dd')}.xlsx`;
  saveAs(blob, filename);
}

/**
 * Generate Profit & Loss Excel
 */
export async function generateProfitLossExcel(
  company: CompanyInfo,
  report: any,
  startDate: string,
  endDate: string
): Promise<void> {
  const wb = XLSX.utils.book_new();
  
  // Create worksheet data
  const wsData: any[][] = [];
  
  // Company header
  wsData.push([company.name]);
  wsData.push([`NPWP: ${company.npwp}`]);
  wsData.push([company.address]);
  wsData.push([`Tel: ${company.phone} | Email: ${company.email}`]);
  wsData.push([]);
  wsData.push(['PROFIT & LOSS STATEMENT']);
  wsData.push([`Period: ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`]);
  wsData.push([]);
  
  // REVENUE
  wsData.push(['REVENUE']);
  wsData.push(['Account', 'Amount']);
  if (report?.revenue && report.revenue.length > 0) {
    report.revenue.forEach((item: any) => {
      wsData.push([item.account_name, item.amount || 0]);
    });
  }
  wsData.push(['Total Revenue', report?.total_revenue || 0]);
  wsData.push([]);
  
  // EXPENSES
  wsData.push(['EXPENSES']);
  wsData.push(['Account', 'Amount']);
  if (report?.expenses && report.expenses.length > 0) {
    report.expenses.forEach((item: any) => {
      wsData.push([item.account_name, item.amount || 0]);
    });
  }
  wsData.push(['Total Expenses', report?.total_expense || 0]);
  wsData.push([]);
  
  // NET INCOME
  const netIncome = (report?.total_revenue || 0) - (report?.total_expense || 0);
  const isProfitable = netIncome > 0;
  wsData.push([isProfitable ? 'NET PROFIT' : 'NET LOSS', Math.abs(netIncome)]);
  wsData.push([]);
  
  // Performance indicators
  const netMargin = report?.total_revenue > 0 
    ? ((netIncome / report?.total_revenue) * 100).toFixed(2) 
    : '0.00';
  wsData.push(['Net Margin', `${netMargin}%`]);
  wsData.push([]);
  wsData.push([`Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 40 },  // Account column
    { wch: 20 },  // Amount column
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Profit & Loss');
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `Profit-Loss-${format(new Date(startDate), 'yyyy-MM-dd')}_${format(new Date(endDate), 'yyyy-MM-dd')}.xlsx`);
}

/**
 * Generate Chart of Accounts Excel
 */
export async function generateCOAExcel(
  company: CompanyInfo,
  accounts: any[]
): Promise<void> {
  const wb = XLSX.utils.book_new();
  
  // Create worksheet data
  const wsData: any[][] = [];
  
  // Company header
  wsData.push([company.name]);
  wsData.push([`NPWP: ${company.npwp}`]);
  wsData.push([]);
  wsData.push(['CHART OF ACCOUNTS']);
  wsData.push([`As of ${format(new Date(), 'MMMM dd, yyyy')}`]);
  wsData.push([]);
  
  // Headers
  wsData.push(['Code', 'Account Name', 'Type', 'Group', 'Normal Balance', 'Balance']);
  
  // Data
  if (accounts && accounts.length > 0) {
    accounts.forEach((account: any) => {
      wsData.push([
        account.code,
        account.name,
        account.account_type,
        account.account_group || '',
        account.normal_balance,
        account.balance || 0
      ]);
    });
  }
  
  wsData.push([]);
  wsData.push([`Total Accounts: ${accounts.length}`]);
  wsData.push([]);
  wsData.push([`Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 10 },  // Code
    { wch: 35 },  // Name
    { wch: 15 },  // Type
    { wch: 20 },  // Group
    { wch: 15 },  // Normal Balance
    { wch: 20 },  // Balance
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Chart of Accounts');
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `Chart-of-Accounts-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

/**
 * Generate Journal Entries Excel
 */
export async function generateJournalsExcel(
  company: CompanyInfo,
  journals: any[]
): Promise<void> {
  const wb = XLSX.utils.book_new();
  
  // Create worksheet data
  const wsData: any[][] = [];
  
  // Company header
  wsData.push([company.name]);
  wsData.push([`NPWP: ${company.npwp}`]);
  wsData.push([]);
  wsData.push(['JOURNAL ENTRIES']);
  wsData.push([`As of ${format(new Date(), 'MMMM dd, yyyy')}`]);
  wsData.push([]);
  
  // Headers
  wsData.push(['Date', 'Journal No', 'Description', 'Type', 'Total Debit', 'Total Credit', 'Status']);
  
  // Data
  if (journals && journals.length > 0) {
    journals.forEach((journal: any) => {
      wsData.push([
        format(new Date(journal.journal_date), 'MMM dd, yyyy'),
        journal.journal_no || '',
        journal.description || '',
        journal.journal_type || 'auto',
        journal.total_debit || 0,
        journal.total_credit || 0,
        journal.total_debit === journal.total_credit ? 'Balanced' : 'Unbalanced'
      ]);
    });
  }
  
  // Totals
  const totalDebit = journals.reduce((sum, j) => sum + (j.total_debit || 0), 0);
  const totalCredit = journals.reduce((sum, j) => sum + (j.total_credit || 0), 0);
  
  wsData.push([]);
  wsData.push(['Total', '', '', '', totalDebit, totalCredit, '']);
  wsData.push([]);
  wsData.push([`Total Entries: ${journals.length}`]);
  wsData.push([]);
  wsData.push([`Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Date
    { wch: 15 },  // Journal No
    { wch: 35 },  // Description
    { wch: 12 },  // Type
    { wch: 18 },  // Total Debit
    { wch: 18 },  // Total Credit
    { wch: 12 },  // Status
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Journal Entries');
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `Journal-Entries-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

/**
 * Generate Accounts Receivable Excel
 */
export async function generateARExcel(
  company: CompanyInfo,
  arData: any[]
): Promise<void> {
  const wb = XLSX.utils.book_new();
  
  // Create worksheet data
  const wsData: any[][] = [];
  
  // Company header
  wsData.push([company.name]);
  wsData.push([`NPWP: ${company.npwp}`]);
  wsData.push([]);
  wsData.push(['ACCOUNTS RECEIVABLE']);
  wsData.push([`As of ${format(new Date(), 'MMMM dd, yyyy')}`]);
  wsData.push([]);
  
  // Headers
  wsData.push(['Invoice Date', 'Invoice No', 'Customer', 'Due Date', 'Amount', 'Paid', 'Balance', 'Status']);
  
  // Data
  if (arData && arData.length > 0) {
    arData.forEach((ar: any) => {
      wsData.push([
        format(new Date(ar.invoice_date), 'MMM dd, yyyy'),
        ar.invoice_no || '',
        ar.customer_name || '',
        ar.due_date ? format(new Date(ar.due_date), 'MMM dd, yyyy') : '',
        ar.amount || 0,
        ar.paid_amount || 0,
        ar.balance || 0,
        ar.status || 'unpaid'
      ]);
    });
  }
  
  // Totals
  const totalAmount = arData.reduce((sum, ar) => sum + (ar.amount || 0), 0);
  const totalPaid = arData.reduce((sum, ar) => sum + (ar.paid_amount || 0), 0);
  const totalBalance = arData.reduce((sum, ar) => sum + (ar.balance || 0), 0);
  
  wsData.push([]);
  wsData.push(['Total', '', '', '', totalAmount, totalPaid, totalBalance, '']);
  wsData.push([]);
  wsData.push([`Total Invoices: ${arData.length}`]);
  wsData.push([]);
  wsData.push([`Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Invoice Date
    { wch: 15 },  // Invoice No
    { wch: 25 },  // Customer
    { wch: 12 },  // Due Date
    { wch: 18 },  // Amount
    { wch: 18 },  // Paid
    { wch: 18 },  // Balance
    { wch: 12 },  // Status
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Accounts Receivable');
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `Accounts-Receivable-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

/**
 * Generate Stock Report Excel
 */
export async function generateStockReportExcel(
  company: CompanyInfo,
  items: any[],
  filters: any
): Promise<void> {
  const wb = XLSX.utils.book_new();

  // Create worksheet data
  const wsData: any[][] = [];

  // Company header
  wsData.push([company.name]);
  wsData.push([`NPWP: ${company.npwp}`]);
  wsData.push([]);
  wsData.push(['STOCK REPORT']);
  wsData.push([`As of ${format(new Date(), 'MMMM dd, yyyy')}`]);
  wsData.push([]);

  // Filters info
  const filterInfo = [];
  if (filters.warehouse) filterInfo.push(`Warehouse: ${filters.warehouse}`);
  if (filters.category) filterInfo.push(`Category: ${filters.category}`);
  if (filters.lowStockOnly) filterInfo.push('Low Stock Only');
  if (filterInfo.length > 0) {
    wsData.push([`Filters: ${filterInfo.join(', ')}`]);
  }
  wsData.push([]);

  // Headers
  wsData.push(['Item Code', 'Item Name', 'Category', 'Warehouse', 'Unit', 'Current Stock', 'Min Stock', 'Status', 'Location']);

  // Data
  if (items && items.length > 0) {
    items.forEach((item: any) => {
      const status = item.current_stock === 0 ? 'Out of Stock' :
                    (item.min_stock && item.current_stock <= item.min_stock) ? 'Low Stock' : 'In Stock';

      wsData.push([
        item.code,
        item.name,
        item.category || '-',
        item.warehouse_name || '-',
        item.unit,
        item.current_stock,
        item.min_stock || '-',
        status,
        item.location || '-'
      ]);
    });
  }

  // Summary
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.min_stock && item.current_stock <= item.min_stock).length;
  const outOfStockItems = items.filter(item => item.current_stock === 0).length;

  wsData.push([]);
  wsData.push(['Summary']);
  wsData.push(['Total Items', totalItems]);
  wsData.push(['Low Stock Items', lowStockItems]);
  wsData.push(['Out of Stock Items', outOfStockItems]);
  wsData.push([]);
  wsData.push([`Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Item Code
    { wch: 30 },  // Item Name
    { wch: 15 },  // Category
    { wch: 20 },  // Warehouse
    { wch: 8 },   // Unit
    { wch: 15 },  // Current Stock
    { wch: 10 },  // Min Stock
    { wch: 12 },  // Status
    { wch: 15 },  // Location
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Report');

  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `Stock-Report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

/**
 * Generate Accounts Payable Excel
 */
export async function generateAPExcel(
  company: CompanyInfo,
  apData: any[]
): Promise<void> {
  const wb = XLSX.utils.book_new();
  
  // Create worksheet data
  const wsData: any[][] = [];
  
  // Company header
  wsData.push([company.name]);
  wsData.push([`NPWP: ${company.npwp}`]);
  wsData.push([]);
  wsData.push(['ACCOUNTS PAYABLE']);
  wsData.push([`As of ${format(new Date(), 'MMMM dd, yyyy')}`]);
  wsData.push([]);
  
  // Headers
  wsData.push(['Invoice Date', 'Invoice No', 'Supplier', 'Due Date', 'Amount', 'Paid', 'Balance', 'Status']);
  
  // Data
  if (apData && apData.length > 0) {
    apData.forEach((ap: any) => {
      wsData.push([
        format(new Date(ap.invoice_date), 'MMM dd, yyyy'),
        ap.invoice_no || '',
        ap.supplier_name || '',
        ap.due_date ? format(new Date(ap.due_date), 'MMM dd, yyyy') : '',
        ap.amount || 0,
        ap.paid_amount || 0,
        ap.balance || 0,
        ap.status || 'unpaid'
      ]);
    });
  }
  
  // Totals
  const totalAmount = apData.reduce((sum, ap) => sum + (ap.amount || 0), 0);
  const totalPaid = apData.reduce((sum, ap) => sum + (ap.paid_amount || 0), 0);
  const totalBalance = apData.reduce((sum, ap) => sum + (ap.balance || 0), 0);
  
  wsData.push([]);
  wsData.push(['Total', '', '', '', totalAmount, totalPaid, totalBalance, '']);
  wsData.push([]);
  wsData.push([`Total Invoices: ${apData.length}`]);
  wsData.push([]);
  wsData.push([`Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Invoice Date
    { wch: 15 },  // Invoice No
    { wch: 25 },  // Supplier
    { wch: 12 },  // Due Date
    { wch: 18 },  // Amount
    { wch: 18 },  // Paid
    { wch: 18 },  // Balance
    { wch: 12 },  // Status
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Accounts Payable');
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `Accounts-Payable-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
