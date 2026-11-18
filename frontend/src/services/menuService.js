import api from './api';
import { INITIAL_MENU_ITEMS } from './mockData';

const MENU_STORAGE_KEY = 'biit_foodhub_menu_store_v2';

const normalizeDish = (dish) => {
  if (!dish) return null;
  return {
    ...dish,
    id: String(dish.id || dish._id || `dish-${Date.now()}`),
    price: Number(dish.price) || 0,
    rating: dish.rating !== undefined ? Number(dish.rating) : 4.8,
    reviewsCount: dish.reviewsCount !== undefined ? Number(dish.reviewsCount) : 45,
    isAvailable: dish.isAvailable !== false,
  };
};

const getLocalMenu = () => {
  const stored = localStorage.getItem(MENU_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
    return INITIAL_MENU_ITEMS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_MENU_ITEMS;
  }
};

const saveLocalMenu = (menu) => {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
};

export const menuService = {
  // Get all menu items (Calls real backend first)
  getAll: async () => {
    try {
      const response = await api.get('/menu');
      const data = response.data;
      if (Array.isArray(data)) return data.map(normalizeDish);
      if (Array.isArray(data?.data)) return data.data.map(normalizeDish);
      if (Array.isArray(data?.items)) return data.items.map(normalizeDish);
      if (Array.isArray(data?.menu)) return data.menu.map(normalizeDish);
    } catch {
      // Backend endpoint not yet active or offline, load seed data
    }
    return getLocalMenu().map(normalizeDish);
  },

  // Get single menu item by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/menu/${id}`);
      if (response.data) return normalizeDish(response.data);
    } catch {
      // Fallback
    }
    const menu = getLocalMenu();
    const found = menu.find(item => item.id === id || item._id === id);
    return found ? normalizeDish(found) : null;
  },

  // Create new menu item (Admin)
  create: async (itemData) => {
    try {
      const response = await api.post('/menu', itemData);
      const created = response.data?.data || response.data?.item || response.data;
      if (created) {
        const normalized = normalizeDish(created);
        const localMenu = getLocalMenu();
        localMenu.unshift(normalized);
        saveLocalMenu(localMenu);
        return normalized;
      }
    } catch {
      // Fallback
    }

    const localMenu = getLocalMenu();
    const newItem = normalizeDish({
      ...itemData,
      id: `dish-${Date.now()}`,
    });
    localMenu.unshift(newItem);
    saveLocalMenu(localMenu);
    return newItem;
  },

  // Update menu item (Admin)
  update: async (id, updatedFields) => {
    try {
      const response = await api.put(`/menu/${id}`, updatedFields);
      const updated = response.data?.data || response.data?.item || response.data;
      if (updated) {
        const normalized = normalizeDish(updated);
        const localMenu = getLocalMenu();
        const idx = localMenu.findIndex(i => i.id === id || i._id === id);
        if (idx !== -1) {
          localMenu[idx] = normalized;
          saveLocalMenu(localMenu);
        }
        return normalized;
      }
    } catch {
      // Fallback
    }

    const localMenu = getLocalMenu();
    const idx = localMenu.findIndex(i => i.id === id || i._id === id);
    if (idx !== -1) {
      localMenu[idx] = normalizeDish({ ...localMenu[idx], ...updatedFields });
      saveLocalMenu(localMenu);
      return localMenu[idx];
    }
    return null;
  },

  // Delete menu item (Admin)
  delete: async (id) => {
    try {
      await api.delete(`/menu/${id}`);
    } catch {
      // Fallback
    }

    const localMenu = getLocalMenu();
    const filtered = localMenu.filter(i => i.id !== id && i._id !== id);
    saveLocalMenu(filtered);
    return true;
  },

  // Reset to initial seed catalog
  resetToDefault: () => {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
    return INITIAL_MENU_ITEMS.map(normalizeDish);
  }
};
