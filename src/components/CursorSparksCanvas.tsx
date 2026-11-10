import { useEffect, useRef } from 'react';

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isAmbient?: boolean;
}

const SPARK_COLORS = [
  '34, 211, 238', // subtle cyan
  '34, 211, 238', // weighted cyan
  '59, 130, 246', // electric blue
  '96, 165, 250', // soft blue
  '139, 92, 246', // occasional violet
];

export function CursorSparksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      return;
    }

    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const isMobileOrTouch = coarsePointerQuery.matches;
    const cpuCores = navigator.hardwareConcurrency ?? 4;
    const isLowPowerDevice = cpuCores <= 4;

    const maxParticles = isMobileOrTouch ? 14 : isLowPowerDevice ? 28 : 42;
    const allowConnections = !isMobileOrTouch && !isLowPowerDevice;
    const connectionDistSq = 68 * 68;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let rafId: number | null = null;
    let lastMouseX = -999;
    let lastMouseY = -999;
    let lastSpawnTime = 0;

    const particles: SparkParticle[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const pickColor = () =>
      SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

    const initMobileAmbient = () => {
      particles.length = 0;
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18 - 0.06,
          size: Math.random() * 1.6 + 0.8,
          alpha: Math.random() * 0.35 + 0.12,
          decay: 0,
          color: pickColor(),
          isAmbient: true,
        });
      }
    };

    const spawnCursorSparks = (x: number, y: number, distance: number) => {
      const count = distance > 28 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        if (particles.length >= maxParticles) {
          particles.shift();
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.55 + 0.12;
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.12,
          size: Math.random() * 1.5 + 0.9,
          alpha: Math.random() * 0.35 + 0.4,
          decay: Math.random() * 0.014 + 0.015,
          color: pickColor(),
        });
      }
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.isAmbient) {
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        } else {
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.alpha -= p.decay;
          if (p.alpha <= 0.015) {
            particles.splice(i, 1);
            continue;
          }
        }

        // Subtle connecting lines between nearby sparks
        if (allowConnections && !p.isAmbient) {
          for (let j = i - 1; j >= 0; j--) {
            const other = particles[j];
            if (other.isAmbient) continue;
            const dx = p.x - other.x;
            const dy = p.y - other.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < connectionDistSq) {
              const lineAlpha =
                (1 - distSq / connectionDistSq) *
                Math.min(p.alpha, other.alpha) *
                0.22;
              if (lineAlpha > 0.01) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = `rgba(96, 165, 250, ${lineAlpha.toFixed(3)})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
              }
            }
          }
        }

        // Soft spark core + delicate halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${(p.alpha * 0.14).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha.toFixed(3)})`;
        ctx.fill();
      }

      if (particles.length > 0) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        rafId = null;
      }
    };

    const ensureLoopRunning = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isMobileOrTouch || e.pointerType === 'touch') return;
      const now = performance.now();
      if (now - lastSpawnTime < 22) return;

      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      const distance = Math.hypot(dx, dy);

      if (lastMouseX < 0 || distance > 4) {
        spawnCursorSparks(e.clientX, e.clientY, distance);
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastSpawnTime = now;
        ensureLoopRunning();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden && isMobileOrTouch) {
        ensureLoopRunning();
      }
    };

    if (isMobileOrTouch) {
      initMobileAmbient();
      ensureLoopRunning();
    } else {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        particles.length = 0;
        ctx.clearRect(0, 0, width, height);
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}

