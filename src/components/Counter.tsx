import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, useTransform, motion } from 'motion/react';

interface CounterProps {
  value: string;
  className?: string;
}

export default function Counter({ value, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Extract number and suffix
  const numericPart = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '');
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  
  const displayValue = useTransform(springValue, (latest) => {
    // Determine precision based on input
    const precision = value.includes('.') ? 1 : 0;
    return latest.toFixed(precision);
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(numericPart);
    }
  }, [isInView, motionValue, numericPart]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}
