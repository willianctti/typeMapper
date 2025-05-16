"use client";

import React from 'react';
import { motion } from 'framer-motion';
import TypeMapper from './components/TypeMapper';
import AnimatedBackground from './components/AnimatedBackground';
import SnakeAnimation from './components/SnakeAnimation';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatedBackground />
        <SnakeAnimation />
      </div>
      
      <header className="relative z-10 w-full max-w-5xl pt-6 pb-2 px-6 backdrop-blur-md bg-black/5 dark:bg-white/5 rounded-b-2xl">
        <h1 
          className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent drop-shadow-sm"
          style={{
            textShadow: '0 0 30px rgba(168, 85, 247, 0.4), 0 0 15px rgba(138, 75, 217, 0.3)'
          }}
        >
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="inline-block"
          >
            TypeMapper
          </motion.span>
        </h1>
        <p className="text-center mt-2 opacity-80 text-sm">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Transforme objetos javascript em definições TypeScript com facilidade
          </motion.span>
        </p>
      </header>

      <div className="relative z-10 flex-1 w-full max-w-5xl py-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card rounded-lg p-1 overflow-hidden shadow-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <TypeMapper />
        </motion.div>
      </div>

      <footer className="relative z-10 flex justify-center items-center w-full max-w-5xl py-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-xs flex items-center gap-2"
        >
          Built with
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, repeatType: 'loop', duration: 2, repeatDelay: 1 }}
          >
            ❤️
          </motion.span>
          by
          <motion.a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline decoration-dashed underline-offset-4 transition-colors hover:text-indigo-500 dark:hover:text-cyan-400"
            whileHover={{ y: -1 }}
          >
            Will
          </motion.a>
        </motion.div>
      </footer>
    </main>
  );
}
