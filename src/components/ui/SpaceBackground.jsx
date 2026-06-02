import React, { useEffect, useRef } from 'react';

export default function SpaceBackground() {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const nebulasRef = useRef([]);

  useEffect(() => {
    // Generate static stars once on mount
    const stars = [];
    for (let i = 0; i < 180; i++) {
      const x = Math.random();
      // Bias y towards the top (0 is top, 1 is bottom)
      const y = Math.pow(Math.random(), 1.6);
      const isIceBlue = Math.random() < 0.2;
      const color = isIceBlue ? '126, 184, 247' : '255, 255, 255';
      const opacity = 0.15 + Math.random() * 0.4;
      stars.push({ x, y, color, opacity });
    }
    starsRef.current = stars;

    // Generate static nebulas once on mount
    const nebulas = [];
    const nebulaColors = [
      '159, 122, 234', // Deep Violet (#9f7aea)
      '77, 255, 145',  // Deep Teal/Terminal Green (#4dff91)
      '126, 184, 247'  // Ice Blue (#7eb8f7)
    ];
    for (let i = 0; i < 4; i++) {
      const x = Math.random();
      const y = Math.random();
      const radius = 200 + Math.random() * 200; // 200px - 400px
      const color = nebulaColors[i % nebulaColors.length];
      nebulas.push({ x, y, radius, color });
    }
    nebulasRef.current = nebulas;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Draw deep space void background color
      ctx.fillStyle = '#05050f'; // Matches --bg-void
      ctx.fillRect(0, 0, width, height);

      // Draw nebulas
      nebulasRef.current.forEach((nebula) => {
        const gradX = nebula.x * width;
        const gradY = nebula.y * height;
        
        try {
          const gradient = ctx.createRadialGradient(
            gradX, gradY, 0,
            gradX, gradY, nebula.radius
          );
          gradient.addColorStop(0, `rgba(${nebula.color}, 0.025)`);
          gradient.addColorStop(0.5, `rgba(${nebula.color}, 0.01)`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(gradX, gradY, nebula.radius, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {
          // Safe catch for potential gradient errors
        }
      });

      // Draw stars
      starsRef.current.forEach((star) => {
        const sx = star.x * width;
        const sy = star.y * height;
        ctx.fillStyle = `rgba(${star.color}, ${star.opacity})`;
        ctx.fillRect(sx, sy, 1, 1);
      });
    };

    window.addEventListener('resize', handleResize);
    // Initial paint
    handleResize();

    // A tiny timeout check in case initialization happened before canvas size settled
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
}
