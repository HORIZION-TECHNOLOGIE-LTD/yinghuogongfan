# GrapesJS Integration Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     SurfSense Application                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├── Frontend (Next.js 15 + React 19)
                              │   │
                              │   ├── WebpageEditor Component
                              │   │   ├── GrapesJS Core (v0.22.14)
                              │   │   └── Preset-Webpage Plugin (v1.0.3)
                              │   │
                              │   ├── Demo Page (/webpage-editor-demo)
                              │   │   ├── Visual Editor View
                              │   │   ├── Code View (HTML/CSS)
                              │   │   └── Export Function
                              │   │
                              │   └── Integration Points (Future)
                              │       ├── Document Management
                              │       ├── Template Library
                              │       └── Landing Page Builder
                              │
                              └── Backend (FastAPI) - Optional Integration
                                  ├── Save/Load Webpage Designs
                                  ├── Template Storage
                                  └── Publishing Endpoint
```

## Component Flow

### 1. Editor Initialization

```
User Opens Editor
     │
     ├─> Dynamic Import (client-side only)
     │
     ├─> Initialize GrapesJS with preset-webpage
     │    ├─> Load default blocks
     │    ├─> Setup canvas
     │    └─> Configure plugins
     │
     └─> Load initial content (if provided)
          ├─> HTML components
          └─> CSS styles
```

### 2. Editing Workflow

```
User Interacts with Editor
     │
     ├─> Drag & Drop Components
     │    └─> Navbar, Forms, Text, Images, etc.
     │
     ├─> Visual Editing
     │    ├─> Resize elements
     │    ├─> Style modifications
     │    └─> Content updates
     │
     └─> onChange Callback Triggered
          ├─> Get HTML: editor.getHtml()
          ├─> Get CSS: editor.getCss()
          └─> Pass to parent component
```

### 3. Content Management

```
Content Export/Save
     │
     ├─> Export as HTML file (Demo)
     │    ├─> Combine HTML + CSS
     │    ├─> Create blob
     │    └─> Trigger download
     │
     └─> Save to Backend (Future)
          ├─> POST /api/v1/webpages
          ├─> Store in database
          └─> Return webpage ID
```

## File Structure

```
surfsense_web/
├── components/
│   └── webpage-editor.tsx          # Main editor component
├── app/
│   └── webpage-editor-demo/
│       └── page.tsx                # Demo page
├── GRAPESJS_INTEGRATION.md         # Detailed documentation
└── package.json                     # Dependencies

docs/
└── GRAPESJS_QUICKSTART.md          # Quick start guide
```

## Data Flow

### Simple Usage (Demo)

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Browser   │────────>│  WebpageEditor   │────────>│  GrapesJS    │
│  (User)     │<────────│   Component      │<────────│   Engine     │
└─────────────┘         └──────────────────┘         └──────────────┘
      │                         │
      │                         │ onChange(html, css)
      │                         ↓
      │                  ┌──────────────┐
      │                  │  State Mgmt  │
      │                  │ (useState)   │
      │                  └──────────────┘
      │                         │
      │ Export HTML              │
      └─────────────────────────┘
```

### With Backend Integration (Future)

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser   │────>│  WebpageEditor   │────>│  API Client  │────>│   Backend    │
│  (User)     │<────│   Component      │<────│  (fetch)     │<────│   (FastAPI)  │
└─────────────┘     └──────────────────┘     └──────────────┘     └──────────────┘
                            │                                              │
                            │ onChange(html, css)                          │
                            ↓                                              ↓
                    ┌──────────────┐                              ┌────────────────┐
                    │  State Mgmt  │                              │   PostgreSQL   │
                    │ (useState)   │                              │   Database     │
                    └──────────────┘                              └────────────────┘
                            │
                            │ Save/Load
                            ↓
                    ┌──────────────┐
                    │  localStorage│
                    │  or Backend  │
                    └──────────────┘
```

## API Surface

### WebpageEditor Props

```typescript
interface WebpageEditorProps {
  initialHtml?: string;        // Default: ""
  initialCss?: string;         // Default: ""
  onChange?: (html, css) => void;  // Optional callback
  height?: string;             // Default: "100vh"
}
```

### GrapesJS Instance Methods (Available via ref)

```typescript
editor.getHtml()              // Get current HTML
editor.getCss()               // Get current CSS
editor.setComponents(html)    // Set HTML content
editor.setStyle(css)          // Set CSS content
editor.on('update', callback) // Listen to changes
editor.destroy()              // Cleanup
```

## Integration Patterns

### Pattern 1: Standalone Editor

```tsx
// Simple standalone editor page
<WebpageEditor height="100vh" />
```

### Pattern 2: Controlled Component

```tsx
// Editor with external state management
const [html, setHtml] = useState("");
const [css, setCss] = useState("");

<WebpageEditor
  initialHtml={html}
  initialCss={css}
  onChange={(newHtml, newCss) => {
    setHtml(newHtml);
    setCss(newCss);
  }}
/>
```

### Pattern 3: With Backend Persistence

```tsx
// Editor with save/load functionality
const [html, setHtml] = useState("");
const [css, setCss] = useState("");

useEffect(() => {
  // Load from backend
  fetch(`/api/v1/webpages/${id}`)
    .then(res => res.json())
    .then(data => {
      setHtml(data.html);
      setCss(data.css);
    });
}, [id]);

const handleSave = async () => {
  await fetch(`/api/v1/webpages/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ html, css }),
  });
};

<WebpageEditor
  initialHtml={html}
  initialCss={css}
  onChange={(newHtml, newCss) => {
    setHtml(newHtml);
    setCss(newCss);
  }}
/>
<button onClick={handleSave}>Save</button>
```

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│              Content Security Layers                │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Client     │ │   Server     │ │   Storage    │
│  Validation  │ │  Validation  │ │  Isolation   │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        ├─ DOMPurify    ├─ Input       ├─ User-specific
        │  Sanitize     │  Validation  │  storage
        │               │               │
        ├─ CSP Headers  ├─ HTML        ├─ Access
        │               │  Sanitize    │  control
        │               │               │
        └─ Trusted      └─ Rate        └─ Encryption
           sources         limiting        at rest
```

## Performance Considerations

1. **Dynamic Import**: Editor loaded only when needed (code splitting)
2. **No SSR**: Avoid server-side rendering overhead
3. **Lazy Loading**: GrapesJS loaded on-demand
4. **Change Throttling**: Consider debouncing onChange for heavy operations

```typescript
// Example: Debounced onChange
const debouncedOnChange = useMemo(
  () => debounce((html, css) => {
    // Save to backend or state
  }, 1000),
  []
);

<WebpageEditor onChange={debouncedOnChange} />
```

## Dependencies Graph

```
surfsense_web
    │
    ├── grapesjs@0.22.14
    │   ├── backbone@1.4.1
    │   ├── backbone-undo@0.2.6
    │   ├── codemirror@5.63.0
    │   ├── codemirror-formatting@1.0.0
    │   ├── html-entities@~1.4.0
    │   ├── promise-polyfill@8.3.0
    │   ├── underscore@1.13.1
    │   └── @types/backbone@1.4.15
    │
    └── grapesjs-preset-webpage@1.0.3
        └── (peer: grapesjs)
```

## Next Steps for Integration

1. **Test Locally**: Start dev server and test at `/webpage-editor-demo`
2. **Add Backend API**: Create endpoints for webpage CRUD operations
3. **Integrate with Documents**: Add webpage type to document system
4. **Create Templates**: Build template library with pre-made designs
5. **AI Integration**: Connect with LLM for AI-powered webpage generation
6. **Add Collaboration**: Implement real-time multi-user editing
7. **Deployment**: Configure for production with proper CSP headers

## Resources

- **Component Code**: `components/webpage-editor.tsx`
- **Demo Code**: `app/webpage-editor-demo/page.tsx`
- **Full Docs**: `surfsense_web/GRAPESJS_INTEGRATION.md`
- **Quick Start**: `docs/GRAPESJS_QUICKSTART.md`
- **GrapesJS Docs**: https://grapesjs.com/docs/
- **Preset Docs**: https://github.com/GrapesJS/preset-webpage
