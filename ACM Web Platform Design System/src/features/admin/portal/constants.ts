import type { AdminView, AdminViewConfig } from './types';

export const ADMIN_VIEW_CONFIG: Record<AdminView, AdminViewConfig> = {
  dashboard: { title: 'Admin Dashboard', breadcrumbLabel: 'Dashboard' },
  'users-roles': { title: 'Users & Roles / Người dùng & Phân quyền', breadcrumbLabel: 'Users & Roles' },
  'farms-plots': { title: 'Farms & Plots / Trang trại & Lô đất', breadcrumbLabel: 'Farms & Plots' },
  'crops-varieties': { title: 'Crops & Varieties / Cây trồng & Giống', breadcrumbLabel: 'Crops & Varieties' },
  'seasons-tasks': { title: 'Seasons & Tasks / Mùa vụ & Công việc', breadcrumbLabel: 'Seasons & Tasks' },
  inventory: { title: 'Inventory (System) / Kho vật tư', breadcrumbLabel: 'Inventory' },
  'suppliers-supplies': { title: 'Suppliers & Supplies / Nhà cung cấp & Vật tư', breadcrumbLabel: 'Suppliers & Supplies' },
  incidents: { title: 'Incidents / Sự cố', breadcrumbLabel: 'Incidents' },
  reports: { title: 'Reports / Báo cáo', breadcrumbLabel: 'Reports' },
  'ai-chats': { title: 'AI Chats (audit) / Trò chuyện AI', breadcrumbLabel: 'AI Chats' },
};

export const getAdminViewTitle = (view: AdminView): string =>
  ADMIN_VIEW_CONFIG[view]?.title ?? ADMIN_VIEW_CONFIG.dashboard.title;

export const getAdminBreadcrumbLabel = (view: AdminView): string | undefined =>
  ADMIN_VIEW_CONFIG[view]?.breadcrumbLabel;
