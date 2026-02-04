import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface SponsorLogo {
  id: string;
  name: string;
  logo_url: string;
  alt_text: string;
  order_index: number;
}

const SponsorsCarousel: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [logos, setLogos] = useState<SponsorLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSponsors();

    const subscription = supabase
      .channel('sponsors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsors' }, () => {
        fetchSponsors();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || logos.length === 0) {
    return null;
  }

  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="sponsor-carousel-wrapper">
      <style>{`
        .sponsor-carousel-wrapper {
          width: 100%;
          height: 140px;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
        }

        .sponsor-carousel-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
        }

        .sponsor-carousel-track {
          display: flex;
          align-items: center;
          gap: 50px;
          animation: scroll-left 45s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        .sponsor-carousel-track.paused {
          animation-play-state: paused;
        }

        @keyframes scroll-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }

        .sponsor-logo-item {
          flex-shrink: 0;
          width: 160px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .sponsor-logo-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sponsor-logo-item:hover::before {
          opacity: 1;
        }

        .sponsor-logo-item:hover {
          transform: scale(1.15) translateZ(0);
        }

        .sponsor-logo-item:hover .logo-image {
          filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))
                  drop-shadow(0 0 40px rgba(255, 0, 255, 0.4));
        }

        .logo-image {
          max-width: 100%;
          max-height: 50px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: brightness(0.9) contrast(1.1) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
          transition: filter 0.3s ease, transform 0.3s ease;
        }

        .sponsor-carousel-fade-left,
        .sponsor-carousel-fade-right {
          position: absolute;
          top: 0;
          width: 150px;
          height: 100%;
          pointer-events: none;
          z-index: 10;
        }

        .sponsor-carousel-fade-left {
          left: 0;
          background: linear-gradient(90deg, #0f0f23 0%, transparent 100%);
        }

        .sponsor-carousel-fade-right {
          right: 0;
          background: linear-gradient(270deg, #1a1a3a 0%, transparent 100%);
        }

        /* Responsive: Mobile vertical carousel */
        @media (max-width: 768px) {
          .sponsor-carousel-wrapper {
            height: auto;
            padding: 30px 0;
          }

          .sponsor-carousel-track {
            flex-direction: column;
            animation: scroll-up 30s linear infinite;
            gap: 30px;
          }

          @keyframes scroll-up {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(0, -33.333%, 0);
            }
          }

          .sponsor-logo-item {
            width: 140px;
            height: 70px;
          }

          .sponsor-carousel-fade-left {
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 50px;
            background: linear-gradient(180deg, #0f0f23 0%, transparent 100%);
          }

          .sponsor-carousel-fade-right {
            bottom: 0;
            left: 0;
            right: 0;
            top: auto;
            width: 100%;
            height: 50px;
            background: linear-gradient(0deg, #1a1a3a 0%, transparent 100%);
          }
        }

        /* Accessibility: Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .sponsor-carousel-track {
            animation: none;
          }

          .sponsor-logo-item:hover {
            transform: scale(1.05) translateZ(0);
          }
        }

        /* Dark elegant styling - subtle shadows */
        .sponsor-logo-item::after {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 16px;
          background: radial-gradient(
            circle at center,
            rgba(0, 212, 255, 0) 0%,
            rgba(0, 212, 255, 0) 70%,
            rgba(0, 212, 255, 0.15) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .sponsor-logo-item:hover::after {
          opacity: 1;
        }
      `}</style>

      <div className="sponsor-carousel-container">
        {/* Fade overlays for smooth edges */}
        <div className="sponsor-carousel-fade-left" aria-hidden="true" />
        <div className="sponsor-carousel-fade-right" aria-hidden="true" />

        {/* Scrolling track */}
        <div
          ref={scrollRef}
          className={`sponsor-carousel-track ${isPaused ? 'paused' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          role="list"
          aria-label="Tournament sponsors and partners"
        >
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="sponsor-logo-item"
              role="listitem"
            >
              <img
                src={logo.logo_url}
                alt={logo.alt_text}
                className="logo-image"
                loading="lazy"
                draggable="false"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorsCarousel;
