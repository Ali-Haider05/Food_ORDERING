import React, { useState, useEffect, useMemo } from 'react';
import { menuService } from '../services/menuService';
import { CATEGORIES } from '../services/mockData';
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
  ChevronDown,
  Award
} from 'lucide-react';
import Button from '../components/common/Button';
import { formatPrice } from '../utils/format';

const HomePage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [quickViewDish, setQuickViewDish] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const items = await menuService.getAll();
        setMenuItems(items);
      } catch (err) {
        console.error('Error loading menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const itemCounts = useMemo(() => {
    const counts = { All: menuItems.length };
    menuItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let result = [...menuItems];

    if (selectedCategory !== 'All') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (isVegOnly) {
      result = result.filter((item) => item.isVeg === true);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.tag && item.tag.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [menuItems, selectedCategory, isVegOnly, searchQuery, sortBy]);

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
                  
                  {/* Subtle top-right coupon badge safely inside card */}
                  <div className="absolute top-3 right-3 bg-[#0B0F19]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-theme-lavender/30 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-300" />
                    <div>
                      <p className="text-[11px] font-bold text-white">COUPON: BIIT20</p>
                      <p className="text-[9px] text-theme-lavender">20% Off for Students</p>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/30 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-theme-lavender">
                      Chef's Special
                    </span>
                    <h3 className="text-lg font-black tracking-tight">Truffle Beef & Zinger Feast</h3>
                    <p className="text-xs text-theme-white-muted font-medium">Campus Meals starting from {formatPrice(180)}</p>
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
            {/* Veg toggle */}
            <button
              onClick={() => setIsVegOnly(!isVegOnly)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isVegOnly
                  ? 'bg-theme-violet text-white border-theme-lavender'
                  : 'bg-[#131A2B] text-white border-theme-lavender/20 hover:border-theme-lavender/40'
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span>Veg Only</span>
            </button>

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
                <option value="rating" className="bg-[#131A2B] text-white">Highest Rated</option>
              </select>
              <ChevronDown className="w-4 h-4 text-theme-lavender absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="mb-8">
          <CategoryPills
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            itemCounts={itemCounts}
          />
        </div>

        {/* Dish Grid or Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <FoodCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No dishes found"
            description="We couldn't find any dishes matching your current search or category filter. Try clearing filters to see the full menu."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setIsVegOnly(false);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((dish) => (
              <FoodCard
                key={dish.id}
                dish={dish}
                onQuickView={setQuickViewDish}
              />
            ))}
          </div>
        )}

      </section>

      {/* Quick View Customization Modal */}
      <FoodQuickViewModal
        dish={quickViewDish}
        isOpen={Boolean(quickViewDish)}
        onClose={() => setQuickViewDish(null)}
      />

    </div>
  );
};

export default HomePage;
