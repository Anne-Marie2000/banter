import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export default function useContinue(action: () => void, enabled = true) {
  useFocusEffect(useCallback(() => {
    function key(event: KeyboardEvent) {
      if (!enabled || event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.isComposing || event.repeat || event.defaultPrevented) return;
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest('button, a, [role="button"]');
      // Keep normal keyboard activation for Back and other action buttons.
      if (control && !control.hasAttribute('aria-selected') && !control.hasAttribute('aria-pressed')) return;
      if (target?.closest('[contenteditable="true"]')) return;
      event.preventDefault();
      event.stopPropagation();
      action();
    }
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }, [action, enabled]));
}
