"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapContext<T extends HTMLElement>(
  animation: (scope: T) => void,
) {
  const scopeRef = useRef<T>(null);

  useEffect(() => {
    if (!scopeRef.current) {
      return;
    }

    const context = gsap.context(
      () => animation(scopeRef.current as T),
      scopeRef,
    );

    return () => context.revert();
  }, [animation]);

  return scopeRef;
}
