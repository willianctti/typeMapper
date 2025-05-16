"use client";

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Stars } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-3 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-md"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      initial={false}
      animate={isDark ? "dark" : "light"}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        variants={{
          light: { 
            background: "radial-gradient(circle, rgba(255,212,59,0.2) 0%, rgba(255,255,255,0) 70%)" 
          },
          dark: { 
            background: "radial-gradient(circle, rgba(103,93,204,0.2) 0%, rgba(0,0,0,0) 70%)" 
          }
        }}
      />
      
      <motion.div 
        className="relative z-10"
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.5 }}
      >
        {isDark ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Stars size={20} className="text-indigo-300" />
            <Moon size={20} className="text-indigo-400 absolute top-0 left-0 opacity-80" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={20} className="text-amber-500" />
          </motion.div>
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle; 