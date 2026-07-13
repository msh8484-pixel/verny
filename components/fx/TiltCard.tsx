"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function TiltCard({
  children,
  max = 7,
  scale = 1.02,
  style,
  className,
}: {
  children: ReactNode;
  max?: number;
  scale?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 150, damping: 16 });

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000, transformStyle: "preserve-3d", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
