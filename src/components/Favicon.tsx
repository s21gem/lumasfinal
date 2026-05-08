import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          if (settings.faviconUrl) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = settings.faviconUrl;
          }
        }
      } catch (error) {
        console.error('Failed to update favicon:', error);
      }
    };

    updateFavicon();
  }, []);

  return null;
}
