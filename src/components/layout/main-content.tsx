'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from './layout-provider';

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { isSidebarCollapsed } = useLayout();

  return (
    <main 
      className={cn(
        "min-h-screen transition-all duration-300 ease-out",
        isSidebarCollapsed ? "ml-[72px]" : "ml-64"
      )}
    >
      {children}
    </main>
  );
}


