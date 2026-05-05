# Images Directory Structure

This directory contains all static images from the original React project.

## Folders:

- `homepage/` - Images used on the homepage sections
- `resource-services/` - Images used in the booking flow
- `vibe-coding.jpg` - Vibe coding section image
- `vibe-coding.png` - Alternative vibe coding image

## Next.js Image Optimization

The following images should use Next.js `<Image />` component for optimization:

### High Priority (Above the fold):
- `homepage/hero-bg.jpg` (if exists)
- `homepage/hero-image.png` (if exists)
- `vibe-coding.jpg`

### Medium Priority (In viewport):
- All homepage section images
- Resource service icons

### Low Priority (Below the fold):
- Background images
- Decorative images

## Image Usage Examples:

```tsx
// Before: Regular img tag
<img src="/images/vibe-coding.jpg" alt="Vibe Coding" />

// After: Next.js Image component
import Image from 'next/image';

<Image
  src="/images/vibe-coding.jpg"
  alt="Vibe Coding"
  width={800}
  height={600}
  priority={true} // For above-the-fold images
/>
```
