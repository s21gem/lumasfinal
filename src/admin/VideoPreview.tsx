import React from 'react';
import { getMediaUrl } from '../utils/media';

interface VideoPreviewProps {
  url: string;
  className?: string;
}

export default function VideoPreview({ url, className = "" }: VideoPreviewProps) {
  if (!url) return null;

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isDrive = url.includes('drive.google.com');

  if (isYouTube) {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    const videoId = ytMatch ? ytMatch[1] : '';
    if (videoId) {
      return (
        <div className={`relative aspect-video ${className}`}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
  }

  if (isDrive) {
    const drivePreviewUrl = url.replace('/view', '/preview').replace('/edit', '/preview');
    return (
      <div className={`relative aspect-video ${className}`}>
        <iframe
          src={drivePreviewUrl}
          className="absolute inset-0 w-full h-full rounded-xl"
          allow="autoplay"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video overflow-hidden rounded-xl bg-black ${className}`}>
      <video
        src={getMediaUrl(url, 'video')}
        className="w-full h-full object-contain"
        controls
        muted
      />
    </div>
  );
}
