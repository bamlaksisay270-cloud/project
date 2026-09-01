import React, { useRef, useEffect, useState } from 'react';
import ethiopianFarmlandSunrise from 'src/assets/images/vid.mp4';

interface HeroVideoPlayerProps {
  onExploreMarket?: () => void;
  onOpenRegister?: () => void;
}

export const HeroVideoPlayer: React.FC<HeroVideoPlayerProps> = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback if browser policy blocks autoplay with sound (ensure muted)
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div className="w-full h-[380px] sm:h-[480px] md:h-[540px] lg:h-[600px] relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-zinc-200/90 shadow-xl shadow-zinc-900/10 bg-black">
        {/* HTML5 High-Performance Video Player */}
        <video
          ref={videoRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
          poster={ethiopianFarmlandSunrise}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover object-center"
        />

        {/* Fallback image if video fails to load */}
        {videoError && (
          <img
            src={ethiopianFarmlandSunrise}
            alt="Ethiopian Farmland Landscape"
            className="absolute inset-0 w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </section>
  );
};
