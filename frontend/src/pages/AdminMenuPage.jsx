import React, { useState, useEffect } from 'react';
import { categoryService, menuService } from '../services/menuService';
import { useToast } from '../context/ToastContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { formatPrice, getDishImage } from '../utils/format';

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

const AdminMenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [manageCategories, setManageCategories] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToast } = useToast();

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const initialFormState = {
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    isAvailable: true,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMenu = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [menu, groups] = await Promise.all([menuService.getAll(), categoryService.list()]);
      setItems(menu);
      setCategories(groups);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ ...initialFormState, category: categories[0]?.id || '' });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description,
      image: item.image,
      isAvailable: item.isAvailable ?? true,
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Dish name is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.price || !Number.isFinite(Number(formData.price)) || Number(formData.price) <= 0) {
      errs.price = 'Please enter a valid price (greater than 0)';
    }
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.image.trim()) errs.image = 'Image URL is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      if (editingItem) {
        const updated = await menuService.update(editingItem.id, payload);
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
        addToast({
          title: 'Dish Updated',
          message: `"${payload.name}" has been updated.`,
          type: 'success',
        });
      } else {
        const created = await menuService.create(payload);
        setItems((prev) => [created, ...prev]);
        addToast({
          title: 'Dish Added',
          message: `"${payload.name}" has been added to the live menu!`,
          type: 'success',
        });
      }
      setIsAddEditModalOpen(false);
    } catch (err) {
      addToast({
        title: 'Save Failed',
        message: err.message || 'Could not save menu item',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await menuService.delete(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      addToast({
        title: 'Dish Deleted',
        message: `"${itemToDelete.name}" was removed from the menu.`,
        type: 'info',
      });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      addToast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete item',
        type: 'error',
      });
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updated = await menuService.update(item.id, {
        ...item,
        isAvailable: !item.isAvailable,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      addToast({
        title: updated.isAvailable ? 'Dish Available' : 'Dish Marked Sold Out',
        message: `${updated.name} status updated.`,
        type: 'success',
        duration: 2000,
      });
    } catch (err) {
      addToast({ title: 'Update failed', message: err.message, type: 'error' });
    }
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    if (categoryBusy || !categoryName.trim()) return;
    setCategoryBusy(true);
    try {
      const saved = await categoryService.save(categoryName.trim(), categoryId);
      setCategories((current) => categoryId ?
        current.map((category) => category.id === categoryId ? saved : category) : [...current, saved]);
      setCategoryId('');
      setCategoryName('');
    } catch (error) {
      addToast({ title: 'Category could not be saved', message: error.message, type: 'error' });
    } finally {
      setCategoryBusy(false);
    }
  };

  const removeCategory = async (category) => {
    if (categoryBusy || !window.confirm('Delete category "' + category.name + '"?')) return;
    setCategoryBusy(true);
    try {
      await categoryService.delete(category.id);
      setCategories((current) => current.filter(({ id }) => id !== category.id));
      if (selectedCategory === cat.idegory.id) setSelectedCategory('All');
      if (categoryId === category.id) {
        setCategoryId('');
        setCategoryName('');
      }
    } catch (error) {
      addToast({ title: 'Category could not be deleted', message: error.message, type: 'error' });
    } finally {
      setCategoryBusy(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-theme-white bg-theme-canvas">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme-lavender/10 pb-6">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-black text-theme-lavender hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-white tracking-tight">
            Menu Items Manager
          </h1>
          <p className="text-xs sm:text-sm text-theme-lavender mt-1.5 font-medium">
            Create, modify pricing, upload images, and control dish availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setManageCategories(true)}
            className="text-xs font-bold gap-1.5 border-theme-lavender/30"
          >
            Manage Categories
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            disabled={loading || !categories.length}
            className="text-xs font-black gap-1.5 shadow-violet-glow"
          >
            <Plus className="w-4 h-4" />
            Add New Dish
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-theme-purple p-4 rounded-2xl border border-theme-lavender/20 shadow-purple-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-theme-lavender absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu dishes..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-theme-purple-dark border border-theme-lavender/20 text-theme-white placeholder:text-theme-lavender/50 focus:outline-none focus:ring-2 focus:ring-theme-violet"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[{ id: 'All', name: 'All' }, ...categories].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-theme-violet text-white shadow-violet-glow'
                  : 'bg-theme-purple-dark text-theme-lavender hover:text-white border border-theme-lavender/15'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center gap-3 text-sm text-rose-300">
          {loadError} <Button variant="outline" size="sm" onClick={loadMenu}>Retry</Button>
        </div>
      )}

      {/* Menu Items Table */}
      <div className="bg-theme-purple rounded-3xl border border-theme-lavender/20 shadow-purple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-theme-purple-dark border-b border-theme-lavender/15 text-theme-lavender uppercase tracking-widest text-[11px] font-black">
                <th className="py-4 px-4">Dish</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Tag</th>
                <th className="py-4 px-4">Prep & Energy</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-lavender/10">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={7} />
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-theme-lavender font-medium">
                    No dishes found matching your query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-theme-purple-light/50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getDishImage(item)}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-theme-lavender/25 shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_FOOD_IMG;
                          }}
                        />
                        <div>
                          <p className="font-bold text-white text-sm leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-theme-white-muted line-clamp-1 max-w-xs mt-0.5 font-normal">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-white">
                      {categories.find(({ id }) => id === item.category)?.name || 'Unknown category'}
                    </td>

                    <td className="py-4 px-4 font-black text-white text-sm">
                      {formatPrice(item.price)}
                    </td>

                    <td className="py-4 px-4">
                      {item.tag ? (
                        <Badge variant="purple" size="sm">
                          {item.tag}
                        </Badge>
                      ) : (
                        <span className="text-theme-lavender/40">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-theme-white">
                      <div className="space-y-0.5 font-semibold">
                                              </div>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1 rounded-full text-xs font-black transition ${
                          item.isAvailable !== false
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-theme-purple-dark text-theme-lavender/40 border border-theme-lavender/20'
                        }`}
                      >
                        {item.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-theme-lavender hover:text-white hover:bg-theme-purple-light rounded-xl transition"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-2 text-theme-lavender hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={manageCategories} onClose={() => setManageCategories(false)} title="Manage Categories">
        <form onSubmit={saveCategory} className="flex items-end gap-3 mb-5">
          <Input label="Category name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required />
          <Button type="submit" isLoading={categoryBusy}>{categoryId ? 'Save' : 'Add'}</Button>
          {categoryId && <Button type="button" variant="outline" onClick={() => { setCategoryId(''); setCategoryName(''); }}>Cancel</Button>}
        </form>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-lavender/15 py-2">
              <span>{category.name}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={categoryBusy} onClick={() => { setCategoryId(category.id); setCategoryName(category.name); }}>Rename</Button>
                <Button variant="outline" size="sm" disabled={categoryBusy} onClick={() => removeCategory(category)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </Modal>

      {/* Add / Edit Dish Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingItem ? 'Edit Culinary Dish' : 'Add New Culinary Dish'}
        subtitle="Manage dish pricing, ingredients, and presentation imagery"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dish Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Wagyu Truffle Smash Burger"
              error={formErrors.name}
            />

            <div>
              <label className="block text-xs font-bold text-theme-white uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-theme-purple-dark border border-theme-lavender/20 rounded-2xl py-3 px-3 text-xs text-theme-white font-bold focus:outline-none focus:ring-2 focus:ring-theme-violet"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-theme-purple text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (Rs. PKR)"
              type="number"
              step="any"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="850"
              error={formErrors.price}
            />


          </div>

          <Input
            label="Image URL (Unsplash or direct link)"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            error={formErrors.image}
          />

          <div>
            <label className="block text-xs font-bold text-theme-white uppercase tracking-wider mb-2">
              Description & Ingredients
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Artisanal ingredients, allergens, and cooking technique details..."
              className="w-full text-xs p-3.5 rounded-2xl bg-theme-purple-dark border border-theme-lavender/20 text-theme-white placeholder:text-theme-lavender/50 focus:outline-none focus:ring-2 focus:ring-theme-violet font-medium"
            />
            {formErrors.description && (
              <p className="text-xs text-rose-400 mt-1 font-bold">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="flex items-center gap-6 pt-6">

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-theme-white">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded text-theme-violet focus:ring-theme-violet"
                />
                <span>Available / In Stock</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-theme-lavender/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingItem ? 'Save Changes' : 'Publish Dish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-medium">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p>
              Are you sure you want to delete <strong className="text-white font-black">"{itemToDelete?.name}"</strong>? This will remove the dish from the customer menu immediately.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Delete Dish
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AdminMenuPage;
