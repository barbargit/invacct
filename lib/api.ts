// API Configuration and Helper Functions

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    profile: `${API_BASE_URL}/auth/profile`,
  },
  // Master Data
  items: `${API_BASE_URL}/items`,
  suppliers: `${API_BASE_URL}/suppliers`,
  customers: `${API_BASE_URL}/customers`,
  warehouses: `${API_BASE_URL}/warehouses`,
  taxes: `${API_BASE_URL}/taxes`,
  itemCategories: `${API_BASE_URL}/item-categories`,
  paymentTerms: `${API_BASE_URL}/payment-terms`,
  
  // Purchase
  purchaseOrders: `${API_BASE_URL}/purchase-orders`,
  goodsReceipts: `${API_BASE_URL}/goods-receipts`,
  purchaseInvoices: `${API_BASE_URL}/purchase-invoices`,
  purchaseReturns: `${API_BASE_URL}/purchase-returns`,
  
  // Sales
  salesOrders: `${API_BASE_URL}/sales-orders`,
  deliveryOrders: `${API_BASE_URL}/delivery-orders`,
  salesInvoices: `${API_BASE_URL}/sales-invoices`,
  salesReturns: `${API_BASE_URL}/sales-returns`,
  
  // Accounting
  coas: `${API_BASE_URL}/coas`,
  journals: `${API_BASE_URL}/journals`,
  ar: `${API_BASE_URL}/ar`,
  ap: `${API_BASE_URL}/ap`,
  payments: `${API_BASE_URL}/payments`,
  
  // Reports
  reports: {
    trialBalance: `${API_BASE_URL}/reports/trial-balance`,
    balanceSheet: `${API_BASE_URL}/reports/balance-sheet`,
    profitLoss: `${API_BASE_URL}/reports/profit-loss`,
    taxInput: `${API_BASE_URL}/reports/tax-input`,
    taxOutput: `${API_BASE_URL}/reports/tax-output`,
  },
  
  // System
  system: {
    stats: `${API_BASE_URL}/system/stats`,
    reset: `${API_BASE_URL}/system/reset`,
  },
  
  // Users
  users: `${API_BASE_URL}/users`,
  userGroups: `${API_BASE_URL}/user-groups`,
  permissions: `${API_BASE_URL}/permissions`,

  // Company
  company: `${API_BASE_URL}/company`,
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
export async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API calls
export const authAPI = {
  login: async (username: string, password: string) => {
    console.log('authAPI.login called with:', { username });
    console.log('API URL:', API_ENDPOINTS.auth.login);
    
    const requestBody = { username, password };
    console.log('Request body:', requestBody);
    console.log('Request body stringified:', JSON.stringify(requestBody));
    
    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.data && data.data.token) {
        console.log('Saving token to localStorage');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error in authAPI:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    return apiCall<any>(API_ENDPOINTS.auth.profile);
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },
};

// Master Data API calls
export const masterAPI = {
  // Items
  getItems: (page = 1, limit = 10, activeOnly = false) => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString(),
      ...(activeOnly && { active_only: 'true' })
    });
    return apiCall<any>(`${API_ENDPOINTS.items}?${params}`);
  },

  getItemById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.items}/${id}`);
  },

  createItem: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.items, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateItem: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.items}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Suppliers
  getSuppliers: (page = 1, limit = 10, activeOnly = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(activeOnly && { active_only: 'true' })
    });
    return apiCall<any>(`${API_ENDPOINTS.suppliers}?${params}`);
  },

  getSuppliersWithOutstanding: (page = 1, limit = 10, activeOnly = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(activeOnly && { active_only: 'true' })
    });
    return apiCall<any>(`${API_ENDPOINTS.suppliers}/with-outstanding?${params}`);
  },

  createSupplier: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.suppliers, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSupplier: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.suppliers}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Customers
  getCustomers: (page = 1, limit = 10, activeOnly = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(activeOnly && { active_only: 'true' })
    });
    return apiCall<any>(`${API_ENDPOINTS.customers}?${params}`);
  },

  getCustomersWithOutstanding: (page = 1, limit = 10, activeOnly = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(activeOnly && { active_only: 'true' })
    });
    return apiCall<any>(`${API_ENDPOINTS.customers}/with-outstanding?${params}`);
  },

  createCustomer: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.customers, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCustomer: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.customers}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Warehouses
  getWarehouses: (page = 1, limit = 10) => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    return apiCall<any>(`${API_ENDPOINTS.warehouses}?${params}`);
  },

  createWarehouse: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.warehouses, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWarehouse: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.warehouses}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteWarehouse: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.warehouses}/${id}`, {
      method: 'DELETE',
    });
  },

  // Item Categories
  getItemCategories: () => {
    return apiCall<any>(API_ENDPOINTS.itemCategories);
  },

  // Payment Terms
  getPaymentTerms: (page = 1, limit = 100, activeOnly = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(activeOnly && { active_only: 'true' })
    });
    return apiCall<any>(`${API_ENDPOINTS.paymentTerms}?${params}`);
  },

  getPaymentTermById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.paymentTerms}/${id}`);
  },

  createPaymentTerm: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.paymentTerms, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePaymentTerm: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.paymentTerms}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePaymentTerm: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.paymentTerms}/${id}`, {
      method: 'DELETE',
    });
  },

  getItemCategoryById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.itemCategories}/${id}`);
  },

  // Purchase/Sales orders helpers
  // Purchase/Sales orders helpers
  getPurchaseOrders: (page = 1, limit = 10, status = '', fromDate?: string, toDate?: string) => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    };
    if (fromDate) paramsObj.from_date = fromDate;
    if (toDate) paramsObj.to_date = toDate;

    const params = new URLSearchParams(paramsObj);
    return apiCall<any>(`${API_ENDPOINTS.purchaseOrders}?${params}`);
  },

  getPurchaseOrderById: (id: number | string) => {
    return apiCall<any>(`${API_ENDPOINTS.purchaseOrders}/${id}`);
  },

  updatePurchaseOrderStatus: (id: number | string, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.purchaseOrders}/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  createPurchaseOrder: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.purchaseOrders, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSalesOrders: (page = 1, limit = 10, status = '', fromDate?: string, toDate?: string) => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    };
    if (fromDate) paramsObj.from_date = fromDate;
    if (toDate) paramsObj.to_date = toDate;

    const params = new URLSearchParams(paramsObj);
    return apiCall<any>(`${API_ENDPOINTS.salesOrders}?${params}`);
  },

  createSalesOrder: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.salesOrders, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Goods Receipts
  getGoodsReceipts: (page = 1, limit = 100, status = '', fromDate?: string, toDate?: string) => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    };
    if (fromDate) paramsObj.from_date = fromDate;
    if (toDate) paramsObj.to_date = toDate;

    const params = new URLSearchParams(paramsObj);
    return apiCall<any>(`${API_ENDPOINTS.goodsReceipts}?${params}`);
  },

  getGoodsReceiptById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.goodsReceipts}/${id}`);
  },

  createGoodsReceipt: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.goodsReceipts, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Purchase Invoices
  getPurchaseInvoices: (page = 1, limit = 100, status = '', fromDate?: string, toDate?: string) => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    };
    if (fromDate) paramsObj.from_date = fromDate;
    if (toDate) paramsObj.to_date = toDate;

    const params = new URLSearchParams(paramsObj);
    return apiCall<any>(`${API_ENDPOINTS.purchaseInvoices}?${params}`);
  },

  getPurchaseInvoiceById: (id: string) => {
    return apiCall<any>(`${API_ENDPOINTS.purchaseInvoices}/${id}`);
  },

  createPurchaseInvoice: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.purchaseInvoices, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Purchase Returns
  getPurchaseReturns: (page = 1, limit = 100, status = '') => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), ...(status && { status }) });
    return apiCall<any>(`${API_ENDPOINTS.purchaseReturns}?${params}`);
  },

  getPurchaseReturnById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.purchaseReturns}/${id}`);
  },

  createPurchaseReturn: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.purchaseReturns, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delivery Orders
  getDeliveryOrders: (page = 1, limit = 100, status = '', fromDate?: string, toDate?: string) => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    };
    if (fromDate) paramsObj.from_date = fromDate;
    if (toDate) paramsObj.to_date = toDate;

    const params = new URLSearchParams(paramsObj);
    return apiCall<any>(`${API_ENDPOINTS.deliveryOrders}?${params}`);
  },

  getDeliveryOrderById: (id: string) => {
    return apiCall<any>(`${API_ENDPOINTS.deliveryOrders}/${id}`);
  },

  createDeliveryOrder: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.deliveryOrders, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Sales Order helpers
  getSalesOrderById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.salesOrders}/${id}`);
  },

  updateSalesOrderStatus: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.salesOrders}/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Sales Invoices
  getSalesInvoices: (page = 1, limit = 100, status = '', fromDate?: string, toDate?: string) => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    };
    if (fromDate) paramsObj.from_date = fromDate;
    if (toDate) paramsObj.to_date = toDate;

    const params = new URLSearchParams(paramsObj);
    return apiCall<any>(`${API_ENDPOINTS.salesInvoices}?${params}`);
  },

  getSalesInvoiceById: (id: string) => {
    return apiCall<any>(`${API_ENDPOINTS.salesInvoices}/${id}`);
  },

  // Sales Returns
  getSalesReturns: (page = 1, limit = 100, status = '') => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), ...(status && { status }) });
    return apiCall<any>(`${API_ENDPOINTS.salesReturns}?${params}`);
  },

  createSalesReturn: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.salesReturns, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },


  createItemCategory: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.itemCategories, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateItemCategory: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.itemCategories}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteItemCategory: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.itemCategories}/${id}`, {
      method: 'DELETE',
    });
  },

  // Taxes
  getTaxes: (activeOnly = false) => {
    const params = activeOnly ? '?active_only=true' : '';
    return apiCall<any>(`${API_ENDPOINTS.taxes}${params}`);
  },

  getActiveTax: (date: string) => {
    return apiCall<any>(`${API_ENDPOINTS.taxes}/active?date=${date}`);
  },
};

// System API calls
export const systemAPI = {
  getStats: () => {
    return apiCall<any>(API_ENDPOINTS.system.stats);
  },

  resetData: () => {
    return apiCall<any>(API_ENDPOINTS.system.reset, {
      method: 'DELETE',
    });
  },
};

// Accounting API calls
export const accountingAPI = {
  // COA
  getCOAs: (page = 1, limit = 10, activeOnly = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(activeOnly && { active_only: 'true' })
    });
    return apiCall<any>(`${API_ENDPOINTS.coas}?${params}`);
  },

  getCOAById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.coas}/${id}`);
  },

  createCOA: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.coas, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCOA: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.coas}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Journals
  getJournals: (page = 1, limit = 10, fromDate?: string, toDate?: string) => {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString()
    };
    if (fromDate) paramsObj.from_date = fromDate;
    if (toDate) paramsObj.to_date = toDate;

    const params = new URLSearchParams(paramsObj);
    return apiCall<any>(`${API_ENDPOINTS.journals}?${params}`);
  },

  getJournalById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.journals}/${id}`);
  },

  createJournal: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.journals, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // AR
  getARs: (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return apiCall<any>(`${API_ENDPOINTS.ar}?${params}`);
  },

  getARById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.ar}/${id}`);
  },

  // AP
  getAPs: (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return apiCall<any>(`${API_ENDPOINTS.ap}?${params}`);
  },

  getAPById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.ap}/${id}`);
  },

  // Payments
  getPayments: (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return apiCall<any>(`${API_ENDPOINTS.payments}?${params}`);
  },

  createPayment: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.payments, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reports
  getTrialBalance: () => {
    return apiCall<any>(API_ENDPOINTS.reports.trialBalance);
  },

  getBalanceSheet: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    return apiCall<any>(`${API_ENDPOINTS.reports.balanceSheet}?${params}`);
  },

  getProfitLoss: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return apiCall<any>(`${API_ENDPOINTS.reports.profitLoss}?${params}`);
  },

  getTaxInput: (startDate: string, endDate: string) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    return apiCall<any>(`${API_ENDPOINTS.reports.taxInput}?${params}`);
  },

  getTaxOutput: (startDate: string, endDate: string) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    return apiCall<any>(`${API_ENDPOINTS.reports.taxOutput}?${params}`);
  },
};

// User API calls
export const userAPI = {
  getUserMenu: () => {
    return apiCall<any>(`${API_BASE_URL}/user/menu`);
  },
  getUsers: (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return apiCall<any>(`${API_ENDPOINTS.users}?${params}`);
  },

  getUserById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.users}/${id}`);
  },

  createUser: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.users, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.users}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getUserGroups: () => {
    return apiCall<any>(API_ENDPOINTS.userGroups);
  },

  getUserGroupById: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.userGroups}/${id}`);
  },

  createUserGroup: (data: any) => {
    return apiCall<any>(API_ENDPOINTS.userGroups, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUserGroup: (id: number, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.userGroups}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUserGroup: (id: number) => {
    return apiCall<any>(`${API_ENDPOINTS.userGroups}/${id}`, {
      method: 'DELETE',
    });
  },

  // Permissions
  getPermissions: () => {
    return apiCall<any>(API_ENDPOINTS.permissions);
  },

  checkPermission: (resource: string, action: string) => {
    return apiCall<any>(`${API_ENDPOINTS.permissions}/check?resource=${resource}&action=${action}`);
  },

  // Roles
  getRoles: () => {
    return apiCall<any>(`${API_BASE_URL}/roles`);
  },

  // Get roles with permissions and modules
  getRolesWithPermissions: () => {
    return apiCall<any>(`${API_BASE_URL}/roles/with-permissions`);
  },

  getRoleById: (id: number) => {
    return apiCall<any>(`${API_BASE_URL}/roles/${id}`);
  },

  createRole: (data: any) => {
    return apiCall<any>(`${API_BASE_URL}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRole: (id: number, data: any) => {
    return apiCall<any>(`${API_BASE_URL}/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRole: (id: number) => {
    return apiCall<any>(`${API_BASE_URL}/roles/${id}`, {
      method: 'DELETE',
    });
  },

  // Role Permissions
  getRolePermissions: (roleId: number) => {
    return apiCall<any>(`${API_BASE_URL}/role-permissions?role_id=${roleId}`);
  },

  getRolePermissionById: (id: number) => {
    return apiCall<any>(`${API_BASE_URL}/role-permissions/${id}`);
  },

  createRolePermission: (data: any) => {
    return apiCall<any>(`${API_BASE_URL}/role-permissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRolePermission: (id: number, data: any) => {
    return apiCall<any>(`${API_BASE_URL}/role-permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRolePermission: (id: number) => {
    return apiCall<any>(`${API_BASE_URL}/role-permissions/${id}`, {
      method: 'DELETE',
    });
  },

  // Modules
  getModules: () => {
    return apiCall<any>(`${API_BASE_URL}/modules`);
  },
};

// Company API calls
export const companyAPI = {
  getCompany: () => {
    return apiCall<any>(API_ENDPOINTS.company);
  },

  getCompanyById: (id: string) => {
    return apiCall<any>(`${API_ENDPOINTS.company}/${id}`);
  },

  updateCompany: (id: string, data: any) => {
    return apiCall<any>(`${API_ENDPOINTS.company}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
