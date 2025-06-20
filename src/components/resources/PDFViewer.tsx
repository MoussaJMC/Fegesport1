import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose }) => {
  const { t, i18n } = useTranslation();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(t('common.error'));
    setLoading(false);
    toast.error(t('common.error'));
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="text-lg font-semibold">
            {loading ? t('common.loading') : `Page ${pageNumber} sur ${numPages}`}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-auto p-4 flex flex-col items-center">
          {error ? (
            <div className="text-center text-red-600 py-8">
              <p>{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                {t('common.backHome')}
              </button>
            </div>
          ) : (
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
                loading={
                  <div className="animate-pulse bg-gray-200 h-[842px] w-[595px]" />
                }
              />
            </Document>
          )}
        </div>
        
        {!error && numPages && (
          <div className="p-4 border-t flex justify-center items-center space-x-4">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="btn bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="mr-1" />
              {i18n.language === 'fr' ? 'Précédent' : 'Previous'}
            </button>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="btn bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {i18n.language === 'fr' ? 'Suivant' : 'Next'}
              <ChevronRight size={20} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;