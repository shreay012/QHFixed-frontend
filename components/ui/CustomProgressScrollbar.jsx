'use client';

import { useState, useEffect, useRef } from 'react';

const CustomProgressScrollbar = ({ 
  scrollContainerRef,
  trackWidth = 5,
  thumbWidth = 16,
  thumbHeight = 34,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      setScrollProgress(progress);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  const scrollToPosition = (clientY) => {
    const scrollContainer = scrollContainerRef?.current;
    const track = trackRef?.current;
    if (!scrollContainer || !track) return;

    const trackRect = track.getBoundingClientRect();
    const localY = clientY - trackRect.top;
    
    const { scrollHeight, clientHeight } = scrollContainer;
    const maxScroll = scrollHeight - clientHeight;
    const availableTrackHeight = trackRect.height - thumbHeight;

    // Adjust for thumb center
    const adjustedY = Math.max(0, Math.min(localY - thumbHeight / 2, availableTrackHeight));
    const newProgress = adjustedY / availableTrackHeight;
    const newScrollOffset = Math.max(0, Math.min(newProgress * maxScroll, maxScroll));

    scrollContainer.scrollTo({ top: newScrollOffset, behavior: 'auto' });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    scrollToPosition(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      scrollToPosition(e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const trackHeight = '100%';
  const trackClientHeight = trackRef.current ? trackRef.current.clientHeight : 0;
  const availableTrackHeight = trackClientHeight - thumbHeight;
  const thumbTop = availableTrackHeight * scrollProgress;
  // Green bar should fill from top to bottom based on scroll progress
  const exploredHeight = trackClientHeight * scrollProgress;

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        right: '8px',
        top: '0',
        width: `${thumbWidth}px`,
        height: trackHeight,
        cursor: 'pointer',
        zIndex: 10,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Full track background (grey) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${trackWidth}px`,
            height: '100%',
            backgroundColor: '#D1D5DB',
            borderRadius: `${trackWidth / 2}px`,
          }}
        />
        
        {/* Explored track (green) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 0,
            width: `${trackWidth}px`,
            height: `${exploredHeight}px`,
            backgroundColor: '#45A735',
            borderRadius: `${trackWidth / 2}px`,
            transition: isDragging ? 'none' : 'height 0.1s ease',
          }}
        />

        {/* Uncomment for visible thumb
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: `${thumbTop}px`,
            width: `${thumbWidth}px`,
            height: `${thumbHeight}px`,
            backgroundColor: '#FFFFFF',
            borderRadius: `${thumbWidth / 2}px`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)',
            transition: isDragging ? 'none' : 'top 0.1s ease',
          }}
        />
        */}
      </div>
    </div>
  );
};

export default CustomProgressScrollbar;
