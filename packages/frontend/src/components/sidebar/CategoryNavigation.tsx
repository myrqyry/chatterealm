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
    <div style={{
      padding: '12px 20px',
      borderBottom: '1px solid rgba(196, 167, 231, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '4px'
    }}>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          style={{
            flex: 1,
            background: activeCategory === category.id ? 'rgba(196, 167, 231, 0.2)' : 'transparent',
            border: activeCategory === category.id ? '1px solid rgba(196, 167, 231, 0.4)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '8px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            transition: 'all 0.2s ease',
            minHeight: '50px'
          }}
          onMouseEnter={(e) => {
            if (activeCategory !== category.id) {
              e.currentTarget.style.background = 'rgba(196, 167, 231, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeCategory !== category.id) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <span style={{
            fontSize: '1.2em',
            display: 'block',
            marginBottom: '2px'
          }}>
            {category.icon}
          </span>
          <span style={{
            fontSize: '0.7em',
            color: activeCategory === category.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeCategory === category.id ? '600' : '400',
            textAlign: 'center',
            lineHeight: '1'
          }}>
            {category.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryNavigation;