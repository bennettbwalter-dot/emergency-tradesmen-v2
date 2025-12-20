import { useState, useEffect } from 'react';

export function AvailabilityCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const workImages = [
    "/carousel-images/electrician-1.png",
    "/carousel-images/boiler-engineer.png",
    "/carousel-images/carpenter.png",
    "/carousel-images/plumber.jpg",
    "/carousel-images/insulation-worker.jpg",
    "/carousel-images/electrician-fuse-box.png",
    "/carousel-images/electrician-smoke-alarm.png",
    "/carousel-images/plumber-sink.png",
    "/carousel-images/boiler-repair.png",
    "/carousel-images/electrician-ladder.png",
    "/carousel-images/electrician-fuse-box-2.png",
    "/carousel-images/plumber-bathtub.png",
    "/carousel-images/electrician-socket.png",
    "/carousel-images/boiler-service.png",
    "/carousel-images/boiler-repair-2.png",
    "/carousel-images/plumber-pipes.jpg",
    "/carousel-images/boiler-engineer-2.png",
    "/carousel-images/carpenter-skirting.png",
    "/carousel-images/plumber-radiator-valve.png",
    "/carousel-images/plumber-radiator-2.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % workImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [workImages.length]);

  const getVisibleImages = () => {
    const images = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + workImages.length) % workImages.length;
      images.push({ src: workImages[index], offset: i });
    }
    return images;
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center py-12" style={{ perspective: '1000px' }}>
      <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
        {getVisibleImages().map(({ src, offset }, idx) => {
          const spacing = 300; 
          const translateX = offset * spacing;
          
          let scale = 1;
          let opacity = 1;
          let zIndex = 10;
          let rotateY = 0;

          if (offset === 0) {
            scale = 1.15;
            opacity = 1;
            zIndex = 30;
            rotateY = 0;
          } else if (Math.abs(offset) === 1) {
            scale = 0.95; 
            opacity = 0.8;
            zIndex = 20;
            rotateY = offset * -10;
          } else {
            scale = 0.75;
            opacity = 0.5;
            zIndex = 10;
            rotateY = offset * -15;
          }
          
          return (
            <div
              key={idx}
              className="absolute transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]"
              style={{
                transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                transformStyle: 'preserve-3d',
              }}
            >
              <img
                src={src}
                alt={`Tradesman ${idx + 1}`}
                className="w-64 h-80 object-cover rounded-xl shadow-2xl border-[3px] border-gold/30 hover:border-gold/60 transition-colors"
              />
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-40">
        {workImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentIndex ? 'bg-gold w-8' : 'bg-gray-600 w-1.5 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
