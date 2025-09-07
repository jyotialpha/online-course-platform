import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';

const SecurePDFViewer = ({ pdfUrl, className }) => {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPDF();
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToPage(totalPages);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const loadPDF = async () => {
    if (!window.pdfjsLib || !pdfUrl) return;
    
    setLoading(true);
    try {
      const pdf = await window.pdfjsLib.getDocument({
        url: pdfUrl,
        httpHeaders: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;

    const page = await pdfDoc.getPage(pageNum);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    // Calculate scale to fit container width
    const containerWidth = container.clientWidth - 32; // Account for padding
    const pageViewport = page.getViewport({ scale: 1 });
    const calculatedScale = Math.min(scale, containerWidth / pageViewport.width);
    
    const viewport = page.getViewport({ scale: calculatedScale });
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.5);

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -300, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl overflow-hidden ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between p-3 bg-gray-700 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage <= 1}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-xs"
          >
            First
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <ChevronUp className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  goToPage(page);
                }
              }}
              className="w-12 px-2 py-1 bg-gray-600 text-white text-center text-sm rounded border-none outline-none"
            />
            <span className="text-white text-sm">/ {totalPages}</span>
          </div>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-xs"
          >
            Last
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-600 rounded p-1">
            <button onClick={scrollUp} className="p-1 hover:bg-gray-500 rounded" title="Scroll Up">
              <ArrowUp className="w-3 h-3 text-white" />
            </button>
            <button onClick={scrollDown} className="p-1 hover:bg-gray-500 rounded" title="Scroll Down">
              <ArrowDown className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-1 bg-gray-600 rounded p-1">
            <button onClick={zoomOut} className="p-1 hover:bg-gray-500 rounded">
              <ZoomOut className="w-3 h-3 text-white" />
            </button>
            <span className="text-white text-xs px-2">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-1 hover:bg-gray-500 rounded">
              <ZoomIn className="w-3 h-3 text-white" />
            </button>
            <button onClick={resetZoom} className="p-1 hover:bg-gray-500 rounded">
              <RotateCcw className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Canvas */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto p-4 bg-gray-900" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-600 rounded shadow-lg"
              onContextMenu={(e) => e.preventDefault()}
              onSelectStart={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                display: 'block'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurePDFViewer;