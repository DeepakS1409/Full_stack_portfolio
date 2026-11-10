import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroThreeScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = motionQuery.matches;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      // Graceful fallback if WebGL context is unavailable
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 460;
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const group = new THREE.Group();
    scene.add(group);

    // Outer subtle wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.55, 1);
    const wireGeo = new THREE.WireframeGeometry(icoGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.24,
    });
    const wireframeMesh = new THREE.LineSegments(wireGeo, wireMat);
    group.add(wireframeMesh);

    // Vertex constellation points
    const pointsMat = new THREE.PointsMaterial({
      color: 0xa78bfa,
      size: 0.055,
      transparent: true,
      opacity: 0.72,
    });
    const pointsMesh = new THREE.Points(icoGeo, pointsMat);
    group.add(pointsMesh);

    // Inner core wireframe
    const innerGeo = new THREE.OctahedronGeometry(0.78, 0);
    const innerWireGeo = new THREE.WireframeGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.28,
    });
    const innerMesh = new THREE.LineSegments(innerWireGeo, innerMat);
    group.add(innerMesh);

    // Thin orbital ring
    const ringGeo = new THREE.TorusGeometry(2.05, 0.008, 8, 72);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.22,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.36;
    ringMesh.rotation.y = Math.PI * 0.14;
    group.add(ringMesh);

    let targetRotX = 0;
    let targetRotY = 0;
    let isVisible = true;
    let rafId: number | null = null;
    const clock = new THREE.Clock();

    const handlePointerMove = (e: PointerEvent) => {
      if (reducedMotion) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 0.45;
      const ny = (e.clientY / window.innerHeight - 0.5) * 0.35;
      targetRotY = nx;
      targetRotX = ny;
    };

    const renderOnce = () => {
      renderer?.render(scene, camera);
    };

    const animate = () => {
      if (!isVisible || document.hidden || !renderer) {
        rafId = null;
        return;
      }

      const elapsed = clock.getElapsedTime();
      wireframeMesh.rotation.y = elapsed * 0.14;
      wireframeMesh.rotation.x = elapsed * 0.08;
      pointsMesh.rotation.copy(wireframeMesh.rotation);

      innerMesh.rotation.y = -elapsed * 0.22;
      innerMesh.rotation.z = elapsed * 0.12;
      ringMesh.rotation.z = elapsed * 0.09;

      group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.04;

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (reducedMotion) {
        renderOnce();
        return;
      }
      if (rafId === null && isVisible && !document.hidden) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = Boolean(entry?.isIntersecting);
        if (isVisible) {
          startLoop();
        } else if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (reducedMotion) renderOnce();
    };

    const handleVisibility = () => {
      if (!document.hidden && isVisible) {
        startLoop();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    startLoop();

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);

      icoGeo.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      pointsMat.dispose();
      innerGeo.dispose();
      innerWireGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer?.dispose();
      if (renderer?.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.9,
      }}
    />
  );
}

