import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cardEntrance, viewportOnce } from '@/animations/motionPresets';

interface GlassCardProps extends HTMLMotionProps<'article'> {
  children: ReactNode;
  className?: string;
  accent?: 'cyan' | 'blue' | 'violet' | 'none';
  animateOnScroll?: boolean;
}

export function GlassCard({
  children,
  className = '',
  accent = 'cyan',
  animateOnScroll = true,
  ...rest
}: GlassCardProps) {
  const accentGlow =
    accent === 'cyan'
      ? 'rgba(34, 211, 238, 0.08)'
      : accent === 'blue'
        ? 'rgba(59, 130, 246, 0.08)'
        : accent === 'violet'
          ? 'rgba(139, 92, 246, 0.08)'
          : 'transparent';

  return (
    <motion.article
      className={`glass-card glass-card-${accent} ${className}`}
      style={{
        overflow: 'hidden',
        ...rest.style,
      }}
      variants={animateOnScroll ? cardEntrance : undefined}
      initial={animateOnScroll ? 'hidden' : undefined}
      whileInView={animateOnScroll ? 'visible' : undefined}
      viewport={animateOnScroll ? viewportOnce : undefined}
      {...rest}
    >
      {accent !== 'none' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '180px',
            height: '180px',
            background: `radial-gradient(circle at top right, ${accentGlow}, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </motion.article>
  );
}
