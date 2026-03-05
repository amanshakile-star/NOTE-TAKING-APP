import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PdfViewer({ fileUrl, title }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev + 1));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20">
      {title && (
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 text-center sm:text-left">
          {title}
        </h1>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-slate-400 truncate">
            Viewing PDF{title ? `: ${title}` : ''}
          </p>
          {numPages && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs sm:text-sm text-gray-700 dark:text-slate-200">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={numPages && pageNumber >= numPages}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="py-12 text-center text-gray-600 dark:text-slate-400 text-sm">
                  Loading PDF…
                </div>
              }
              error={
                <div className="py-12 text-center text-red-500 text-sm">
                  Failed to load PDF. Please try again or download it directly.
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={window.innerWidth < 640 ? window.innerWidth - 32 : undefined}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}

