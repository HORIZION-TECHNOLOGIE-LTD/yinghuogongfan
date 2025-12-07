# GrapesJS Tabs Component Integration

## Overview

The GrapesJS Tabs component plugin (`grapesjs-tabs`) has been added to the project dependencies. This plugin adds tabbed interface functionality to GrapesJS web builder.

## Dependencies Added

- **grapesjs**: ^0.22.14 - The core GrapesJS web builder framework
- **grapesjs-tabs**: ^1.0.6 - The tabs component plugin for GrapesJS

## What is GrapesJS Tabs?

GrapesJS Tabs is a plugin that adds a tabbed interface component to the GrapesJS editor. It provides:

- **Components**:
  - `tabs` - Main tabs component
  - `tab-container` - Component which contains single tabs
  - `tab` - Single tab component
  - `tab-content` - Tab's content
  - `tab-contents` - Component containing tab contents
  
- **Blocks**:
  - `tabs` - Pre-built tabs block that can be dragged into the editor

## Installation

The dependencies have been added to `package.json` and installed with:

```bash
cd surfsense_web
npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` flag is used due to React 19 being newer than some peer dependencies expect.

## Basic Usage

When GrapesJS is integrated into the application, the tabs plugin can be used as follows:

### Client-Side Implementation

```typescript
'use client';

import { useEffect, useRef } from 'react';
import 'grapesjs/dist/css/grapes.min.css';

export default function GrapesJSEditorWithTabs() {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const initEditor = async () => {
      const grapesjs = (await import('grapesjs')).default;
      const grapesjsTabs = (await import('grapesjs-tabs')).default;

      if (editorRef.current) {
        const editor = grapesjs.init({
          container: editorRef.current,
          plugins: [grapesjsTabs],
          pluginsOpts: {
            'grapesjs-tabs': {
              // Plugin options
              tabsBlock: { 
                category: 'Extra' 
              },
            }
          },
          height: '100vh',
          width: 'auto',
          storageManager: false,
        });

        return editor;
      }
    };

    initEditor();
  }, []);

  return <div ref={editorRef} />;
}
```

### Plugin Options

The tabs plugin accepts various configuration options:

```typescript
{
  // Tabs block options
  tabsBlock: {
    category: 'Extra',
    label: 'Tabs',
  },
  
  // Default number of tabs
  defaultTabs: 3,
  
  // Tab selector CSS prefix
  selectorTab: 'tab',
  
  // Custom styling
  style: `
    .tab {
      padding: 10px 20px;
      cursor: pointer;
    }
    .tab.tab-active {
      background-color: #007bff;
      color: white;
    }
  `,
}
```

## Integration with SurfSense

To integrate GrapesJS with tabs into the SurfSense application:

1. **Create a new page route** (e.g., `/app/dashboard/[search_space_id]/website-builder/page.tsx`)

2. **Import and use the GrapesJS editor component**:

```typescript
import dynamic from 'next/dynamic';

const GrapesJSEditor = dynamic(
  () => import('@/components/grapesjs/GrapesJSEditorWithTabs'),
  { ssr: false }
);

export default function WebsiteBuilderPage() {
  return (
    <div className="h-screen w-full">
      <GrapesJSEditor />
    </div>
  );
}
```

3. **Add navigation** to the new page in the sidebar

## Features Provided by Tabs Plugin

- **Drag-and-drop tabs block**: Users can drag the tabs component into the editor
- **Configurable tabs**: Add, remove, or reorder tabs visually
- **Content editing**: Each tab can contain rich content (text, images, etc.)
- **Responsive design**: Tabs adapt to different screen sizes
- **Styling options**: Customize tab appearance through the style manager

## Example Tab Structure

When a tabs component is added to the editor, it creates the following HTML structure:

```html
<div class="tabs">
  <div class="tab-container">
    <div class="tab tab-active">Tab 1</div>
    <div class="tab">Tab 2</div>
    <div class="tab">Tab 3</div>
  </div>
  <div class="tab-contents">
    <div class="tab-content tab-content-active">
      Content for Tab 1
    </div>
    <div class="tab-content">
      Content for Tab 2
    </div>
    <div class="tab-content">
      Content for Tab 3
    </div>
  </div>
</div>
```

## Security Notes

- **No known vulnerabilities**: Both `grapesjs` (v0.22.14) and `grapesjs-tabs` (v1.0.6) have no known security vulnerabilities
- **Content sanitization**: When saving user-generated content from the editor, ensure proper sanitization
- **Access control**: Implement appropriate access controls for the website builder feature

## Next Steps

1. Create a dedicated component for the GrapesJS editor
2. Integrate it into a new page in the dashboard
3. Add API endpoints to save/load editor content
4. Implement export functionality to generate standalone HTML
5. Add more GrapesJS plugins as needed (forms, blocks, etc.)

## Resources

- [GrapesJS Documentation](https://grapesjs.com/docs/)
- [GrapesJS Tabs Plugin GitHub](https://github.com/GrapesJS/components-tabs)
- [GrapesJS Demo](https://grapesjs.com/demo.html)
- [GrapesJS API Reference](https://grapesjs.com/docs/api/)

## License

- GrapesJS: BSD-3-Clause
- GrapesJS Tabs: BSD-3-Clause
