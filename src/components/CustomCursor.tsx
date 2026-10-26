"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      // Check if we are hovering over an interactive element
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a') || target.closest('button') || target.closest('input');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (pointer: fine) {
          body, a, button, input {
            cursor: none !important;
          }
        }
      `}} />
      <motion.div
        className="custom-cursor unselectable"
        animate={{
          x: position.x - (isHovering ? 20 : 6),
          y: position.y - (isHovering ? 20 : 6),
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'transparent' : 'var(--brand-gold)',
          border: isHovering ? '1px solid var(--brand-gold)' : 'none'
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 20, mass: 0.5 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? 40 : 12,
          height: isHovering ? 40 : 12,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference'
        }}
      />
    </>
  );
}
