"use client";

import { useEffect, useState } from "react";

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to prevent hydration mismatches by only rendering content on the client.
 * This is specifically useful for components that might be affected by browser extensions
 * or other client-side only behaviors.
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}