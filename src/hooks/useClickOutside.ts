import { useEffect, RefObject } from 'react';

type Handler = (event: MouseEvent) => void;

function useClickOutside<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T>[],
  handler: Handler
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside all refs
      if (refs.every(ref => ref.current && !ref.current.contains(event.target as Node))) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, handler]);
}

export default useClickOutside;
