import { apiGet } from '../apiConfig';

export interface MenuItemApiResponse {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  requiresRole?: string;
  external?: boolean;
  order: number;
}

export interface MenuItemsApiResponse {
  success: boolean;
  statusCode: number;
  data: {
    items: MenuItemApiResponse[];
    lastUpdated: string;
  };
}

class MenuService {
  async getMenuItems(): Promise<MenuItemsApiResponse> {
    const response = await apiGet<MenuItemsApiResponse>('/public/menu-items');
    return response;
  }
}

export const menuService = new MenuService();