import { useEffect } from 'react';
import { getMediaUrl } from '../utils/media';

export default function SEO() {
  useEffect(() => {
    const updateSEO = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          
          // Update Title
          if (settings.siteTitle) {
            document.title = settings.siteTitle;
          }

          // Update Meta Description
          if (settings.siteDescription) {
            let metaDesc: HTMLMetaElement | null = document.querySelector("meta[name='description']");
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.name = 'description';
              document.getElementsByTagName('head')[0].appendChild(metaDesc);
            }
            metaDesc.content = settings.siteDescription;
          }

          // Update Favicon
          if (settings.faviconUrl) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = getMediaUrl(settings.faviconUrl, 'favicon');
          }
        }
      } catch (error) {
        console.error('Failed to update SEO:', error);
      }
    };

    updateSEO();
  }, []);

  return null;
}
