import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  className = '',
  error,
  children
}) => {
  const { register } = useFormContext();

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      {children || (
        <input
          type={type}
          id={name}
          {...register(name)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 bg-secondary-800 border ${
            error ? 'border-primary-500' : 'border-secondary-600'
          } rounded-md focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400`}
        />
      )}
      {error && <p className="mt-1 text-sm text-primary-500">{error}</p>}
    </div>
  );
};

export const FormTextarea: React.FC<FormFieldProps> = ({
  name,
  label,
  placeholder,
  required = false,
  className = '',
  error
}) => {
  const { register } = useFormContext();

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <textarea
        id={name}
        {...register(name)}
        placeholder={placeholder}
        rows={4}
        className={`w-full px-4 py-2 bg-secondary-800 border ${
          error ? 'border-primary-500' : 'border-secondary-600'
        } rounded-md focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400`}
      />
      {error && <p className="mt-1 text-sm text-primary-500">{error}</p>}
    </div>
  );
};

export const FormSelect: React.FC<FormFieldProps & { options: { value: string; label: string }[] }> = ({
  name,
  label,
  required = false,
  className = '',
  error,
  options
}) => {
  const { register } = useFormContext();

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <select
        id={name}
        {...register(name)}
        className={`w-full px-4 py-2 bg-secondary-800 border ${
          error ? 'border-primary-500' : 'border-secondary-600'
        } rounded-md focus:ring-primary-500 focus:border-primary-500 text-white`}
      >
        <option value="">Sélectionnez une option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-primary-500">{error}</p>}
    </div>
  );
};

export const FormCheckbox: React.FC<FormFieldProps> = ({
  name,
  label,
  required = false,
  className = '',
  error
}) => {
  const { register } = useFormContext();

  return (
    <div className={`mb-4 ${className}`}>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...register(name)}
          className="w-4 h-4 text-primary-500 border-secondary-600 rounded focus:ring-primary-500 bg-secondary-800"
        />
        <span className="text-sm text-gray-300">
          {label} {required && <span className="text-primary-500">*</span>}
        </span>
      </label>
      {error && <p className="mt-1 text-sm text-primary-500">{error}</p>}
    </div>
  );
};

export const FormSubmitButton: React.FC<{
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}> = ({ children, isLoading = false, className = '' }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`btn bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          Chargement...
        </div>
      ) : (
        children
      )}
    </button>
  );
};