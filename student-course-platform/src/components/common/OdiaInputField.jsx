import { useState } from 'react';
import { Languages, X, ChevronRight } from 'lucide-react';

const OdiaInputField = ({ 
  value, 
  onChange, 
  placeholder = "Type text", 
  className = "",
  as = "input",
  rows = 2,
  ...props 
}) => {
  const Component = as === 'textarea' ? 'textarea' : 'input';

  return (
    <Component
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      style={{ fontFamily: 'Noto Sans Oriya, system-ui, sans-serif' }}
      rows={as === 'textarea' ? rows : undefined}
      {...props}
    />
  );
};

// 🎯 Global Odia Sidebar Component
export const OdiaSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 🎯 Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 bg-blue-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          isOpen ? 'right-96' : 'right-0'
        }`}
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <Languages className="w-5 h-5" />}
      </button>

      {/* 📱 Slide-in Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">🌐 Odia Typing</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {/* 🔄 Persistent Google Input Tools */}
          <iframe
            src="https://www.google.com/inputtools/try/?ime=transliteration_or_t_i0&text="
            className="w-full h-96 border border-gray-300 rounded"
            title="Google Input Tools - Odia"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
          <div className="text-sm text-gray-600 mt-3">
            📋 Type English above → Copy Odia text → Paste into any form field
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default OdiaInputField;