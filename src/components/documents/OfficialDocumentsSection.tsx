import React, { useState, useEffect, useRef } from 'react';
import { FileText, Lock } from 'lucide-react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { supabase } from '../../lib/supabase';

interface OfficialDocument {
  id: string;
  label_fr: string;
  label_en: string | null;
  description: string | null;
  icon: string;
  lang: string;
  group_name: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_published: boolean;
  sort_order: number;
}

const OfficialDocumentsSection: React.FC = () => {
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pdfCache = useRef(new Map<string, string>());

  const selectedDocument = selectedId
    ? documents.find(doc => doc.id === selectedId)
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

  useEffect(() => {
    fetchDocuments();

    const channel = supabase
      .channel('docs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'official_documents'
      }, () => {
        fetchDocuments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('official_documents')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    const currentIndex = documents.findIndex(doc => doc.id === selectedId);
    const nextIndex = (currentIndex + 1) % documents.length;
    const nextDoc = documents[nextIndex];
    if (nextDoc?.file_url && !pdfCache.current.has(nextDoc.id)) {
      fetch(nextDoc.file_url, { method: 'GET' })
        .then(() => pdfCache.current.set(nextDoc.id, nextDoc.file_url!))
        .catch(() => {});
    }
  }, [selectedId, documents]);

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

  const groupedDocuments: { [key: string]: OfficialDocument[] } = {};
  documents.forEach(doc => {
    const group = doc.group_name || 'Other';
    if (!groupedDocuments[group]) {
      groupedDocuments[group] = [];
    }
    groupedDocuments[group].push(doc);
  });

  if (loading) {
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {[1,2,3,4,5,6,7].map(i => (
              <div
                key={i}
                style={{
                  height: '80px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite'
                }}
              />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </section>
    );
  }

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

        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun document disponible
              </h3>
              <p className="text-gray-600">
                Les documents seront publiés prochainement
              </p>
            </div>
          </div>
        ) : (
          <>
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
                              {doc.label_fr}
                            </h3>
                            <p className={`text-xs ${
                              selectedId === doc.id ? 'text-white/90' : 'text-gray-600'
                            }`}>
                              {doc.description || 'Document officiel'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

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
            ) : selectedDocument.file_url ? (
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
                        <h3 className="font-semibold text-gray-900">{selectedDocument.label_fr}</h3>
                        <p className="text-gray-600 text-sm">{selectedDocument.description || 'Document officiel'}</p>
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
                        fileUrl={selectedDocument.file_url}
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
                    {selectedDocument.label_fr}
                  </h3>
                  <p className="text-gray-600 mb-6">{selectedDocument.description || 'Document officiel'}</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      Document en cours de numérisation — disponible prochainement
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
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

        .rpv-download__button,
        .rpv-print__button,
        button[aria-label*="Download"],
        button[aria-label*="Print"],
        button[aria-label*="Télécharger"],
        button[aria-label*="Imprimer"] {
          display: none !important;
        }

        .rpv-core__viewer * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .rpv-core__text-layer {
          pointer-events: none !important;
        }
      `}</style>
    </section>
  );
};

export default OfficialDocumentsSection;
