import React, { useState, useEffect, useRef } from 'react';
import { FileText, Lock } from 'lucide-react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

interface OfficialDocument {
  id: string;
  label: string;
  description: string;
  icon: string;
  url: string;
}

const officialDocuments: OfficialDocument[] = [
  {
    id: "statuts",
    label: "Statuts de la Fédération",
    description: "Statuts officiels de la FEGESPORT",
    icon: "📋",
    url: "",
  },
  {
    id: "reglement",
    label: "Règlement Intérieur",
    description: "Règlement intérieur de la FEGESPORT",
    icon: "📜",
    url: "",
  },
  {
    id: "reconnaissance-serproma",
    label: "Reconnaissance SERPROMA",
    description: "Arrêté de reconnaissance officielle — 2013",
    icon: "🏛️",
    url: "",
  },
  {
    id: "reconnaissance-conakry",
    label: "Reconnaissance Ville de Conakry",
    description: "Attestation de reconnaissance — 2018",
    icon: "🏙️",
    url: "",
  },
  {
    id: "rapport-audit-2024",
    label: "Rapport d'Audit 2024",
    description: "Rapport d'audit administratif — Ministère des Sports",
    icon: "🔍",
    url: "",
  },
  {
    id: "rapport-activites",
    label: "Rapport d'Activités",
    description: "Rapport annuel d'activités FEGESPORT",
    icon: "📊",
    url: "",
  },
  {
    id: "convention-easports",
    label: "Convention EA Sports",
    description: "Accord-cadre EA Sports — exploitation FIFA en Guinée — 2018",
    icon: "🎮",
    url: "",
  },
  {
    id: "attestation-iesf",
    label: "Attestation IESF",
    description: "Certificat d'affiliation — International Esports Federation",
    icon: "🌍",
    url: "",
  },
  {
    id: "attestation-gef",
    label: "Attestation GEF",
    description: "Certificat de siège au conseil — Global Esports Federation",
    icon: "🏆",
    url: "",
  },
];

const OfficialDocumentsSection: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const pdfCache = useRef(new Map<string, string>());

  const selectedDocument = officialDocuments[selectedIndex];

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            ShowSearchPopover,
            Zoom,
            ZoomIn,
            ZoomOut,
          } = slots;
          return (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                width: '100%',
                padding: '8px',
                backgroundColor: '#f3f4f6',
                borderBottom: '1px solid #e5e7eb',
                gap: '8px',
              }}
            >
              <div style={{ marginRight: 'auto' }}>
                <ShowSearchPopover />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GoToPreviousPage />
                <CurrentPageInput /> / <NumberOfPages />
                <GoToNextPage />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ZoomOut />
                <Zoom />
                <ZoomIn />
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  // Prefetch next document
  useEffect(() => {
    const nextIndex = (selectedIndex + 1) % officialDocuments.length;
    const nextDoc = officialDocuments[nextIndex];
    if (nextDoc.url && !pdfCache.current.has(nextDoc.id)) {
      fetch(nextDoc.url, { method: 'GET' })
        .then(() => pdfCache.current.set(nextDoc.id, nextDoc.url))
        .catch(() => {});
    }
  }, [selectedIndex]);

  const getFileUrl = (doc: OfficialDocument) => {
    if (!doc.url) return null;
    return doc.url;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Statuts & Documents Officiels
          </h2>
          <p className="text-lg text-gray-600">
            Documents consultables en ligne — lecture seule
          </p>
        </div>

        {/* Grid Layout for Document Tabs */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialDocuments.map((doc, index) => (
              <button
                key={doc.id}
                onClick={() => setSelectedIndex(index)}
                className={`p-4 rounded-lg transition-all duration-200 text-left ${
                  selectedIndex === index
                    ? 'bg-[#C0392B] text-white shadow-lg border-2 border-[#C0392B]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{doc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm mb-1 ${
                      selectedIndex === index ? 'text-white' : 'text-gray-900'
                    }`}>
                      {doc.label}
                    </h3>
                    <p className={`text-xs ${
                      selectedIndex === index ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {doc.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* PDF Viewer or Placeholder */}
        {selectedDocument.url ? (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="relative">
              <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                <Lock className="w-3.5 h-3.5" />
                Lecture seule
              </div>

              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedDocument.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedDocument.label}</h3>
                    <p className="text-gray-600 text-sm">{selectedDocument.description}</p>
                  </div>
                </div>
              </div>

              <div
                className="pdf-viewer-wrapper"
                style={{
                  height: window.innerWidth < 768 ? '400px' : '600px',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <Worker workerUrl={pdfjsWorker}>
                  <Viewer
                    key={selectedDocument.id}
                    fileUrl={getFileUrl(selectedDocument)!}
                    plugins={[defaultLayoutPluginInstance]}
                    renderLoader={(percentages: number) => (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '500px',
                          gap: '16px',
                        }}
                      >
                        <div style={{ fontSize: '14px', color: '#555' }}>
                          Chargement... {Math.round(percentages)}%
                        </div>
                        <div
                          style={{
                            width: '240px',
                            height: '6px',
                            background: '#e0e0e0',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${percentages}%`,
                              height: '100%',
                              background: '#C0392B',
                              borderRadius: '3px',
                              transition: 'width 0.2s ease',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  />
                </Worker>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">{selectedDocument.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedDocument.label}
              </h3>
              <p className="text-gray-600 mb-6">{selectedDocument.description}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document en cours de numérisation — disponible prochainement
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Ces documents sont protégés et ne peuvent être téléchargés ou imprimés
          </p>
        </div>
      </div>

      <style>{`
        .pdf-viewer-wrapper canvas {
          pointer-events: none;
        }

        .rpv-core__viewer {
          border: none;
        }

        .rpv-core__inner-pages {
          background-color: #e5e7eb;
        }

        /* Hide download and print buttons */
        .rpv-download__button,
        .rpv-print__button,
        button[aria-label*="Download"],
        button[aria-label*="Print"],
        button[aria-label*="Télécharger"],
        button[aria-label*="Imprimer"] {
          display: none !important;
        }

        /* Disable right-click context menu */
        .rpv-core__viewer * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Prevent text layer selection */
        .rpv-core__text-layer {
          pointer-events: none !important;
        }
      `}</style>
    </section>
  );
};

export default OfficialDocumentsSection;
