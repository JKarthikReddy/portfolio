"use client";

import { useReducedMotion } from "motion/react";
import CountUp from "@/components/bits/CountUp";

interface StatValueProps {
  value: number;
  decimals?: number;
  suffix: string;
}

// CountUp has no `decimals` prop of its own: it infers decimal places from
// the string representation of `to`, which already matches every stat's
// intended precision (8.64 -> 2, 50 -> 0, ...). The `decimals` field from
// content.ts is only needed here, for the plain reduced-motion fallback.
export function StatValue({ value, decimals = 0, suffix }: StatValueProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <>
        {value.toFixed(decimals)}
        {suffix}
      </>
    );
  }

  return (
    <>
      <CountUp to={value} duration={1.2} />
      {suffix}
    </>
  );
}
