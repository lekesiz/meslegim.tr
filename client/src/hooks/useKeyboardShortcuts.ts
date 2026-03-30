import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && altMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

// Pre-built navigation shortcuts for dashboard
export function useDashboardShortcuts() {
  const [, setLocation] = useLocation();

  useKeyboardShortcuts([
    {
      key: 'h',
      alt: true,
      action: () => setLocation('/'),
      description: 'Ana sayfaya git',
    },
    {
      key: 'd',
      alt: true,
      action: () => setLocation('/dashboard'),
      description: 'Dashboard\'a git',
    },
    {
      key: 'p',
      alt: true,
      action: () => setLocation('/fiyatlandirma'),
      description: 'Fiyatlandırma sayfasına git',
    },
    {
      key: 'n',
      alt: true,
      action: () => {
        // Toggle notification bell
        const bell = document.querySelector('[data-notification-bell]') as HTMLButtonElement;
        if (bell) bell.click();
      },
      description: 'Bildirimleri aç/kapat',
    },
  ]);
}
