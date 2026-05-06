'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSiteVideo } from '@/lib/hooks/useSiteVideo';

const VideoSectionV3 = () => {
  const tCommon = useTranslations('common');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const videoRef = useRef(null);
  const videoUrl = useSiteVideo('intro');

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Unmute when user manually plays
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleUnmute = (e) => {
    e.stopPropagation(); // Prevent triggering togglePlayPause
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <section 
      className="w-full relative overflow-hidden py-20 md:py-32"
      style={{ 
        backgroundColor: '#26472B',
        backgroundImage: "url('/images/resource-services/book-resource-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-24 flex justify-center">
        <div 
          className="relative w-full max-w-[1000px] aspect-video rounded-[32px] overflow-hidden border-[8px] border-[#45A735] shadow-2xl bg-black"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onClick={togglePlayPause}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Overlay gradient to match image style */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          
          {/* Sound indicator - show when muted */}
          {isMuted && (
            <div 
              className="absolute top-4 right-4 bg-black/60 text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:bg-black/80 transition-colors z-10"
              onClick={handleUnmute}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
              <span>{tCommon('clickToUnmute')}</span>
            </div>
          )}
          
          {/* Play/Pause Button - Only show on hover */}
          {isHovering && (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div 
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform pointer-events-auto"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <svg className="w-10 h-10 text-[#26472B]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-[#26472B] ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoSectionV3;
