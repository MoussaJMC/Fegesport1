import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="bg-dark-800 border border-dark-700 border-dashed rounded-xl p-10 text-center">
    <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center text-light-400 mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-base font-bold text-white font-heading mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-light-400 max-w-md mx-auto mb-5 leading-relaxed">{description}</p>
    )}
    {action && <div className="flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
