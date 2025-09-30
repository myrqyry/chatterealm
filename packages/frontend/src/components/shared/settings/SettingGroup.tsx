import React from 'react';

interface SettingGroupProps {
  title: string;
  icon?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

const SettingGroup: React.FC<SettingGroupProps> = ({
  title,
  icon,
  description,
  className = '',
  children
}) => {
  return (
    <div className={`settings-category ${className}`}>
      <h5>
        {icon && <span className="category-icon">{icon}</span>}
        {title}
      </h5>
      {description && (
        <p className="category-description">{description}</p>
      )}
      {children}
    </div>
  );
};

export default SettingGroup;
