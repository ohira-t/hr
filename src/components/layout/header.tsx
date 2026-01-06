'use client';

import { Bell, Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  actions?: ReactNode;
}

export function Header({ title, subtitle, searchQuery = '', onSearchChange, showSearch = true, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/60 bg-white/80 px-8 glass-effect">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="ID・クライアント名・エリアで検索..."
              className="h-9 w-72 rounded-full border border-gray-200 bg-gray-50/50 pl-9 pr-9 text-sm transition-all duration-200 placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/5"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Custom Actions */}
        {actions}

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-gray-100"
        >
          <Bell className="h-4 w-4 text-gray-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* User */}
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90"
        >
          <User className="h-4 w-4 text-white" />
        </Button>
      </div>
    </header>
  );
}

