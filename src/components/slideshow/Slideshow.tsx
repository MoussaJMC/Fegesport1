import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SlideImage {
  id: string;
  image_url: string;
  title: string;
  description?: string;
  link?: string;
}

interface SlideshowProps {
  autoplay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  height?: string;
  className?: string;
}

const Slideshow: React.FC<SlideshowProps> = ({
  autoplay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
  height = 'h-[500px]',
  className = ''
}) => {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('slideshow_images')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching slides:', error);
        // Use mock data if there's an error
        setSlides(getMockSlides());
      } else if (data && data.length > 0) {
        setSlides(data);
      } else {
        // No data found, use mock data
        setSlides(getMockSlides());
      }
    } catch (error) {
      console.error('Error in fetchSlides:', error);
      setSlides(getMockSlides());
    } finally {
      setLoading(false);
    }
  };

  const getMockSlides = (): SlideImage[] => {
    return [
      {
        id: '1',
        image_url: 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg',
        title: 'Tournoi National FIFA 25',
        description: 'Les meilleurs joueurs guinéens s\'affrontent pour le titre de champion national'
      },
      {
        id: '2',
        image_url: 'https://images.pexels.com/photos/159393/gamepad-video-game-controller-game-controller-controller-159393.jpeg',
        title: 'Formation des Arbitres Esport',
        description: 'Programme de certification pour les arbitres officiels de la FEGESPORT'
      },
      {
        id: '3',
        image_url: 'https://images.pexels.com/photos/7862608/pexels-photo-7862608.jpeg',
        title: 'Championnat PUBG Mobile',
        description: 'Les meilleures équipes guinéennes s\'affrontent dans une compétition intense'
      }
    ];
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => 
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  }, [slides.length]);

  useEffect(() => {
    if (autoplay && !paused && slides.length > 1) {
      const timer = setInterval(() => {
        nextSlide();
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [autoplay, interval, nextSlide, slides.length, paused]);

  if (loading) {
    return (
      <div className={`${height} bg-gray-800 animate-pulse rounded-lg ${className}`}></div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${height} ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img 
            src={slides[currentIndex].image_url} 
            alt={slides[currentIndex].title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{slides[currentIndex].title}</h3>
            {slides[currentIndex].description && (
              <p className="text-gray-200">{slides[currentIndex].description}</p>
            )}
            {slides[currentIndex].link && (
              <a 
                href={slides[currentIndex].link}
                className="inline-block mt-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                En savoir plus
              </a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
            aria-label="Précédent"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
            aria-label="Suivant"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slideshow;