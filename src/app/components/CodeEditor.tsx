"use client";

import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardCopy, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, useAnimation } from 'framer-motion';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
  title: string;
  error?: string | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder = 'Enter code here...',
  readOnly = false,
  title,
  error
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const borderControls = useAnimation();
  const glowControls = useAnimation();
  
  useEffect(() => {
    const animateBorderGlow = async () => {
      while (true) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.random() * 5000 + 3000)
        );
        
        const side = Math.floor(Math.random() * 4);
        const position = Math.random() * 100;
        const duration = Math.random() * 1.5 + 0.8;
        
        let glowPosition = {};
        let borderPosition = {};
        
        switch (side) {
          case 0: // top
            glowPosition = { 
              top: "-20px", 
              left: `${position}%`, 
              width: "150px", 
              height: "80px" 
            };
            borderPosition = { borderTopColor: ["", "var(--glow-color)", ""] };
            break;
          case 1: // right
            glowPosition = { 
              top: `${position}%`, 
              right: "-20px", 
              width: "80px", 
              height: "150px" 
            };
            borderPosition = { borderRightColor: ["", "var(--glow-color)", ""] };
            break;
          case 2: // bottom
            glowPosition = { 
              bottom: "-20px", 
              left: `${position}%`, 
              width: "150px", 
              height: "80px" 
            };
            borderPosition = { borderBottomColor: ["", "var(--glow-color)", ""] };
            break;
          case 3: // left
            glowPosition = { 
              top: `${position}%`, 
              left: "-20px", 
              width: "80px", 
              height: "150px" 
            };
            borderPosition = { borderLeftColor: ["", "var(--glow-color)", ""] };
            break;
        }
        
        glowControls.start({
          opacity: [0, 0.3, 0],
          ...glowPosition,
          transition: {
            duration: duration,
            ease: "easeInOut"
          }
        });
        
        borderControls.start({
          ...borderPosition,
          transition: {
            duration: duration,
            ease: "easeInOut"
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
      }
    };
    
    animateBorderGlow();
  }, [borderControls, glowControls]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const copyToClipboard = () => {
    if (value) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  useEffect(() => {
    setCopied(false);
  }, [value]);

  const isDark = theme === 'dark';
  const glowColor = isDark ? "rgba(139, 92, 246, 0.6)" : "rgba(79, 70, 229, 0.4)";

  return (
    <motion.div 
      className="flex flex-col h-full rounded-xl overflow-hidden shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200/50 dark:border-gray-700/50 relative"
      style={{
        "--glow-color": glowColor,
        borderColor: "transparent"
      } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <motion.div 
        className="absolute bg-indigo-500/20 dark:bg-indigo-400/30 blur-xl rounded-full z-0"
        initial={{ opacity: 0 }}
        animate={glowControls}
      />
      
      <motion.div 
        className="flex flex-col h-full w-full rounded-xl overflow-hidden border-2 border-transparent z-10"
        animate={borderControls}
      >
        <div className="flex justify-between items-center py-2 px-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-md">
          <motion.h3 
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {title}
            <motion.span 
              className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
          </motion.h3>
          {readOnly && (
            <motion.button 
              onClick={copyToClipboard}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
              aria-label="Copy to clipboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : (
                <ClipboardCopy size={16} />
              )}
              {copied && (
                <span className="ml-1 text-xs text-green-500 dark:text-green-400">Copied!</span>
              )}
            </motion.button>
          )}
        </div>
        {readOnly ? (
          <div className="relative flex-grow overflow-auto p-1">
            <SyntaxHighlighter
              language={language}
              style={theme === 'dark' ? vscDarkPlus : vs}
              className="h-full !m-0 !py-2 !px-3 !font-mono !text-sm !bg-transparent rounded-lg"
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                background: 'transparent',
                fontSize: '0.85rem',
              }}
            >
              {value || placeholder}
            </SyntaxHighlighter>
          </div>
        ) : (
          <div className="relative flex-grow p-1">
            <textarea
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className="absolute inset-0 resize-none py-2 px-3 font-mono text-sm bg-transparent text-gray-800 dark:text-gray-200 w-full h-full focus:outline-none focus:ring-0 border-none"
              spellCheck={false}
              readOnly={readOnly}
            />
          </div>
        )}
        {error && (
          <motion.div 
            className="p-2 bg-red-100/80 dark:bg-red-900/80 text-red-800 dark:text-red-200 text-xs border-t border-red-200/50 dark:border-red-800/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CodeEditor; 