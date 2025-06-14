import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Download, Book, Shield, Eye } from 'lucide-react';
import PDFViewer from '../components/resources/PDFViewer';
import { toast } from 'sonner';

const ResourcesPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);

  // Updated resources with CORS-enabled PDF URL
  const resources = [
    {
      category: 'Documents Officiels',
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
      category: 'Guides Pratiques',
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
      category: 'Études et Rapports',
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
      toast.error('Erreur lors du téléchargement du PDF');
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Centre de Ressources</h1>
            <p className="text-xl">
              Accédez à notre bibliothèque de documents, guides et ressources pour le développement 
              de l'esport en Guinée.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white border-b">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Documents Officiels', 'Guides Pratiques', 'Études et Rapports', 'Formulaires'].map((link, index) => (
              <button
                key={index}
                className="px-6 py-3 text-center rounded-lg hover:bg-primary-50 text-primary-600 font-medium transition-colors"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      className="card p-6"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start">
                        <div className="bg-primary-100 p-3 rounded-lg">
                          <FileText className="text-primary-600" size={24} />
                        </div>
                        <div className="ml-4 flex-grow">
                          <h3 className="font-bold mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{item.type} • {item.size}</span>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewPDF(item.url)}
                                className="text-primary-600 hover:text-primary-700 flex items-center"
                              >
                                <Eye size={16} className="mr-1" />
                                Consulter
                              </button>
                              <button 
                                onClick={() => handleDownloadPDF(item.url, item.title)}
                                className="text-primary-600 hover:text-primary-700 flex items-center"
                              >
                                <Download size={16} className="mr-1" />
                                Télécharger
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
            <h2 className="text-3xl font-bold mb-4">Autres Ressources</h2>
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
              <h3 className="text-xl font-bold mb-3">Bibliothèque Média</h3>
              <p className="text-gray-600 mb-4">
                Photos, vidéos et assets officiels de la FEGESPORT
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Accéder
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
              <h3 className="text-xl font-bold mb-3">Charte Graphique</h3>
              <p className="text-gray-600 mb-4">
                Logos, couleurs et éléments de marque FEGESPORT
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Télécharger
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
              <h3 className="text-xl font-bold mb-3">Formulaires</h3>
              <p className="text-gray-600 mb-4">
                Documents administratifs et formulaires officiels
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Voir tout
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;