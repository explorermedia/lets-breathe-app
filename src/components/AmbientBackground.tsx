import React, { useEffect, useRef } from 'react';
import { AppTheme } from '../data/themes';

interface AmbientBackgroundProps {
  theme: AppTheme;
  isBreathing: boolean;
  phaseScale?: number; // 0 to 1 scaling factor from the breathing phase
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  targetAlpha: number;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ theme, isBreathing, phaseScale = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 25;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create initial particles
    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 80 + 30, // Large, soft particles
          vx: (Math.random() - 0.5) * 0.15, // Very slow drift
          vy: (Math.random() - 0.5) * 0.15,
          alpha: Math.random() * 0.12 + 0.03, // Semi-transparent
          targetAlpha: Math.random() * 0.12 + 0.03
        });
      }
    };

    createParticles();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move particles
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries with a small buffer
        if (p.x < -p.radius) p.x = canvas.width + p.radius;
        if (p.x > canvas.width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = canvas.height + p.radius;
        if (p.y > canvas.height + p.radius) p.y = -p.radius;

        // Slowly change alpha to create twinkling
        if (Math.random() < 0.005) {
          p.targetAlpha = Math.random() * 0.12 + 0.03;
        }
        p.alpha += (p.targetAlpha - p.alpha) * 0.01;

        // Combine base size with breathing expansion if active
        // When breathing, particles pulse gently
        const sizePulse = isBreathing ? 1 + (phaseScale - 0.5) * 0.15 : 1;
        const currentRadius = p.radius * sizePulse;

        // Draw particle
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, currentRadius
        );
        
        // Use the theme's particle hex color
        const color = theme.particleColor;
        
        // Extract RGB for alpha blending
        let r = 255, g = 255, b = 255;
        if (color.startsWith('#')) {
          const hex = color.replace('#', '');
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isBreathing, phaseScale]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-70"
    />
  );
};
