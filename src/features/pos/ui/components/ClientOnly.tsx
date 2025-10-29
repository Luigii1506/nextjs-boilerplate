"use client";
/**
 * Client Only Wrapper
 * ===================
 *
 * Ensures children only render on client-side
 * Prevents SSR/hydration issues with Zustand stores
 *
 * @module pos/ui/components/ClientOnly
 */

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
