/**
 * Utility function to return appropriate sizes attribute for Next.js Image component
 * based on the container type
 */
export const getImageSizes = (containerType: string): string => {
  switch (containerType) {
    case 'thumbnail':
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
    case 'profile':
      return "(max-width: 640px) 80px, 120px";
    case 'hero':
      return "100vw";
    case 'avatar':
      return "(max-width: 640px) 40px, 48px";
    default:
      return "100vw";
  }
};

/**
 * Get placeholder blur data URL for different color themes
 */
export const getPlaceholderImage = (color: string = 'indigo'): string => {
  const colors: Record<string, string> = {
    indigo: '4f46e5',
    blue: '3b82f6',
    gray: '6b7280',
    black: '171717',
  };
  
  const hex = colors[color] || colors.indigo;
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='100%25' height='100%25' fill='%23${hex}'/%3E%3C/svg%3E`;
}; 