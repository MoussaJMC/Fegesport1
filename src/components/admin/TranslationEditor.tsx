import React, { useState } from 'react';
import { Languages, Check, AlertCircle } from 'lucide-react';
import { Language, Translations } from '../../utils/translations';

interface TranslationField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'array';
  required?: boolean;
}

interface TranslationEditorProps {
  fields: TranslationField[];
  translations: Translations;
  onChange: (translations: Translations) => void;
  defaultLanguage?: Language;
}

const TranslationEditor: React.FC<TranslationEditorProps> = ({
  fields,
  translations,
  onChange,
  defaultLanguage = 'fr',
}) => {
  const [activeLanguage, setActiveLanguage] = useState<Language>(defaultLanguage);

  const handleFieldChange = (field: string, value: any) => {
    const updatedTranslations = {
      ...translations,
      [activeLanguage]: {
        ...(translations[activeLanguage] || {}),
        [field]: value,
      },
    };
    onChange(updatedTranslations);
  };

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    const currentArray = (translations[activeLanguage]?.[field] as string[]) || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleFieldChange(field, newArray);
  };

  const addArrayItem = (field: string) => {
    const currentArray = (translations[activeLanguage]?.[field] as string[]) || [];
    handleFieldChange(field, [...currentArray, '']);
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = (translations[activeLanguage]?.[field] as string[]) || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleFieldChange(field, newArray);
  };

  const getFieldValue = (field: string): any => {
    return translations[activeLanguage]?.[field] || '';
  };

  const getCompleteness = (lang: Language): number => {
    const requiredFields = fields.filter((f) => f.required).map((f) => f.name);
    const langData = translations[lang] || {};
    const completedFields = requiredFields.filter(
      (field) => langData[field] && langData[field] !== ''
    ).length;
    return requiredFields.length > 0
      ? Math.round((completedFields / requiredFields.length) * 100)
      : 100;
  };

  return (
    <div className="space-y-4">
      {/* Language Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveLanguage('fr')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeLanguage === 'fr'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Languages size={16} />
          Français
          {getCompleteness('fr') === 100 ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <span className="text-xs text-gray-500">({getCompleteness('fr')}%)</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveLanguage('en')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeLanguage === 'en'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Languages size={16} />
          English
          {getCompleteness('en') === 100 ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <span className="text-xs text-gray-500">({getCompleteness('en')}%)</span>
          )}
        </button>
      </div>

      {/* Translation Fields */}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={getFieldValue(field.name)}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={`${field.label} en ${
                  activeLanguage === 'fr' ? 'français' : 'anglais'
                }`}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={getFieldValue(field.name)}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                rows={field.name === 'content' ? 10 : 3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder={`${field.label} en ${
                  activeLanguage === 'fr' ? 'français' : 'anglais'
                }`}
              />
            )}

            {field.type === 'array' && (
              <div className="space-y-2">
                {((getFieldValue(field.name) as string[]) || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleArrayFieldChange(field.name, index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Item ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(field.name, index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(field.name)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ajouter un item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completeness Warning */}
      {getCompleteness(activeLanguage) < 100 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Traduction incomplète:</strong> Certains champs requis sont vides
            pour {activeLanguage === 'fr' ? 'le français' : "l'anglais"}.
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationEditor;
