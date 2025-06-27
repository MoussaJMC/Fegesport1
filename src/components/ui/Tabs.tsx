import * as React from 'react';

// Create context
interface TabsContextType {
  activeValue: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ 
  value, 
  onValueChange, 
  className = '', 
  children 
}) => {
  return (
    <TabsContext.Provider value={{ activeValue: value, onValueChange }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ 
  className = '', 
  children 
}) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 mb-4 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  className = '', 
  children 
}) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { activeValue, onValueChange } = context;
  
  const isActive = activeValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
        isActive 
          ? 'bg-white text-primary-700 shadow' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  className = '', 
  children 
}) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const { activeValue } = context;
  
  if (activeValue !== value) {
    return null;
  }
  
  return (
    <div 
      role="tabpanel"
      className={`mt-2 rounded-md ${className}`}
    >
      {children}
    </div>
  );
};