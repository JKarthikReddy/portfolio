"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";

type Fallback = { children: ReactNode; fallback?: ReactNode; onFail?: () => void };

/**
 * WebGL context creation fails on machines with no GPU, a blocklisted driver, or
 * hardware acceleration switched off. The vendored canvas bits log "unable to
 * create webgl context" and then dereference the null context, and that throw
 * happens inside React's commit phase: with no boundary it escalates to the root
 * and Next swaps the entire page for its error shell, so a visitor without WebGL
 * gets a blank document instead of the site.
 */
class Catch extends Component<Fallback, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail?.();
  }

  render() {
    return this.state.failed ? this.props.fallback ?? null : this.props.children;
  }
}

/**
 * Wraps a WebGL canvas so a dead context degrades to `fallback` (nothing, by
 * default) instead of taking the page down.
 *
 * `defer` additionally holds the canvas unmounted until it scrolls near the
 * viewport. Every canvas costs a GL context and a requestAnimationFrame loop
 * from first paint, which is pure blocking time when it is three screens down
 * and nobody can see it. While deferred the wrapper renders the same fallback
 * inside a placeholder box, so `placeholderClassName` has to reproduce the
 * canvas's own footprint or the observer gets a zero-area target. `margin` is
 * the IntersectionObserver rootMargin: raise it for a canvas whose remount is
 * expensive enough to show as blank frames when the visitor scrolls back.
 */
export function WebGLBoundary({
  children,
  fallback = null,
  onFail,
  defer = false,
  placeholderClassName,
  margin = "300px",
}: Fallback & { defer?: boolean; placeholderClassName?: string; margin?: string }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(!defer);

  // Two-way visibility: the canvas mounts when its host scrolls within 300px of
  // the viewport and UNMOUNTS again when it leaves, releasing the GL context and
  // its requestAnimationFrame loop. One full scroll used to leave every canvas
  // on the page running at once; sustained GPU load is what heats laptops, not
  // load-time cost. The zero-size anchor span stays mounted either way, and the
  // observed element is its parent (the section or cell hosting the decoration),
  // which always has real geometry regardless of mount state.
  useEffect(() => {
    const anchor = anchorRef.current;
    // No IntersectionObserver (or no layout yet) should never mean "no canvas".
    if (!anchor || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const target = anchor.parentElement ?? anchor;
    const io = new IntersectionObserver(
      ([entry]) => {
        setNear(entry.isIntersecting);
      },
      { rootMargin: margin },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [margin]);

  return (
    <>
      <span ref={anchorRef} hidden aria-hidden="true" />
      {near ? (
        <Catch fallback={fallback} onFail={onFail}>{children}</Catch>
      ) : (
        <div aria-hidden="true" className={placeholderClassName}>
          {fallback}
        </div>
      )}
    </>
  );
}

export default WebGLBoundary;
