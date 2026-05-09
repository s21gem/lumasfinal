/**
 * Utility to convert various media links (like Google Drive) into direct links 
 * that can be used in <img> and <video> tags.
 */
export const getMediaUrl = (url: string | null | undefined, type: 'image' | 'video' | 'auto' = 'auto'): string => {
  if (!url) return '';
  
  // 1. Google Drive conversion
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    
    // Determine if it's a video
    let isVideo = type === 'video';
    if (type === 'auto') {
      isVideo = url.toLowerCase().includes('video') || 
                url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) !== null;
    }

    if (isVideo) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Direct image endpoint
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  // 2. Add other conversions here if needed (e.g. Dropbox, etc.)
  
  return url;
};
