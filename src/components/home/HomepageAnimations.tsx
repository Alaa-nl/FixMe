"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  variant: "hero-left" | "hero-right" | "stagger";
  index?: number;
}

// Animation presets for homepage sections
const variants = {
  "hero-left": {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  },
  "hero-right": {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 } },
  },
  stagger: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  },
};

export default function HomepageAnimations({ children, variant, index = 0 }: Props) {
  const motionVariant = variants[variant];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={motionVariant}
      transition={variant === "stagger" ? { delay: index * 0.1 } : undefined}
    >
      {children}
    </motion.div>
  );
}
