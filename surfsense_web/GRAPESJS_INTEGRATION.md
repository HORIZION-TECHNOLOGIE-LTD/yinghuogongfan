# GrapesJS Preset-Webpage Integration

## Overview

This integration adds the GrapesJS webpage builder with the preset-webpage plugin to SurfSense. The preset-webpage plugin provides ready-to-use webpage components including:

- Navigation bars
- Forms and form elements
- Text blocks and typography
- Image galleries
- Sliders and carousels
- Quote blocks
- Link blocks
- And more...

## Installation

The following packages have been installed:

```json
{
  "grapesjs": "^0.22.14",
  "grapesjs-preset-webpage": "^1.0.3"
}
```

## Security

✅ **Security Check Passed**: No vulnerabilities found in GrapesJS or preset-webpage packages.

### Important Security Considerations

When using the WebpageEditor component in production:

1. **Content Sanitization**: If users can share or publish their created webpages, consider sanitizing the HTML output with a library like DOMPurify to prevent XSS attacks.

2. **Server-Side Validation**: Validate exported content on the server before storing or serving it to other users.

3. **CSP Headers**: When serving exported HTML, implement Content Security Policy headers to restrict script execution.

4. **Trusted Users Only**: The demo export functionality is designed for trusted user scenarios. If implementing multi-tenant or public-facing features, add appropriate safeguards.

Example sanitization with DOMPurify:

```typescript
import DOMPurify from "isomorphic-dompurify";

const handleExport = () => {
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);
  const sanitizedCss = DOMPurify.sanitize(cssContent);
  // ... rest of export logic
};
```

## Components

### WebpageEditor Component

Location: `/components/webpage-editor.tsx`

A reusable React component that wraps GrapesJS with the preset-webpage plugin.

**Props:**
- `initialHtml?: string` - Initial HTML content
- `initialCss?: string` - Initial CSS content
- `onChange?: (html: string, css: string) => void` - Callback when content changes
- `height?: string` - Editor height (default: "100vh")

**Usage:**

```tsx
import WebpageEditor from "@/components/webpage-editor";

function MyPage() {
  const handleChange = (html: string, css: string) => {
    console.log("HTML:", html);
    console.log("CSS:", css);
  };

  return (
    <WebpageEditor
      initialHtml="<h1>Hello World</h1>"
      initialCss="h1 { color: blue; }"
      onChange={handleChange}
      height="600px"
    />
  );
}
```

## Demo Page

A demo page is available at `/webpage-editor-demo` that showcases:

- Full-featured GrapesJS editor with preset-webpage components
- Toggle to view generated HTML/CSS code
- Export functionality to download the webpage as HTML file

**To access:**
```
http://localhost:3000/webpage-editor-demo
```

## Features

### Preset-Webpage Components

The preset includes these ready-to-use blocks:

1. **Link Block** - Styled link elements
2. **Quote Block** - Blockquote formatting
3. **Text Basic** - Basic text formatting
4. **And many more from the full preset**

### Editor Features

- **Drag and Drop**: Intuitive component placement
- **Visual Editing**: WYSIWYG editing experience
- **Responsive Design**: Built-in responsive tools
- **Code View**: Toggle between visual and code view
- **Export**: Export as standalone HTML file

## Integration with SurfSense

The WebpageEditor component can be integrated into:

1. **Document Builder**: Allow users to create webpage documents
2. **Template System**: Create reusable webpage templates
3. **Landing Pages**: Build custom landing pages for spaces
4. **Email Templates**: Design responsive email templates

## Technical Details

### Why Dynamic Import?

The WebpageEditor is imported dynamically with `ssr: false` to avoid server-side rendering issues:

```tsx
const WebpageEditor = dynamic(() => import("@/components/webpage-editor"), {
  ssr: false,
});
```

This is necessary because GrapesJS manipulates the DOM directly and requires a browser environment.

### Styling

The GrapesJS CSS is imported in the component:

```tsx
import "grapesjs/dist/css/grapes.min.css";
```

This provides the default editor styling. Custom themes can be added as needed.

## Development

### Running the Demo

```bash
cd surfsense_web
npm run dev
```

Then navigate to `http://localhost:3000/webpage-editor-demo`

### Building

```bash
npm run build
```

## Future Enhancements

Potential enhancements for this integration:

1. **Storage Integration**: Save/load designs from backend
2. **Custom Components**: Add SurfSense-specific components
3. **Templates Library**: Pre-built webpage templates
4. **Collaboration**: Multi-user editing support
5. **Export Options**: PDF, image, or other formats
6. **Integration with AI**: AI-assisted webpage generation

## Resources

- [GrapesJS Documentation](https://grapesjs.com/docs/)
- [GrapesJS Preset-Webpage Plugin](https://github.com/GrapesJS/preset-webpage)
- [GrapesJS GitHub](https://github.com/GrapesJS/grapesjs)

## License

- GrapesJS: BSD-3-Clause License
- GrapesJS Preset-Webpage: BSD-3-Clause License
