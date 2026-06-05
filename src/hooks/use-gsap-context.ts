"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapContext<T extends HTMLElement>(
  animation: (scope: T) => void | (() => void),
) {
  const scopeRef = useRef<T>(null);

  useEffect(() => {
    if (!scopeRef.current) {
      return;
    }

    let animationCleanup: void | (() => void);
    const context = gsap.context(() => {
      animationCleanup = animation(scopeRef.current as T);
    }, scopeRef);

    return () => {
      animationCleanup?.();
      context.revert();
    };
  }, [animation]);

  return scopeRef;
}
