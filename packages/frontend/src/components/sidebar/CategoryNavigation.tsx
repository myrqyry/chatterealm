import React from 'react';

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
  <div className="px-5 py-3 flex justify-between items-center gap-1 border-b border-[var(--color-outline)]">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex-1 rounded-md p-2 flex flex-col items-center gap-0.5 min-h-[50px] transition duration-150 border ${activeCategory === category.id ? 'bg-[var(--color-primary-container)] border-[var(--color-outline)]' : 'bg-transparent hover:bg-[var(--color-primary-container)]/10 border-transparent'}`}
        >
          <span className="text-[1.2em] block mb-0.5">{category.icon}</span>
          <span className={`text-[0.7em] text-center leading-none ${activeCategory === category.id ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-secondary)] font-normal'}`}>
            {category.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryNavigation;