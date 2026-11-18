import api from './api.js';

const dish = (item) => ({ ...item, isAvailable: item.available });
const payload = ({ name, description, category, price, image, isAvailable }) => ({
  name, description, category, price: Number(price), image, available: isAvailable,
});

export const menuService = {
  async list({ page = 1, limit = 10, search, category } = {}) {
    const { data } = await api.get('/menu', { params: { page, limit, search, category } });
    return { items: data.items.map(dish), pagination: data.pagination };
  },
  async getAll(filters) {
    const first = await this.list({ ...filters, limit: 100 });
    const items = [...first.items];
    for (let page = 2; page <= first.pagination.totalPages; page += 1) {
      const next = await this.list({ ...filters, page, limit: 100 });
      items.push(...next.items);
    }
    return items;
  },
  async getById(id) {
    const { data } = await api.get('/menu/' + encodeURIComponent(id));
    return dish(data.item);
  },
  async create(item) {
    const { data } = await api.post('/menu', payload(item));
    return dish(data.item);
  },
  async update(id, item) {
    const { data } = await api.put('/menu/' + encodeURIComponent(id), payload(item));
    return dish(data.item);
  },
  async delete(id) {
    await api.delete('/menu/' + encodeURIComponent(id));
  },
};

export const categoryService = {
  async list() {
    return (await api.get('/categories')).data.categories;
  },
  async save(name, id) {
    const response = id ? await api.put('/categories/' + encodeURIComponent(id), { name }) :
      await api.post('/categories', { name });
    return response.data.category;
  },
  async delete(id) {
    await api.delete('/categories/' + encodeURIComponent(id));
  },
};
