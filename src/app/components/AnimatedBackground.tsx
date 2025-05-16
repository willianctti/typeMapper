"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    
    const isDark = theme === 'dark';
    
    const colors = isDark 
      ? ['#111827', '#1e3a8a', '#312e81', '#111827'] 
      : ['#e0f2fe', '#bfdbfe', '#dbeafe', '#e0f2fe'];
    
    const circles: Circle[] = [];
    
    for (let i = 0; i < 20; i++) {
      circles.push(createRandomCircle(canvas.width, canvas.height, colors));
    }
    
    function createRandomCircle(maxWidth: number, maxHeight: number, colorPalette: string[]) {
      return {
        x: Math.random() * maxWidth,
        y: Math.random() * maxHeight,
        radius: Math.random() * 100 + 50,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        alpha: Math.random() * 0.2 + 0.1,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
      };
    }
    
    function animate() {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      circles.forEach(circle => {
        circle.x += Math.cos(circle.angle) * circle.speed;
        circle.y += Math.sin(circle.angle) * circle.speed;
        
        if (circle.x < -circle.radius || circle.x > canvas.width + circle.radius) {
          circle.angle = Math.PI - circle.angle;
        }
        if (circle.y < -circle.radius || circle.y > canvas.height + circle.radius) {
          circle.angle = -circle.angle;
        }
        
        const gradient = ctx.createRadialGradient(
          circle.x, circle.y, 0,
          circle.x, circle.y, circle.radius
        );
        gradient.addColorStop(0, `${circle.color}00`);
        gradient.addColorStop(0.5, `${circle.color}${Math.floor(circle.alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${circle.color}00`);
        
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [theme]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ filter: 'blur(60px)' }}
    />
  );
};

interface Circle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  speed: number;
  angle: number;
}

export default AnimatedBackground; 