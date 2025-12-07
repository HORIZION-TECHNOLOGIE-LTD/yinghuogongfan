import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with GrapesJS
const GrapesJSEditorWithTabs = dynamic(
  () => import('@/components/grapesjs/GrapesJSEditorWithTabs'),
  { ssr: false }
);

/**
 * GrapesJS Editor Demo Page
 * 
 * This page demonstrates the GrapesJS editor with tabs plugin integration.
 * Access this page at: /grapesjs-demo
 * 
 * The editor includes:
 * - Tabs component block (drag from Blocks panel)
 * - Full visual editor with style manager
 * - Device preview (Desktop/Tablet/Mobile)
 * - Layers management
 */
export default function GrapesJSDemoPage() {
  return (
    <div className="h-screen w-full">
      <GrapesJSEditorWithTabs />
    </div>
  );
}
