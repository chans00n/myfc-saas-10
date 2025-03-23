/**
 * Get responsive image sizes based on the image type
 */
export function getImageSizes(type: 'thumbnail' | 'hero' | 'avatar'): string {
  switch (type) {
    case 'thumbnail':
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
    case 'hero':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw';
    case 'avatar':
      return '48px';
    default:
      return '100vw';
  }
}

/**
 * Generate placeholder image data URL based on color
 */
export function getPlaceholderImage(color: 'indigo' | 'green' | 'amber' | 'rose'): string {
  // Generate a simple color gradient as a base64 encoded SVG
  const colors = {
    indigo: {
      from: '#6366f1',
      to: '#4f46e5'
    },
    green: {
      from: '#22c55e',
      to: '#16a34a'
    },
    amber: {
      from: '#f59e0b',
      to: '#d97706'
    },
    rose: {
      from: '#f43f5e',
      to: '#e11d48'
    }
  };

  const { from, to } = colors[color];
  
  const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop stop-color="${from}" offset="0%"/><stop stop-color="${to}" offset="100%"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/></svg>`;
  
  // Use btoa() for base64 encoding in the browser instead of Buffer
  return `data:image/svg+xml;base64,${btoa(svg)}`;
} 