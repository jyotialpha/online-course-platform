import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import progressService from '../../services/progressService';

const SecurePDFViewer = ({ pdfUrl, className, courseId, chapterId }) => {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    console.log('SecurePDFViewer mounted with props:', { pdfUrl, courseId, chapterId });
    loadPDF();
    setStartTime(Date.now());
  }, [pdfUrl]);

  // Track time spent and update progress when component unmounts
  useEffect(() => {
    return () => {
      if (startTime && courseId && chapterId) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60);
        console.log('Updating progress:', { courseId, chapterId, timeSpent });
        if (timeSpent > 0) {
          progressService.updateChapterProgress(courseId, chapterId, timeSpent)
            .then(result => console.log('Progress updated successfully:', result))
            .catch(error => console.error('Failed to update progress:', error));
        }
      }
    };
  }, [startTime, courseId, chapterId]);

  // Also update progress periodically while viewing
  useEffect(() => {
    if (!startTime || !courseId || !chapterId) return;

    const interval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60);
      if (timeSpent > 0) {
        console.log('Periodic progress update:', { courseId, chapterId, timeSpent });
        progressService.updateChapterProgress(courseId, chapterId, timeSpent)
          .then(result => console.log('Periodic progress updated:', result))
          .catch(error => console.error('Periodic progress update failed:', error));
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime, courseId, chapterId]);

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
    const isMobile = window.innerWidth < 640;
    
    let finalScale = scale;
    
    if (isMobile) {
      const containerWidth = container.clientWidth - 16;
      const pageViewport = page.getViewport({ scale: 1 });
      const fitScale = containerWidth / pageViewport.width;
      
      if (scale < fitScale) {
        finalScale = Math.min(fitScale, 2.0);
      }
    }
    
    const viewport = page.getViewport({ scale: finalScale });
    
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
      <div className="flex flex-col sm:flex-row items-center gap-2 p-2 sm:p-3 bg-gray-700 border-b border-gray-600">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage <= 1}
            className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-xs"
          >
            First
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 sm:p-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
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
              className="w-10 sm:w-12 px-1 sm:px-2 py-1 bg-gray-600 text-white text-center text-xs sm:text-sm rounded border-none outline-none"
            />
            <span className="text-white text-xs sm:text-sm">/ {totalPages}</span>
          </div>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 sm:p-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-xs"
          >
            Last
          </button>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
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
            <span className="text-white text-xs px-1 sm:px-2">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-1 hover:bg-gray-500 rounded">
              <ZoomIn className="w-3 h-3 text-white" />
            </button>
            <button onClick={resetZoom} className="p-1 hover:bg-gray-500 rounded">
              <RotateCcw className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={scrollContainerRef} 
        className="flex-1 overflow-auto p-0 sm:p-4 bg-gray-900" 
        style={{ 
          maxHeight: 'calc(100vh - 180px)',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <canvas
              ref={canvasRef}
              className="sm:border sm:border-gray-600 sm:rounded sm:shadow-lg max-w-full w-full"
              onContextMenu={(e) => e.preventDefault()}
              onSelectStart={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                display: 'block',
                touchAction: 'pan-x pan-y'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurePDFViewer;