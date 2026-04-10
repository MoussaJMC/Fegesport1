import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: React.ReactNode;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  label,
  icon,
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [lastAnimatedEnd, setLastAnimatedEnd] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate when visible AND end value changes (or first load)
  useEffect(() => {
    if (isVisible && end > 0 && end !== lastAnimatedEnd) {
      setLastAnimatedEnd(end);
      animateCount(end);
    }
  }, [isVisible, end]);

  const animateCount = (targetEnd: number) => {
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(targetEnd * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <div
      ref={ref}
      className="text-center p-6 md:p-8 rounded-xl bg-dark-800 border border-dark-700 hover:border-fed-gold-500/30 transition-all duration-300"
    >
      {icon && (
        <div className="mb-4 flex justify-center">
          <div className="w-14 h-14 rounded-full bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center text-fed-red-500">
            {icon}
          </div>
        </div>
      )}
      <div className="text-4xl md:text-5xl font-bold font-heading text-gradient-gold mb-2">
        {prefix}{count}{suffix}
      </div>
      <div className="text-light-300 text-sm md:text-base font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

export default AnimatedCounter;
