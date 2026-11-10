import React, { useState } from 'react';
import { Disc, PlayCircle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface MediaGalleryProps {
  screenshots: string[];
  trailerUrl?: string;
}

const parseVideoUrl = (url?: string): { type: 'youtube' | 'direct' | 'unknown'; embedUrl: string } => {
  if (!url) return { type: 'unknown', embedUrl: '' };

  // Parse YouTube video ID (supports youtu.be, youtube.com/watch, /embed/, /shorts/)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&rel=0&modestbranding=1`
    };
  }

  // Parse direct raw video files (MP4, WebM, OGG)
  if (/\.(mp4|webm|ogg)($|\?)/i.test(url)) {
    return {
      type: 'direct',
      embedUrl: url
    };
  }

  return {
    type: 'unknown',
    embedUrl: url
  };
};

export default function MediaGallery({ screenshots, trailerUrl }: MediaGalleryProps) {
  const mediaList: { type: 'video' | 'image', url: string }[] = [];
  if (trailerUrl) mediaList.push({ type: 'video', url: trailerUrl });
  if (screenshots && screenshots.length > 0) {
    screenshots.forEach(s => mediaList.push({ type: 'image', url: s }));
  }

  const hasMedia = mediaList.length > 0;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : mediaList.length - 1));
  const handleNext = () => setCurrentIndex(prev => (prev < mediaList.length - 1 ? prev + 1 : 0));

  const activeMedia = hasMedia ? mediaList[currentIndex] : null;
  const videoInfo = activeMedia?.type === 'video' ? parseVideoUrl(activeMedia.url) : null;

  return (
    <div className="w-full flex flex-col font-mono">
      {/* Main Display Area */}
      <div className="mb-4 aspect-video bg-black border border-[#30363D] flex items-center justify-center relative overflow-hidden group">
        {!activeMedia ? (
          <div className="flex flex-col items-center justify-center text-[#484F58] opacity-50">
            <Disc className="h-12 w-12 mb-2" />
            <span className="uppercase tracking-widest text-xs font-bold">NO MEDIA SIGNAL DETECTED</span>
          </div>
        ) : activeMedia.type === 'video' ? (
          videoInfo?.type === 'youtube' ? (
            <div className="w-full h-full relative">
              <iframe
                src={videoInfo.embedUrl}
                title="Official Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : videoInfo?.type === 'direct' ? (
            <div className="w-full h-full relative bg-black flex items-center justify-center">
              <video
                src={videoInfo.embedUrl}
                controls
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
              />
              <a
                href={activeMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-black/85 hover:bg-emerald-500 hover:text-black text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-sm flex items-center gap-1.5 border border-emerald-500/40 transition-all opacity-0 group-hover:opacity-100 z-20"
              >
                DIRECT STREAM <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8B949E] p-6 text-center bg-[#070A0F]">
              <PlayCircle className="h-14 w-14 mb-3 text-emerald-500 animate-pulse" />
              <p className="text-sm font-bold tracking-widest text-white uppercase mb-2">EXTERNAL BROADCAST FEED</p>
              <p className="text-xs text-[#8B949E] max-w-md break-all mb-4 border-l-2 border-emerald-500/40 pl-3 py-1 font-mono">
                {activeMedia.url}
              </p>
              <a
                href={activeMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-all rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                WATCH OFFICIAL TRAILER <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )
        ) : (
          <img src={activeMedia.url} alt="Selected Media" className="w-full h-full object-cover" />
        )}

        {/* Carousel Arrows */}
        {mediaList.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-emerald-500 text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 rounded-sm z-30"
              aria-label="Previous Media"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-emerald-500 text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 rounded-sm z-30"
              aria-label="Next Media"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMedia && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {mediaList.map((media, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentIndex(index)}
              className={`shrink-0 w-32 aspect-video bg-black border ${currentIndex === index ? 'border-emerald-500 ring-1 ring-emerald-500/40' : 'border-[#30363D] hover:border-[#8B949E]'} relative overflow-hidden group flex items-center justify-center transition-all`}
            >
              {media.type === 'video' ? (
                <>
                  <PlayCircle className="h-8 w-8 text-white opacity-70 group-hover:opacity-100 group-hover:text-emerald-400 z-10 relative transition-colors" />
                  <div className="absolute bottom-1 left-1 bg-black/80 px-1 text-[10px] text-emerald-400 z-10 font-mono">trailer.mp4</div>
                  <div className="absolute inset-0 bg-[#161b22]"></div>
                </>
              ) : (
                <>
                  <img src={media.url} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                  <div className="absolute bottom-1 left-1 bg-black/80 px-1 text-[10px] text-emerald-400 z-10 font-mono">img_{index}.png</div>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
