import { z } from 'zod';
import httpClient from '@/shared/api/http';
import { parseApiResponse, parsePageResponse, type PageResponse } from '@/shared/api/types';

// ═══════════════════════════════════════════════════════════════
// ADMIN SCHEMAS
// ═══════════════════════════════════════════════════════════════

// Role Schemas
export const RoleSchema = z.object({
  id: z.number().int().positive().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional().nullable(),
});

export type Role = z.infer<typeof RoleSchema>;

// User Schemas
export const AdminUserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  username: z.string(),
  roles: z.array(RoleSchema).optional(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export const AdminUserListParamsSchema = z.object({
  keyword: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).default(20),
});

export type AdminUserListParams = z.infer<typeof AdminUserListParamsSchema>;

export const AdminUserCreateRequestSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type AdminUserCreateRequest = z.infer<typeof AdminUserCreateRequestSchema>;

export const AdminUserStatusUpdateSchema = z.object({
  status: z.string().min(1, 'Status is required'),
});

export type AdminUserStatusUpdate = z.infer<typeof AdminUserStatusUpdateSchema>;

export const AdminUserRolesUpdateSchema = z.object({
  roles: z.array(z.string()),
});

export type AdminUserRolesUpdate = z.infer<typeof AdminUserRolesUpdateSchema>;

export const RoleCreateRequestSchema = z.object({
  code: z.string().min(1, 'Role code is required'),
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
});

export type RoleCreateRequest = z.infer<typeof RoleCreateRequestSchema>;

// Document Schemas (Admin CRUD)
export const DocumentSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  content: z.string().optional().nullable(),
});

export type Document = z.infer<typeof DocumentSchema>;

export const DocumentCreateRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
});

export type DocumentCreateRequest = z.infer<typeof DocumentCreateRequestSchema>;

// User Summary Report
export const UserSummarySchema = z.object({
  totalUsers: z.number().int(),
  activeUsers: z.number().int(),
  lockedUsers: z.number().int(),
});

export type UserSummary = z.infer<typeof UserSummarySchema>;

// ═══════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════

export const adminKeys = {
  // Farmers
  farmers: ['admin', 'farmers'] as const,
  farmerList: (params?: AdminUserListParams) => [...adminKeys.farmers, 'list', params] as const,
  farmerDetail: (id: number) => [...adminKeys.farmers, 'detail', id] as const,
  // Buyers
  buyers: ['admin', 'buyers'] as const,
  buyerList: (params?: AdminUserListParams) => [...adminKeys.buyers, 'list', params] as const,
  // Roles
  roles: ['admin', 'roles'] as const,
  roleList: () => [...adminKeys.roles, 'list'] as const,
  // Documents
  documents: ['admin', 'documents'] as const,
  documentList: () => [...adminKeys.documents, 'list'] as const,
  // Summary
  summary: ['admin', 'summary'] as const,
};

// ═══════════════════════════════════════════════════════════════
// FARMER MANAGEMENT API
// ═══════════════════════════════════════════════════════════════

export const adminFarmerApi = {
  /** GET /api/v1/admin/users/farmers - Search farmers */
  list: async (params?: AdminUserListParams): Promise<PageResponse<AdminUser>> => {
    const validatedParams = params ? AdminUserListParamsSchema.parse(params) : undefined;
    const response = await httpClient.get('/api/v1/admin/users/farmers', { params: validatedParams });
    return parsePageResponse(response.data, AdminUserSchema);
  },

  /** GET /api/v1/admin/users/farmers/{id} - Get farmer detail */
  getById: async (id: number): Promise<AdminUser> => {
    const response = await httpClient.get(`/api/v1/admin/users/farmers/${id}`);
    return parseApiResponse(response.data, AdminUserSchema);
  },

  /** POST /api/v1/admin/users/farmers - Create farmer account */
  create: async (data: AdminUserCreateRequest): Promise<AdminUser> => {
    const validatedPayload = AdminUserCreateRequestSchema.parse(data);
    const response = await httpClient.post('/api/v1/admin/users/farmers', validatedPayload);
    return parseApiResponse(response.data, AdminUserSchema);
  },

  /** PATCH /api/v1/admin/users/farmers/{id}/status - Update farmer status */
  updateStatus: async (id: number, data: AdminUserStatusUpdate): Promise<AdminUser> => {
    const validatedPayload = AdminUserStatusUpdateSchema.parse(data);
    const response = await httpClient.patch(`/api/v1/admin/users/farmers/${id}/status`, validatedPayload);
    return parseApiResponse(response.data, AdminUserSchema);
  },

  /** PUT /api/v1/admin/users/farmers/{id}/roles - Update farmer roles */
  updateRoles: async (id: number, data: AdminUserRolesUpdate): Promise<AdminUser> => {
    const validatedPayload = AdminUserRolesUpdateSchema.parse(data);
    const response = await httpClient.put(`/api/v1/admin/users/farmers/${id}/roles`, validatedPayload);
    return parseApiResponse(response.data, AdminUserSchema);
  },

  /** DELETE /api/v1/admin/users/farmers/{id} - Delete farmer */
  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/v1/admin/users/farmers/${id}`);
  },
};

// ═══════════════════════════════════════════════════════════════
// BUYER MANAGEMENT API
// ═══════════════════════════════════════════════════════════════

export const adminBuyerApi = {
  /** GET /api/v1/admin/users/buyers - Search buyers */
  list: async (params?: AdminUserListParams): Promise<PageResponse<AdminUser>> => {
    const validatedParams = params ? AdminUserListParamsSchema.parse(params) : undefined;
    const response = await httpClient.get('/api/v1/admin/users/buyers', { params: validatedParams });
    return parsePageResponse(response.data, AdminUserSchema);
  },
};

// ═══════════════════════════════════════════════════════════════
// ROLE MANAGEMENT API
// ═══════════════════════════════════════════════════════════════

export const adminRoleApi = {
  /** GET /api/v1/admin/roles - List all roles */
  list: async (): Promise<Role[]> => {
    const response = await httpClient.get('/api/v1/admin/roles');
    return parseApiResponse(response.data, z.array(RoleSchema));
  },

  /** POST /api/v1/admin/roles - Create role */
  create: async (data: RoleCreateRequest): Promise<Role> => {
    const validatedPayload = RoleCreateRequestSchema.parse(data);
    const response = await httpClient.post('/api/v1/admin/roles', validatedPayload);
    return parseApiResponse(response.data, RoleSchema);
  },

  /** DELETE /api/v1/admin/roles/{roleCode} - Delete role */
  delete: async (roleCode: string): Promise<void> => {
    await httpClient.delete(`/api/v1/admin/roles/${roleCode}`);
  },
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENT MANAGEMENT API (Admin CRUD)
// ═══════════════════════════════════════════════════════════════

export const adminDocumentApi = {
  /** GET /api/v1/documents - List documents (also available to farmers) */
  list: async (): Promise<Document[]> => {
    const response = await httpClient.get('/api/v1/documents');
    return parseApiResponse(response.data, z.array(DocumentSchema));
  },

  /** POST /api/v1/admin/documents - Create document */
  create: async (data: DocumentCreateRequest): Promise<Document> => {
    const validatedPayload = DocumentCreateRequestSchema.parse(data);
    const response = await httpClient.post('/api/v1/admin/documents', validatedPayload);
    return parseApiResponse(response.data, DocumentSchema);
  },

  /** PUT /api/v1/admin/documents/{id} - Update document */
  update: async (id: number, data: DocumentCreateRequest): Promise<Document> => {
    const validatedPayload = DocumentCreateRequestSchema.parse(data);
    const response = await httpClient.put(`/api/v1/admin/documents/${id}`, validatedPayload);
    return parseApiResponse(response.data, DocumentSchema);
  },

  /** DELETE /api/v1/admin/documents/{id} - Delete document */
  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/v1/admin/documents/${id}`);
  },
};

// ═══════════════════════════════════════════════════════════════
// USER SUMMARY REPORT API
// ═══════════════════════════════════════════════════════════════

export const adminSummaryApi = {
  /** GET /api/v1/admin/reports/users/summary - Get user summary report */
  getSummary: async (): Promise<UserSummary> => {
    const response = await httpClient.get('/api/v1/admin/reports/users/summary');
    return parseApiResponse(response.data, UserSummarySchema);
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD API
// ═══════════════════════════════════════════════════════════════

export const AdminDashboardSummarySchema = z.object({
  summary: z.object({
    totalUsers: z.number(),
    totalFarms: z.number(),
    activeSeasonsCount: z.number(),
    openIncidentsCount: z.number(),
    expensesThisMonth: z.number(),
    harvestThisMonth: z.number(),
  }),
  latestItems: z.object({
    latestIncidents: z.array(z.any()),
    latestSeasons: z.array(z.any()),
    latestMovements: z.array(z.any()),
  }),
});

export type AdminDashboardSummary = z.infer<typeof AdminDashboardSummarySchema>;

export const adminDashboardApi = {
  /** GET /api/v1/admin/dashboard/summary - Get admin dashboard summary */
  getSummary: async (): Promise<AdminDashboardSummary> => {
    const response = await httpClient.get('/api/v1/admin/dashboard/summary');
    return parseApiResponse(response.data, AdminDashboardSummarySchema);
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN FARMS API
// ═══════════════════════════════════════════════════════════════

export const AdminFarmSchema = z.object({
  id: z.number(),
  name: z.string(),
  area: z.number().nullable(),
  active: z.boolean(),
  ownerUsername: z.string().nullable(),
  provinceName: z.string().nullable(),
  wardName: z.string().nullable(),
});

export type AdminFarm = z.infer<typeof AdminFarmSchema>;

export const adminFarmApi = {
  /** GET /api/v1/admin/farms - List all farms */
  list: async (params?: { keyword?: string; active?: boolean; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/farms', { params });
    return response.data;
  },

  /** GET /api/v1/admin/farms/{id} - Get farm detail */
  getById: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/farms/${id}`);
    return parseApiResponse(response.data, AdminFarmSchema);
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN SEASONS API
// ═══════════════════════════════════════════════════════════════

export const adminSeasonApi = {
  /** GET /api/v1/admin/seasons - List all seasons */
  list: async (params?: { status?: string; cropId?: number; plotId?: number; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/seasons', { params });
    return response.data;
  },

  /** GET /api/v1/admin/seasons/{id} - Get season detail */
  getById: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/seasons/${id}`);
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN INCIDENTS API
// ═══════════════════════════════════════════════════════════════

export const adminIncidentApi = {
  /** GET /api/v1/admin/incidents - List all incidents */
  list: async (params?: { status?: string; severity?: string; type?: string; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/incidents', { params });
    return response.data;
  },

  /** GET /api/v1/admin/incidents/{id} - Get incident detail */
  getById: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/incidents/${id}`);
    return response.data;
  },

  /** PATCH /api/v1/admin/incidents/{id}/status - Update incident status */
  updateStatus: async (id: number, status: string) => {
    const response = await httpClient.patch(`/api/v1/admin/incidents/${id}/status`, { status });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN REPORTS API
// ═══════════════════════════════════════════════════════════════

export const adminReportsApi = {
  /** GET /api/v1/admin/reports/expenses-by-month */
  getExpensesByMonth: async (year?: number) => {
    const response = await httpClient.get('/api/v1/admin/reports/expenses-by-month', { params: { year } });
    return response.data;
  },

  /** GET /api/v1/admin/reports/harvest-by-season */
  getHarvestBySeason: async () => {
    const response = await httpClient.get('/api/v1/admin/reports/harvest-by-season');
    return response.data;
  },

  /** GET /api/v1/admin/reports/incidents-summary */
  getIncidentsSummary: async () => {
    const response = await httpClient.get('/api/v1/admin/reports/incidents-summary');
    return response.data;
  },

  /** GET /api/v1/admin/reports/inventory-movements */
  getInventoryMovements: async (year?: number) => {
    const response = await httpClient.get('/api/v1/admin/reports/inventory-movements', { params: { year } });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN CROPS API
// ═══════════════════════════════════════════════════════════════

export const adminCropApi = {
  /** GET /api/v1/admin/crops - List all crops */
  list: async () => {
    const response = await httpClient.get('/api/v1/admin/crops');
    return response.data;
  },

  /** POST /api/v1/admin/crops - Create crop */
  create: async (data: { cropName: string; description?: string }) => {
    const response = await httpClient.post('/api/v1/admin/crops', data);
    return response.data;
  },

  /** PUT /api/v1/admin/crops/{id} - Update crop */
  update: async (id: number, data: { cropName: string; description?: string }) => {
    const response = await httpClient.put(`/api/v1/admin/crops/${id}`, data);
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN VARIETIES API
// ═══════════════════════════════════════════════════════════════

export const adminVarietyApi = {
  /** GET /api/v1/admin/varieties - List all varieties */
  list: async (cropId?: number) => {
    const response = await httpClient.get('/api/v1/admin/varieties', { params: { cropId } });
    return response.data;
  },

  /** POST /api/v1/admin/varieties - Create variety */
  create: async (data: { name: string; cropId: number; description?: string }) => {
    const response = await httpClient.post('/api/v1/admin/varieties', data);
    return response.data;
  },

  /** PUT /api/v1/admin/varieties/{id} - Update variety */
  update: async (id: number, data: { name: string; cropId: number; description?: string }) => {
    const response = await httpClient.put(`/api/v1/admin/varieties/${id}`, data);
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN WAREHOUSES API
// ═══════════════════════════════════════════════════════════════

export const adminWarehouseApi = {
  /** GET /api/v1/admin/warehouses - List all warehouses */
  list: async (params?: { keyword?: string; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/warehouses', { params });
    return response.data;
  },

  /** GET /api/v1/admin/warehouses/{id} - Get warehouse detail */
  getById: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/warehouses/${id}`);
    return response.data;
  },

  /** GET /api/v1/admin/warehouses/{id}/locations - Get warehouse locations */
  getLocations: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/warehouses/${id}/locations`);
    return response.data;
  },

  /** GET /api/v1/admin/warehouses/{id}/movements - Get warehouse movements */
  getMovements: async (id: number, params?: { page?: number; size?: number }) => {
    const response = await httpClient.get(`/api/v1/admin/warehouses/${id}/movements`, { params });
    return response.data;
  },

  /** GET /api/v1/admin/warehouses/movements - List all movements */
  listAllMovements: async (params?: { page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/warehouses/movements', { params });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN SUPPLIERS/SUPPLIES API
// ═══════════════════════════════════════════════════════════════

export const adminSupplierApi = {
  /** GET /api/v1/admin/suppliers - List all suppliers */
  list: async (params?: { keyword?: string; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/suppliers', { params });
    return response.data;
  },

  /** GET /api/v1/admin/suppliers/{id} - Get supplier detail */
  getById: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/suppliers/${id}`);
    return response.data;
  },

  /** GET /api/v1/admin/suppliers/items - List all supply items */
  listItems: async (params?: { keyword?: string; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/suppliers/items', { params });
    return response.data;
  },

  /** GET /api/v1/admin/suppliers/items/{id} - Get supply item detail */
  getItem: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/suppliers/items/${id}`);
    return response.data;
  },

  /** GET /api/v1/admin/suppliers/lots - List all supply lots */
  listLots: async (params?: { supplierId?: number; status?: string; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/suppliers/lots', { params });
    return response.data;
  },

  /** GET /api/v1/admin/suppliers/lots/{id} - Get supply lot detail */
  getLot: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/suppliers/lots/${id}`);
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN TASKS API
// ═══════════════════════════════════════════════════════════════

export const adminTaskApi = {
  /** GET /api/v1/admin/tasks - List all tasks */
  list: async (params?: { status?: string; seasonId?: number; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/tasks', { params });
    return response.data;
  },

  /** GET /api/v1/admin/tasks/{id} - Get task detail */
  getById: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/tasks/${id}`);
    return response.data;
  },

  /** PATCH /api/v1/admin/tasks/{id}/status - Update task status */
  updateStatus: async (id: number, status: string) => {
    const response = await httpClient.patch(`/api/v1/admin/tasks/${id}/status`, { status });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN PLOTS API
// ═══════════════════════════════════════════════════════════════

export const adminPlotApi = {
  /** GET /api/v1/admin/plots - List all plots */
  list: async (params?: { farmId?: number; keyword?: string; page?: number; size?: number }) => {
    const response = await httpClient.get('/api/v1/admin/plots', { params });
    return response.data;
  },

  /** GET /api/v1/admin/plots/{id} - Get plot detail */
  getById: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/plots/${id}`);
    return response.data;
  },

  /** GET /api/v1/admin/plots/{id}/seasons - Get plot seasons */
  getSeasons: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/plots/${id}/seasons`);
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN USERS API (Extended)
// ═══════════════════════════════════════════════════════════════

export const adminUsersApi = {
  /** GET /api/v1/admin/users/farmers - List all farmers */
  listFarmers: async (params?: { keyword?: string; status?: string; page?: number; size?: number }) => {
    const validatedParams = params ? AdminUserListParamsSchema.partial().parse(params) : undefined;
    const response = await httpClient.get('/api/v1/admin/users/farmers', { params: validatedParams });
    return response.data;
  },

  /** GET /api/v1/admin/users/farmers/{id} - Get farmer detail */
  getFarmer: async (id: number) => {
    const response = await httpClient.get(`/api/v1/admin/users/farmers/${id}`);
    return response.data;
  },

  /** PATCH /api/v1/admin/users/farmers/{id}/status - Update farmer status */
  updateFarmerStatus: async (id: number, status: string) => {
    const response = await httpClient.patch(`/api/v1/admin/users/farmers/${id}/status`, { status });
    return response.data;
  },

  /** PUT /api/v1/admin/users/farmers/{id}/roles - Update farmer roles */
  updateFarmerRoles: async (id: number, roles: string[]) => {
    const response = await httpClient.put(`/api/v1/admin/users/farmers/${id}/roles`, { roles });
    return response.data;
  },
};

