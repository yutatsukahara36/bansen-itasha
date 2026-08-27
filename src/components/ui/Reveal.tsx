"use client";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type Props = HTMLMotionProps<"div"> & { delay?: number; y?: number };

/** Scroll reveal via whileInView. Transform + opacity only, ease-out expo, no overshoot. */
export function Reveal({ delay = 0, y = 18, children, ...rest }: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
