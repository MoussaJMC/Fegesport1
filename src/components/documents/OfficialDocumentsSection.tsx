import React, { useState, useEffect } from 'react';
import { FileText, Lock } from 'lucide-react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { supabase } from '../../lib/supabase';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

interface OfficialDocument {
  id: string;
  title: string;
  document_type: string;
  file_url: string;
  description: string | null;
}

const OfficialDocumentsSection: React.FC = () => {
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<OfficialDocument | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('official_documents')
        .select('id, title, document_type, file_url, description')
        .eq('is_active', true)
        .eq('is_current_version', true)
        .order('display_order');

      if (error) throw error;

      setDocuments(data || []);
      if (data && data.length > 0) {
        setSelectedDocument(data[0]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (documents.length === 0) {
    return null;
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

        <div className="mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedDocument?.id === doc.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                {doc.title}
              </button>
            ))}
          </div>
        </div>

        {selectedDocument && (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="relative">
              <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                <Lock className="w-3.5 h-3.5" />
                Lecture seule
              </div>

              {selectedDocument.description && (
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <p className="text-gray-700 text-sm">{selectedDocument.description}</p>
                </div>
              )}

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
                    fileUrl={selectedDocument.file_url}
                    plugins={[defaultLayoutPluginInstance]}
                  />
                </Worker>
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
