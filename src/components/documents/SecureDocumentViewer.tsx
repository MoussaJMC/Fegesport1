import React, { useEffect, useState } from 'react';
import { X, FileText, Lock, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecureDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentTitle: string;
}

export default function SecureDocumentViewer({
  isOpen,
  onClose,
  documentUrl,
  documentTitle
}: SecureDocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [viewerUrl, setViewerUrl] = useState('');

  useEffect(() => {
    if (isOpen && documentUrl) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);

      const encodedUrl = encodeURIComponent(documentUrl);
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;

      setViewerUrl(googleDocsUrl);

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
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
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full max-w-7xl max-h-[95vh] m-4 bg-white rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={handleContextMenu}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">{documentTitle}</h2>
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <Lock className="w-3 h-3" />
                    <span>Document protégé - Lecture seule</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenInNewTab}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Ouvrir dans un nouvel onglet"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Fermer le document"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="relative w-full h-[calc(100%-5rem)] bg-gray-100">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 mb-2">Chargement du document...</p>
                    <p className="text-sm text-gray-500">Cela peut prendre quelques secondes</p>
                  </div>
                </div>
              )}

              {viewerUrl && (
                <iframe
                  src={viewerUrl}
                  className="w-full h-full border-0"
                  title={documentTitle}
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                  onContextMenu={handleContextMenu}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'transparent',
                  userSelect: 'none'
                }}
                onContextMenu={handleContextMenu}
              />
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Document protégé en lecture seule</span>
                </div>
                <button
                  onClick={handleOpenInNewTab}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ouvrir en plein écran
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
