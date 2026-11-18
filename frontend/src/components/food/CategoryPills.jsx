import React from 'react';
import { 
  Flame, 
  Utensils, 
  Pizza as PizzaIcon, 
  Salad, 
  Soup, 
  Coffee, 
  Cake 
} from 'lucide-react';

const CATEGORY_ICONS = {
  All: Utensils,
  Burgers: Flame,
  Pizza: PizzaIcon,
  'Biryani & Bowls': Salad,
  Bowls: Salad,
  Pasta: Soup,
  Desserts: Cake,
  Beverages: Coffee,
  Drinks: Coffee,
};

const CategoryPills = ({ categories, selectedCategory, onSelectCategory, itemCounts = {} }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
      {categories.map(({ id, name }) => {
        const isSelected = selectedCategory === id;
        const Icon = CATEGORY_ICONS[name] || Utensils;
        const count = itemCounts[id];

        return (
          <button
            key={id}
            onClick={() => onSelectCategory(id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 active:scale-95 select-none ${
              isSelected
                ? 'bg-theme-violet text-white border border-theme-lavender/40'
                : 'bg-[#131A2B] hover:bg-[#1E2842] text-theme-white-muted hover:text-white border border-theme-lavender/15 hover:border-theme-lavender/30'
            }`}
          >
            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-theme-lavender'}`} />
            <span>{name}</span>
            {count !== undefined && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isSelected
                    ? 'bg-black/30 text-white'
                    : 'bg-[#0B0F19] text-theme-lavender'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
