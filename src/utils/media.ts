/**
 * Utility to convert various media links (like Google Drive) into direct links 
 * that can be used in <img> and <video> tags, and to optimize Cloudinary URLs.
 */
export const getMediaUrl = (url: string | null | undefined, type: 'image' | 'video' | 'logo' | 'favicon' | 'auto' = 'auto'): string => {
  if (!url) return '';
  
  // 1. Resolve basic media URL first (handles Google Drive conversion)
  let resolvedUrl = url;
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    let isVideo = type === 'video';
    if (type === 'auto') {
      isVideo = url.toLowerCase().includes('video') || 
                url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) !== null;
    }

    resolvedUrl = isVideo 
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  // 2. Apply Cloudinary Transformations or Fetch Proxy
  const cloudName = "dyyrjhuho"; // Your cloud name from .env

  if (resolvedUrl.includes('res.cloudinary.com')) {
    // Existing Cloudinary URL
    if (type === 'logo') {
      return resolvedUrl.replace('/upload/', '/upload/q_auto,f_auto,e_trim,h_160,c_limit/');
    } else if (type === 'favicon') {
      return resolvedUrl.replace('/upload/', '/upload/q_auto,f_auto,w_64,h_64,c_fill,g_center/');
    } else if (!resolvedUrl.includes('/upload/q_auto')) {
      return resolvedUrl.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    return resolvedUrl;
  } else if (type === 'logo' || type === 'favicon') {
    // External URL (like Drive or other) used as logo/favicon -> Proxy via Cloudinary Fetch
    const transformation = type === 'logo' 
      ? 'q_auto,f_auto,e_trim,h_160,c_limit' 
      : 'q_auto,f_auto,w_64,h_64,c_fill,g_center';
    
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformation}/${encodeURIComponent(resolvedUrl)}`;
  }
  
  return resolvedUrl;
};
