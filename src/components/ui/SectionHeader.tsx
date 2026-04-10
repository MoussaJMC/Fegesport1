import React from 'react';

interface SectionHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  dividerColor?: 'gold' | 'red';
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  overline,
  title,
  description,
  align = 'center',
  dividerColor = 'gold',
  className = '',
}) => {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  const dividerAlign = align === 'center' ? 'mx-auto' : '';
  const dividerClass = dividerColor === 'gold' ? 'divider-gold' : 'divider-red';

  return (
    <div className={`mb-12 md:mb-16 ${alignClass} ${className}`}>
      {overline && (
        <span className="overline block">{overline}</span>
      )}
      <h2 className="section-title">{title}</h2>
      <div className={`${dividerClass} ${dividerAlign} mb-6`} />
      {description && (
        <p className={`text-light-400 text-lg max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
