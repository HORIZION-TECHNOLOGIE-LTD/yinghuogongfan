# Background Snippets and Image Cropping Integration

This document describes the new frontend features added to SurfSense: background snippets and image cropping functionality.

## Features

### 1. Background Snippets

A collection of modern, ready-to-use background patterns inspired by [bg.ibelick](https://github.com/ibelick/background-snippets). These backgrounds are crafted with Tailwind CSS and include:

- **Light Mode Backgrounds**: Gradients and grid patterns optimized for light themes
- **Dark Mode Backgrounds**: Stylish dark gradients and grid effects
- **Combined Effects**: Grid patterns with gradient overlays

#### Usage

```tsx
import { BACKGROUND_OPTIONS } from "@/components/backgrounds";

// Use in your component
<div className="relative">
  <div className="fixed inset-0 -z-10">
    {BACKGROUND_OPTIONS[0].component}
  </div>
  {/* Your content */}
</div>
```

#### Background Selector Component

For interactive background selection:

```tsx
import { BackgroundSelector } from "@/components/backgrounds";

<BackgroundSelector 
  onBackgroundChange={(bg) => {
    // Handle background change
    console.log("Selected:", bg?.name);
  }}
/>
```

### 2. Image Cropping

An intuitive image cropping component built with `react-easy-crop`, featuring:

- Drag and drop file upload
- Interactive crop area with zoom controls
- Adjustable aspect ratios
- Real-time preview
- Support for JPG, PNG, and WEBP formats
- File size validation

#### Usage

```tsx
import { ImageUploadWithCrop } from "@/components/ui/image-upload-with-crop";

<ImageUploadWithCrop
  onImageReady={(file) => {
    // Handle the cropped image file
    console.log("Cropped image ready:", file);
  }}
  aspectRatio={16 / 9}  // Optional, default is 1 (square)
  maxSizeMB={10}        // Optional, default is 10MB
/>
```

#### Direct Image Cropper

For cropping existing images:

```tsx
import { ImageCropper } from "@/components/ui/image-cropper";

<ImageCropper
  image={imageDataUrl}
  onCropComplete={(blob) => {
    // Handle cropped image blob
  }}
  onCancel={() => {
    // Handle cancel
  }}
  aspectRatio={1}
  cropShape="rect" // or "round"
/>
```

## Demo Page

Visit `/demo` to see both features in action. The demo page includes:

- Interactive background selector with live preview
- Image upload and cropping interface
- Feature documentation

## Installation

The required dependencies have already been installed:

```json
{
  "react-easy-crop": "^5.0.8"
}
```

## Components Structure

```
surfsense_web/
├── components/
│   ├── backgrounds/
│   │   ├── background-snippets.tsx    # Background component definitions
│   │   ├── background-selector.tsx    # Interactive selector
│   │   └── index.ts                   # Barrel export
│   └── ui/
│       ├── image-cropper.tsx          # Core cropping component
│       └── image-upload-with-crop.tsx # Upload + crop workflow
└── app/
    └── (home)/
        └── demo/
            └── page.tsx               # Demo page
```

## Benefits

### Background Snippets
- **No External Dependencies**: Pure Tailwind CSS
- **Performance**: Lightweight, CSS-only animations
- **Theme Support**: Built-in light and dark mode variants
- **Customizable**: Easy to modify with Tailwind utilities

### Image Cropping
- **User-Friendly**: Intuitive drag-to-crop interface
- **Flexible**: Adjustable aspect ratios and zoom
- **Quality**: High-quality output with canvas rendering
- **Validation**: Built-in file size and type checking

## Integration Examples

### Adding Background to Homepage

```tsx
import { BACKGROUND_OPTIONS } from "@/components/backgrounds";

export function HomePage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        {BACKGROUND_OPTIONS[5].component}
      </div>
      {/* Page content */}
    </div>
  );
}
```

### Adding Image Crop to File Upload

```tsx
import { ImageUploadWithCrop } from "@/components/ui/image-upload-with-crop";

export function ProfilePictureUpload() {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    
    await fetch("/api/upload-avatar", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <ImageUploadWithCrop
      onImageReady={handleUpload}
      aspectRatio={1}
      maxSizeMB={5}
    />
  );
}
```

## Browser Compatibility

- **Background Snippets**: Works in all modern browsers supporting CSS gradients and masks
- **Image Cropping**: Requires modern browsers with Canvas API support
  - Chrome 4+
  - Firefox 3.6+
  - Safari 3.1+
  - Edge (all versions)

## Performance Considerations

1. **Background Snippets**: CSS-only animations are GPU-accelerated and performant
2. **Image Cropping**: Canvas operations are synchronous; large images may cause brief UI freezes
3. **File Size**: Recommended to keep image uploads under 10MB for optimal performance

## Future Enhancements

Potential improvements for future iterations:

- [ ] Additional background patterns
- [ ] Background animation controls
- [ ] Batch image cropping
- [ ] Advanced crop shapes (custom polygons)
- [ ] Image filters and adjustments
- [ ] Server-side image optimization integration

## Credits

- Background snippets inspired by [ibelick/background-snippets](https://github.com/ibelick/background-snippets)
- Image cropping powered by [react-easy-crop](https://www.npmjs.com/package/react-easy-crop)
