import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Loader2, AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface SecureDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentTitle: string;
}

const SecureDocumentViewer: React.FC<SecureDocumentViewerProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentTitle,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setPageNumber(1);
      setScale(1.0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, documentUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowLeft' && pageNumber > 1) {
        previousPage();
      }
      if (e.key === 'ArrowRight' && pageNumber < numPages) {
        nextPage();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, pageNumber, numPages]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);

    let errorMessage = 'Impossible de charger le document PDF';

    if (error.message.includes('404') || error.message.includes('Not Found')) {
      errorMessage = 'Le document n\'a pas été trouvé. Veuillez vérifier que le fichier existe.';
    } else if (error.message.includes('CORS')) {
      errorMessage = 'Erreur de chargement du document. Veuillez réessayer.';
    } else if (error.message.includes('Invalid PDF')) {
      errorMessage = 'Le fichier PDF est invalide ou corrompu.';
    }

    setError(errorMessage);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(1, newPage), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">
              {documentTitle}
            </h3>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleOpenInNewTab}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {!error && !isLoading && numPages > 0 && (
            <div className="flex items-center justify-between p-3 border-b bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700 min-w-[100px] text-center">
                  Page {pageNumber} / {numPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700 min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  disabled={scale >= 2.0}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className="relative flex-1 overflow-auto bg-gray-100 flex items-center justify-center"
          >
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <p className="text-gray-600">Chargement du document...</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-8">
                <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
                <p className="text-gray-800 font-semibold text-lg mb-2 text-center">{error}</p>
                <p className="text-gray-600 text-sm mb-6 text-center max-w-md">
                  Si vous êtes administrateur, vérifiez que le fichier a bien été téléchargé dans la page d'administration des documents.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleOpenInNewTab}
                    className="btn-primary"
                  >
                    Ouvrir dans un nouvel onglet
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            <Document
              file={documentUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              error=""
              className="flex justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          </div>

          <div className="bg-gray-800 text-white text-xs py-2 px-4 text-center flex-shrink-0">
            Document protégé - Lecture seule
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SecureDocumentViewer;
