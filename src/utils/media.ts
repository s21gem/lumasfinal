/**
 * Utility to convert various media links (like Google Drive) into direct links 
 * that can be used in <img> and <video> tags, and to optimize Cloudinary URLs.
 */
export const getMediaUrl = (url: string | null | undefined, type: 'image' | 'video' | 'logo' | 'favicon' | 'team' | 'auto' = 'auto'): string => {
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
    } else if (type === 'team') {
      return resolvedUrl.replace('/upload/', '/upload/q_auto,f_auto,w_800,h_1000,c_fill,g_face/');
    } else if (!resolvedUrl.includes('/upload/q_auto')) {
      return resolvedUrl.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    return resolvedUrl;
  } else if (type === 'logo' || type === 'favicon' || type === 'team') {
    // External URL (like Drive or other) used as logo/favicon/team -> Proxy via Cloudinary Fetch
    let transformation = 'q_auto,f_auto';
    if (type === 'logo') transformation = 'q_auto,f_auto,e_trim,h_160,c_limit';
    if (type === 'favicon') transformation = 'q_auto,f_auto,w_64,h_64,c_fill,g_center';
    if (type === 'team') transformation = 'q_auto,f_auto,w_800,h_1000,c_fill,g_face';
    
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformation}/${encodeURIComponent(resolvedUrl)}`;
  }
  
  return resolvedUrl;
};
