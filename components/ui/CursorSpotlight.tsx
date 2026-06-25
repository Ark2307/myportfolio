"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, motion } from "framer-motion";

export default function CursorSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 180 };
  const spotX = useSpring(mouseX, springConfig);
  const spotY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden="true"
      style={{
        background: "transparent",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          left: spotX,
          top: spotY,
          x: "-50%",
          y: "-50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.07) 0%, rgba(59,130,246,0.03) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
