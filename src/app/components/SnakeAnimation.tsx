"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const SnakeAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const snakeRef = useRef<Array<{ x: number, y: number }>>([]);
  const animationRef = useRef<number>(0);
  const { theme } = useTheme();
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    mouseRef.current = { 
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      initSnake();
    };
    
    const initSnake = () => {
      const segments = [];
      const totalSegments = 25;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < totalSegments; i++) {
        segments.push({ x: centerX, y: centerY });
      }
      
      snakeRef.current = segments;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    const render = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme === 'dark' 
        ? 'rgba(17, 24, 39, 0.01)' 
        : 'rgba(249, 250, 251, 0.01)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const segments = snakeRef.current;
      
      if (segments.length > 0) {
        const head = segments[0];
        const mouse = mouseRef.current;
        
        const dx = mouse.x - head.x;
        const dy = mouse.y - head.y;
        
        const speed = 0.05;
        head.x += dx * speed;
        head.y += dy * speed;
        
        for (let i = segments.length - 1; i > 0; i--) {
          const current = segments[i];
          const prev = segments[i - 1];
          
          const followSpeed = 0.3;
          current.x += (prev.x - current.x) * followSpeed;
          current.y += (prev.y - current.y) * followSpeed;
        }
      }
      
      segments.forEach((segment, index) => {
        const isDark = theme === 'dark';
        const size = 20 - (index * 0.5);
        const alpha = 1 - (index / segments.length * 0.6);
        
        let fillColor, glowColor;
        
        if (isDark) {
          if (index < 8) {
            fillColor = `rgba(99, 102, 241, ${alpha * 0.9})`;
            glowColor = `rgba(139, 92, 246, ${alpha * 0.5})`;
          } else if (index < 16) {
            fillColor = `rgba(236, 72, 153, ${alpha * 0.8})`;
            glowColor = `rgba(219, 39, 119, ${alpha * 0.4})`;
          } else {
            fillColor = `rgba(16, 185, 129, ${alpha * 0.7})`;
            glowColor = `rgba(5, 150, 105, ${alpha * 0.3})`;
          }
        } else {
          if (index < 8) {
            fillColor = `rgba(79, 70, 229, ${alpha * 0.7})`;
            glowColor = `rgba(67, 56, 202, ${alpha * 0.3})`;
          } else if (index < 16) {
            fillColor = `rgba(239, 68, 68, ${alpha * 0.6})`;
            glowColor = `rgba(220, 38, 38, ${alpha * 0.25})`;
          } else {
            fillColor = `rgba(16, 185, 129, ${alpha * 0.5})`;
            glowColor = `rgba(5, 150, 105, ${alpha * 0.2})`;
          }
        }
        
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isDark ? 15 : 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.arc(segment.x, segment.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        if (index === 0) {
          ctx.shadowBlur = isDark ? 25 : 15;
          ctx.beginPath();
          ctx.fillStyle = isDark 
            ? 'rgba(255, 255, 255, 0.7)' 
            : 'rgba(255, 255, 255, 0.9)';
          ctx.arc(segment.x, segment.y, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      ctx.shadowBlur = 0;
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    animationRef.current = requestAnimationFrame(render);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
};

export default SnakeAnimation; 