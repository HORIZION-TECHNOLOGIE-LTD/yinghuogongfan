'use client';

import { useEffect, useRef, useState } from 'react';
import 'grapesjs/dist/css/grapes.min.css';

interface GrapesJSEditor {
  destroy: () => void;
}

/**
 * GrapesJSEditorWithTabs Component
 * 
 * A Next.js-compatible wrapper for GrapesJS editor with the tabs plugin.
 * This component handles dynamic imports to avoid SSR issues and provides
 * a basic editor configuration with tabs support.
 * 
 * @example
 * ```tsx
 * import GrapesJSEditorWithTabs from '@/components/grapesjs/GrapesJSEditorWithTabs';
 * 
 * export default function EditorPage() {
 *   return <GrapesJSEditorWithTabs />;
 * }
 * ```
 */
export default function GrapesJSEditorWithTabs() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let editor: GrapesJSEditor | null = null;

    const initEditor = async () => {
      try {
        // Dynamic imports to avoid SSR issues
        const grapesjs = (await import('grapesjs')).default;
        const grapesjsTabs = (await import('grapesjs-tabs')).default;

        if (!editorRef.current) return;

        editor = grapesjs.init({
          container: editorRef.current,
          height: '100vh',
          width: 'auto',
          
          // Add the tabs plugin
          plugins: [grapesjsTabs],
          
          // Configure the tabs plugin
          pluginsOpts: {
            'grapesjs-tabs': {
              tabsBlock: {
                category: 'Extra',
                label: 'Tabs',
              },
            },
          },

          // Storage configuration - disabled by default for security
          storageManager: false,

          // Canvas configuration (no external CDN for security)
          canvas: {
            styles: [],
          },

          // Block manager configuration
          blockManager: {
            appendTo: '#blocks',
          },

          // Style manager configuration
          styleManager: {
            appendTo: '#styles',
            sectors: [
              {
                name: 'General',
                buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
              },
              {
                name: 'Typography',
                buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'text-align'],
              },
              {
                name: 'Dimension',
                buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
              },
              {
                name: 'Decorations',
                buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background'],
              },
            ],
          },

          // Layer manager configuration
          layerManager: {
            appendTo: '#layers',
          },

          // Device manager configuration
          deviceManager: {
            devices: [
              {
                id: 'desktop',
                name: 'Desktop',
                width: '',
              },
              {
                id: 'tablet',
                name: 'Tablet',
                width: '768px',
                widthMedia: '992px',
              },
              {
                id: 'mobile',
                name: 'Mobile',
                width: '320px',
                widthMedia: '480px',
              },
            ],
          },
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize GrapesJS editor:', err);
        setError(err instanceof Error ? err.message : 'Failed to load editor');
        setIsLoading(false);
      }
    };

    initEditor();

    // Cleanup
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Failed to Load Editor
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex">
      {/* Side panel - Blocks */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-3 text-sm text-gray-700">Blocks</h3>
        <div id="blocks" />
      </div>
      
      {/* Main editor canvas */}
      <div className="flex-1 flex flex-col">
        <div ref={editorRef} className="flex-1" />
      </div>
      
      {/* Side panel - Styles and Layers */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-sm text-gray-700">Styles</h3>
          <div id="styles" />
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm text-gray-700">Layers</h3>
          <div id="layers" />
        </div>
      </div>
    </div>
  );
}
