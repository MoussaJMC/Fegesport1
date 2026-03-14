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
  lang: string;
  url: string;
  group?: string;
}

const officialDocuments: OfficialDocument[] = [
  {
    id: "statuts-fr",
    label: "Statuts de la Fédération",
    description: "Document officiel — Version française",
    icon: "📋",
    lang: "FR",
    url: "",
    group: "Textes Fondateurs",
  },
  {
    id: "statuts-en",
    label: "Federation Statutes",
    description: "Official document — English version",
    icon: "📋",
    lang: "EN",
    url: "",
    group: "Textes Fondateurs",
  },
  {
    id: "reglement-fr",
    label: "Règlement Intérieur",
    description: "Document officiel — Version française",
    icon: "📜",
    lang: "FR",
    url: "",
    group: "Textes Fondateurs",
  },
  {
    id: "reglement-en",
    label: "Internal Regulations",
    description: "Official document — English version",
    icon: "📜",
    lang: "EN",
    url: "",
    group: "Textes Fondateurs",
  },
  {
    id: "rapport-annuel",
    label: "Rapport Annuel",
    description: "Rapport annuel d'activités FEGESPORT",
    icon: "📊",
    lang: "FR",
    url: "",
    group: "Rapports & Plans",
  },
  {
    id: "plan-strategique",
    label: "Plan Stratégique",
    description: "Plan stratégique de développement FEGESPORT",
    icon: "🎯",
    lang: "FR",
    url: "",
    group: "Rapports & Plans",
  },
  {
    id: "programme-jeunes",
    label: "Programme Développement Jeunes",
    description: "Programme d'inclusion et de développement — 2026–2029",
    icon: "🌍",
    lang: "FR/EN",
    url: "",
    group: "Rapports & Plans",
  },
];

const OfficialDocumentsSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pdfCache = useRef(new Map<string, string>());

  const selectedDocument = selectedId
    ? officialDocuments.find(doc => doc.id === selectedId)
    : null;

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
    if (!selectedId) return;
    const currentIndex = officialDocuments.findIndex(doc => doc.id === selectedId);
    const nextIndex = (currentIndex + 1) % officialDocuments.length;
    const nextDoc = officialDocuments[nextIndex];
    if (nextDoc.url && !pdfCache.current.has(nextDoc.id)) {
      fetch(nextDoc.url, { method: 'GET' })
        .then(() => pdfCache.current.set(nextDoc.id, nextDoc.url))
        .catch(() => {});
    }
  }, [selectedId]);

  const getFileUrl = (doc: OfficialDocument) => {
    if (!doc.url) return null;
    return doc.url;
  };

  const renderLanguageBadge = (lang: string) => {
    if (lang === "FR/EN") {
      return (
        <div className="absolute top-2 right-2 flex gap-0.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-l-full bg-[#C0392B] text-white">
            FR
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-r-full bg-[#2E75B6] text-white">
            EN
          </span>
        </div>
      );
    }

    const bgColor = lang === "FR" ? "#C0392B" : "#2E75B6";
    return (
      <span
        className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
        style={{ backgroundColor: bgColor }}
      >
        {lang}
      </span>
    );
  };

  // Group documents by their group property
  const groupedDocuments: { [key: string]: OfficialDocument[] } = {};
  officialDocuments.forEach(doc => {
    const group = doc.group || 'Other';
    if (!groupedDocuments[group]) {
      groupedDocuments[group] = [];
    }
    groupedDocuments[group].push(doc);
  });

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

        {/* Grid Layout for Document Tabs with Groups */}
        <div className="mb-8">
          {Object.entries(groupedDocuments).map(([groupName, docs]) => (
            <div key={groupName} className="mb-6">
              <div className="w-full py-2 mb-3 border-b border-gray-300">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  {groupName}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedId(doc.id)}
                    className={`relative p-4 rounded-lg transition-all duration-200 text-left ${
                      selectedId === doc.id
                        ? 'bg-[#C0392B] text-white shadow-lg border-2 border-[#C0392B]'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {renderLanguageBadge(doc.lang)}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{doc.icon}</span>
                      <div className="flex-1 min-w-0 pr-12">
                        <h3 className={`font-semibold text-sm mb-1 ${
                          selectedId === doc.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {doc.label}
                        </h3>
                        <p className={`text-xs ${
                          selectedId === doc.id ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PDF Viewer, Placeholder, or Welcome Screen */}
        {!selectedDocument ? (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden flex items-center justify-center" style={{ height: '300px' }}>
            <div className="text-center max-w-md mx-auto px-6">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sélectionnez un document pour le consulter
              </h3>
              <p className="text-sm text-gray-600">
                Tous les documents sont en lecture seule
              </p>
            </div>
          </div>
        ) : selectedDocument.url ? (
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
                className="pdf-viewer-wrapper h-[350px] sm:h-[450px] lg:h-[650px]"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <Worker key={selectedDocument.id} workerUrl={pdfjsWorker}>
                  <Viewer
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
