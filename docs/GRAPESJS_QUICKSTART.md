# GrapesJS Webpage Builder - Quick Start Guide

## What was added?

The GrapesJS webpage builder with the preset-webpage plugin has been integrated into SurfSense. This provides a visual, drag-and-drop webpage editor with ready-to-use components.

## Quick Demo

**Access the demo page:**
```bash
cd surfsense_web
npm run dev
# Open http://localhost:3000/webpage-editor-demo
```

## Using the WebpageEditor Component

### Basic Usage

```tsx
import dynamic from "next/dynamic";

// Must use dynamic import with ssr: false
const WebpageEditor = dynamic(() => import("@/components/webpage-editor"), {
  ssr: false,
});

function MyPage() {
  return <WebpageEditor height="600px" />;
}
```

### With Content Management

```tsx
import { useState } from "react";
import dynamic from "next/dynamic";

const WebpageEditor = dynamic(() => import("@/components/webpage-editor"), {
  ssr: false,
});

function MyPage() {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");

  const handleSave = async () => {
    await fetch("/api/save-webpage", {
      method: "POST",
      body: JSON.stringify({ html, css }),
    });
  };

  return (
    <>
      <WebpageEditor
        initialHtml={html}
        initialCss={css}
        onChange={(newHtml, newCss) => {
          setHtml(newHtml);
          setCss(newCss);
        }}
      />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

## Available Components (from preset-webpage)

The editor includes these ready-to-use blocks:

- **Link Block**: Styled hyperlinks
- **Quote Block**: Blockquote styling
- **Text Basic**: Basic text formatting
- **Forms**: Input fields, buttons, form elements
- **Images**: Image placeholders and galleries
- **Navigation**: Navbar components
- **Containers**: Section and container blocks

## Features

✅ **Drag & Drop**: Intuitive component placement  
✅ **Responsive**: Built-in responsive design tools  
✅ **Visual Editing**: WYSIWYG editor  
✅ **Code Export**: Clean HTML/CSS generation  
✅ **No Vulnerabilities**: Security checked  

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialHtml` | `string` | `""` | Initial HTML content |
| `initialCss` | `string` | `""` | Initial CSS styles |
| `onChange` | `(html: string, css: string) => void` | - | Callback when content changes |
| `height` | `string` | `"100vh"` | Editor container height |

## Important Notes

1. **Dynamic Import Required**: Always use `dynamic()` with `ssr: false` to avoid server-side rendering issues
2. **CSS Import**: GrapesJS CSS is automatically included
3. **Browser Only**: The editor requires a browser environment and won't work in SSR

## Integration Ideas

- **Document Builder**: Allow users to create rich webpage documents
- **Template System**: Pre-built webpage templates
- **Landing Pages**: Custom landing pages for search spaces
- **Email Templates**: Responsive email designs
- **AI Integration**: Combine with AI to generate webpage layouts

## Troubleshooting

**Editor doesn't appear**:
- Ensure you're using `dynamic()` import with `ssr: false`
- Check browser console for errors

**Styles look broken**:
- Verify GrapesJS CSS is loaded
- Check for CSS conflicts with your theme

**Content not saving**:
- Implement the `onChange` callback
- Store content in state or backend

## More Information

For detailed documentation, see: [`surfsense_web/GRAPESJS_INTEGRATION.md`](surfsense_web/GRAPESJS_INTEGRATION.md)

## Resources

- [GrapesJS Documentation](https://grapesjs.com/docs/)
- [Preset-Webpage Plugin](https://github.com/GrapesJS/preset-webpage)
- [Demo Source Code](surfsense_web/app/webpage-editor-demo/page.tsx)
