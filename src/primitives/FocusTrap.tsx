import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

// FocusTrap ensures keyboard focus remains within a contained area for accessibility
export function FocusTrap({
  children,
  active = true,
  initialFocus,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    } 

    // Store currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Set focus priority: 1) initialFocus ref, 2) first focusable element
    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else if (containerRef.current) {
      // Query all interactive elements that can receive focus
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }

    return () => {
      // Restore focus to previous element when trap is destroyed
      previousFocusRef.current?.focus();
    };
  }, [active, initialFocus]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!active) {
      return;
    } 

    // Create circular tab navigation within the trapped area
    if (event.key === 'Tab') {
      const focusableElements =
        containerRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}
