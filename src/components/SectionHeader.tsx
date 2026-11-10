import { motion } from 'framer-motion';
import { fadeSlideUp, viewportOnce } from '@/animations/motionPresets';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <motion.header
      variants={fadeSlideUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)', maxWidth: '720px' }}
    >
      <div
        className="font-mono"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          fontSize: '0.75rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent-cyan)',
          marginBottom: '0.7rem',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: '18px',
            height: '1px',
            background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
          }}
        />
        {eyebrow}
      </div>
      <h2
        className="font-display text-gradient-subtle"
        style={{
          margin: 0,
          fontSize: 'clamp(1.75rem, 3.2vw, 2.55rem)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            margin: '0.85rem 0 0',
            color: 'var(--text-secondary)',
            fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)',
            lineHeight: 1.65,
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.header>
  );
}

