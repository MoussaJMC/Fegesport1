import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Download, Book, Shield, Eye } from 'lucide-react';
import PDFViewer from '../components/resources/PDFViewer';
import { toast } from 'sonner';

const ResourcesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);

  // Updated resources with CORS-enabled PDF URL
  const resources = [
    {
      category: t('resources.categories.official'),
      items: [
        {
          title: 'Statuts de la FEGESPORT',
          description: 'Document officiel détaillant la structure et le fonctionnement de la fédération',
          type: 'PDF',
          size: '2.1 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        },
        {
          title: 'Règlement Intérieur',
          description: 'Règles et procédures internes de la FEGESPORT',
          type: 'PDF',
          size: '1.8 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        },
        {
          title: 'Code de Conduite',
          description: 'Normes de comportement pour tous les membres',
          type: 'PDF',
          size: '1.2 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        }
      ]
    },
    {
      category: t('resources.categories.guides'),
      items: [
        {
          title: 'Guide des Compétitions',
          description: 'Procédures et règlements pour l\'organisation de tournois',
          type: 'PDF',
          size: '3.5 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        },
        {
          title: 'Manuel des Arbitres',
          description: 'Guide complet pour l\'arbitrage des compétitions esport',
          type: 'PDF',
          size: '4.2 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        },
        {
          title: 'Guide du Streaming',
          description: 'Bonnes pratiques pour la diffusion des événements',
          type: 'PDF',
          size: '2.8 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        }
      ]
    },
    {
      category: t('resources.categories.reports'),
      items: [
        {
          title: 'Rapport Annuel 2024',
          description: 'Bilan des activités et résultats de la FEGESPORT',
          type: 'PDF',
          size: '5.1 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        },
        {
          title: 'État de l\'Esport en Guinée',
          description: 'Étude sur le développement de l\'esport national',
          type: 'PDF',
          size: '3.7 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        },
        {
          title: 'Impact Économique',
          description: 'Analyse de l\'impact économique de l\'esport',
          type: 'PDF',
          size: '2.9 MB',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        }
      ]
    }
  ];

  const handleViewPDF = (url: string) => {
    setSelectedPDF(url);
  };

  const handleDownloadPDF = (url: string, title: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="pt-20">
      {selectedPDF && (
        <PDFViewer url={selectedPDF} onClose={() => setSelectedPDF(null)} />
      )}

      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{t('resources.title')}</h1>
            <p className="text-xl">
              {t('resources.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white border-b overflow-x-auto">
        <div className="container-custom py-8">
          <div className="flex flex-nowrap md:grid md:grid-cols-4 gap-4">
            {[
              t('resources.categories.official'), 
              t('resources.categories.guides'), 
              t('resources.categories.reports'), 
              t('resources.categories.forms')
            ].map((link, index) => (
              <button
                key={index}
                className="px-6 py-3 text-center rounded-lg hover:bg-primary-50 text-primary-600 font-medium transition-colors whitespace-nowrap flex-shrink-0"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="space-y-12">
            {resources.map((category, index) => (
              <div key={index}>
                <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      className="card p-6"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start">
                        <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                          <FileText className="text-primary-600" size={24} />
                        </div>
                        <div className="ml-4 flex-grow">
                          <h3 className="font-bold mb-2 card-title">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 card-description">{item.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-gray-500 mb-2 sm:mb-0">{item.type} • {item.size}</span>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewPDF(item.url)}
                                className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                              >
                                <Eye size={16} className="mr-1" />
                                {t('resources.actions.view')}
                              </button>
                              <button 
                                onClick={() => handleDownloadPDF(item.url, item.title)}
                                className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                              >
                                <Download size={16} className="mr-1" />
                                {t('resources.actions.download')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('resources.other.title')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="card p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Book className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 card-title">{t('resources.other.media')}</h3>
              <p className="text-gray-600 mb-4 card-description">
                {t('resources.other.media_desc')}
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                {t('resources.other.access')}
              </button>
            </motion.div>

            <motion.div
              className="card p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 card-title">{t('resources.other.branding')}</h3>
              <p className="text-gray-600 mb-4 card-description">
                {t('resources.other.branding_desc')}
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                {t('resources.other.download')}
              </button>
            </motion.div>

            <motion.div
              className="card p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 card-title">{t('resources.other.forms')}</h3>
              <p className="text-gray-600 mb-4 card-description">
                {t('resources.other.forms_desc')}
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                {t('resources.other.viewAll')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;