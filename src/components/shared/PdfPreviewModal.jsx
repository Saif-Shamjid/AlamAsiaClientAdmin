import { useState, useRef } from "react";
import {
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress,
  FaTimes,
  FaPrint,
} from "react-icons/fa";

const PdfPreviewModal = ({ isOpen, onClose, document }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const canvasRef = useRef(null);

  // PDF.js worker
  const pdfjsLib = window["pdfjs-dist/build/pdf"];
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  // Function to render PDF page
  const renderPage = (pageNum, pdfDoc) => {
    pdfDoc.getPage(pageNum).then(function (page) {
      const viewport = page.getViewport({ scale: scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
    });
  };

  // Load and render PDF when document changes
  useState(() => {
    if (document && isOpen) {
      const loadingTask = pdfjsLib.getDocument(
        `http://31.97.70.167:3000/${document.fileUrl}`
      );
      loadingTask.promise.then(
        function (pdfDoc) {
          setNumPages(pdfDoc.numPages);
          renderPage(currentPage, pdfDoc);
        },
        function (reason) {
          console.error("Error: ", reason);
        }
      );
    }
  }, [document, isOpen, currentPage, scale]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(scale + 0.25);
  };

  const zoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.25);
    }
  };

  const resetZoom = () => {
    setScale(1);
  };

  const downloadPdf = () => {
    if (document) {
      const link = document.createElement("a");
      link.href = `http://31.97.70.167:3000/${document.fileUrl}`;
      link.download = document.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printPdf = () => {
    window.open(`http://31.97.70.167:3000/${document.fileUrl}`, "_blank");
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {document.name}
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadPdf}
              className="p-2 text-gray-600 hover:text-blue-600"
              title="Download"
            >
              <FaDownload />
            </button>
            <button
              onClick={printPdf}
              className="p-2 text-gray-600 hover:text-blue-600"
              title="Print"
            >
              <FaPrint />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600"
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4">
          <canvas ref={canvasRef} className="max-w-full max-h-full shadow-md" />
        </div>

        {/* Controls */}
        <div className="p-4 border-t bg-white flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FaChevronLeft />
            </button>

            <span className="mx-2 text-sm">
              Page {currentPage} of {numPages || "--"}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="Zoom Out"
            >
              <FaCompress />
            </button>

            <span className="text-sm">{Math.round(scale * 100)}%</span>

            <button
              onClick={zoomIn}
              className="p-2 rounded hover:bg-gray-100"
              title="Zoom In"
            >
              <FaExpand />
            </button>

            <button
              onClick={resetZoom}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
