import React, { useState, useRef, useEffect } from 'react';
import { Disc, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaGalleryProps {
  screenshots: string[];
  trailerUrl?: string; // We will use this when devs upload trailers
}

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

  return (
    <div className="w-full flex flex-col">
      {/* Main Display Area */}
      <div className="mb-4 aspect-video bg-black border border-[#30363D] flex items-center justify-center relative overflow-hidden group">
        {!activeMedia ? (
          <div className="flex flex-col items-center justify-center text-[#484F58] opacity-50">
             <Disc className="h-12 w-12 mb-2" />
             <span className="uppercase tracking-widest text-xs font-bold">NO MEDIA SIGNAL DETECTED</span>
          </div>
        ) : activeMedia.type === 'video' ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#8B949E]">
             <PlayCircle className="h-16 w-16 mb-2 text-emerald-500 opacity-80" />
             <p className="text-sm font-bold tracking-widest uppercase">Video Player Initializing...</p>
             <p className="text-xs">[{activeMedia.url}]</p>
          </div>
        ) : (
          <img src={activeMedia.url} alt="Selected Media" className="w-full h-full object-cover" />
        )}

        {/* Carousel Arrows */}
        {mediaList.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white hover:bg-emerald-500/80 transition-colors opacity-0 group-hover:opacity-100 rounded-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white hover:bg-emerald-500/80 transition-colors opacity-0 group-hover:opacity-100 rounded-sm"
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
              className={`shrink-0 w-32 aspect-video bg-black border ${currentIndex === index ? 'border-emerald-500' : 'border-[#30363D] hover:border-[#8B949E]'} relative overflow-hidden group flex items-center justify-center`}
            >
              {media.type === 'video' ? (
                <>
                  <PlayCircle className="h-8 w-8 text-white opacity-50 group-hover:opacity-100 z-10 relative" />
                  <div className="absolute bottom-1 left-1 bg-black/80 px-1 text-[10px] text-emerald-500 z-10">trailer.mp4</div>
                  <div className="absolute inset-0 bg-[#161b22]"></div>
                </>
              ) : (
                <>
                  <img src={media.url} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                  <div className="absolute bottom-1 left-1 bg-black/80 px-1 text-[10px] text-emerald-500">img_{index}.png</div>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
