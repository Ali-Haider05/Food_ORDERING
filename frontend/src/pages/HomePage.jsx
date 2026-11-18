import React, { useState, useEffect, useMemo } from 'react';
import { categoryService, menuService } from '../services/menuService';
import { useToast } from '../context/ToastContext';
import FoodCard from '../components/food/FoodCard';
import FoodQuickViewModal from '../components/food/FoodQuickViewModal';
import CategoryPills from '../components/food/CategoryPills';
import { FoodCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { 
  Search, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Leaf, 
  Flame, 
  ChevronDown
} from 'lucide-react';
import Button from '../components/common/Button';

const HomePage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const { addToast } = useToast();
  const [sortBy, setSortBy] = useState('recommended');
  const [quickViewDish, setQuickViewDish] = useState(null);

  useEffect(() => {
    let active = true;
    categoryService.list().then((result) => {
      if (active) setCategories(result);
    }).catch((failure) => {
      if (active) addToast({ title: 'Categories unavailable', message: failure.message, type: 'error' });
    });
    return () => { active = false; };
  }, [retry, addToast]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setPage(1);
    const timer = setTimeout(async () => {
      try {
        const items = await menuService.getAll({
          search: searchQuery.trim() || undefined,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
        });
        if (active) setMenuItems(items);
      } catch (failure) {
        if (active) setError(failure.message);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [searchQuery, selectedCategory, retry]);

  const sortedItems = useMemo(() => {
    if (sortBy === 'price-low') return [...menuItems].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return [...menuItems].sort((a, b) => b.price - a.price);
    return menuItems;
  }, [menuItems, sortBy]);
  const totalPages = Math.ceil(sortedItems.length / 10);
  const filteredItems = sortedItems.slice((page - 1) * 10, page * 10);
  const categoryName = (id) => categories.find((category) => category.id === id)?.name || 'Menu';

  const openDetails = async (item) => {
    try {
      const detail = await menuService.getById(item.id);
      setQuickViewDish({ ...detail, category: categoryName(detail.category) });
    } catch (failure) {
      addToast({ title: 'Dish unavailable', message: failure.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen pb-20 text-white bg-theme-canvas overflow-x-hidden">
      
      {/* Hero Section - Balanced for Laptop 100% Zoom */}
      <section className="relative overflow-hidden pt-6 pb-12 lg:py-14 bg-theme-hero border-b border-theme-lavender/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131A2B] border border-theme-lavender/25 text-theme-lavender text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>BIIT Campus • Shamsabad, Rawalpindi</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Fresh Hot Meals,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-lavender via-[#C4B5FD] to-white">
                  Delivered in 20 Mins.
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-theme-white-muted max-w-xl leading-relaxed font-normal">
                Gourmet smash burgers, stone-baked pizzas, creamy Italian pastas, and authentic chicken dum biryani delivered straight to BIIT departments, hostels, and around Rawalpindi.
              </p>

              {/* Quick Search in Hero */}
              <div className="pt-1 max-w-lg">
                <div className="relative flex items-center rounded-2xl bg-[#131A2B] border border-theme-lavender/25 p-1.5 focus-within:border-theme-lavender transition-all">
                  <Search className="w-4 h-4 text-theme-lavender ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search burgers, biryani, pizza, pasta, chai..."
                    className="w-full px-3 py-1.5 text-xs sm:text-sm text-white placeholder:text-theme-white-muted/60 bg-transparent focus:outline-none font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-theme-lavender hover:text-white px-2 font-bold"
                    >
                      Clear
                    </button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="shrink-0 font-bold shadow-none text-xs"
                    onClick={() => {
                      const el = document.getElementById('menu-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore Food
                  </Button>
                </div>
              </div>

              {/* Micro Benefits Banner */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-white">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#131A2B] border border-theme-lavender/20 text-theme-lavender flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span>15-25 Min Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#131A2B] border border-theme-lavender/20 text-theme-lavender flex items-center justify-center">
                    <Leaf className="w-3.5 h-3.5" />
                  </div>
                  <span>100% Halal Fresh Food</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#131A2B] border border-theme-lavender/20 text-theme-lavender flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Live Order Tracker</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card - Fully Contained, Zero Negative Margin Bleed */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-2xl overflow-hidden border border-theme-lavender/20 aspect-[4/3] shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
                    alt="BIIT Food Hub Special"
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/30 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-theme-lavender">
                      BIIT Food Hub
                    </span>
                    <h3 className="text-lg font-black tracking-tight">Explore the Campus Menu</h3>
                    <p className="text-xs text-theme-white-muted font-medium">Browse current dishes and prices</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Menu Section */}
      <section id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-lavender mb-1">
              <span>Freshly Prepared to Order</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Explore Our Food Menu
            </h2>
            <p className="text-xs sm:text-sm text-theme-white-muted mt-1 font-normal">
              Select from burgers, Italian pizzas, fettuccine pastas, dum biryanis, desserts, and Karak chai.
            </p>
          </div>

          {/* Controls: Veg Toggle & Sort By */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#131A2B] border border-theme-lavender/25 rounded-xl px-3.5 py-2 pr-9 text-xs font-bold text-white hover:border-theme-lavender focus:outline-none focus:ring-1 focus:ring-theme-lavender cursor-pointer"
              >
                <option value="recommended" className="bg-[#131A2B] text-white">Sort: Recommended</option>
                <option value="price-low" className="bg-[#131A2B] text-white">Price: Low to High</option>
                <option value="price-high" className="bg-[#131A2B] text-white">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-theme-lavender absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="mb-8">
          <CategoryPills
            categories={[{ id: 'All', name: 'All' }, ...categories]}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Dish Grid or Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <FoodCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Menu unavailable" description={error} actionLabel="Retry" onAction={() => setRetry((value) => value + 1)} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No dishes found"
            description="We couldn't find any dishes matching your current search or category filter. Try clearing filters to see the full menu."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((dish) => (
              <FoodCard
                key={dish.id}
                dish={{ ...dish, category: categoryName(dish.category) }}
                onQuickView={openDetails}
              />
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6 text-sm">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </section>

      {/* Quick View Customization Modal */}
      <FoodQuickViewModal
        key={quickViewDish?.id}
        dish={quickViewDish}
        isOpen={Boolean(quickViewDish)}
        onClose={() => setQuickViewDish(null)}
      />

    </div>
  );
};

export default HomePage;
