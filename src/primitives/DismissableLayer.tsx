import React, { useEffect, useRef } from 'react';

type DismissableLayerProps = {
  children: React.ReactNode;
  onDismiss?: () => void;
  disableOutsideClick?: boolean;
  disableEscapeKey?: boolean;
  className?: string;
};

// DismissableLayer handles handles dismissal using outside clicks and escape key events
export function DismissableLayer({
  children,
  onDismiss,
  disableOutsideClick = false,
  disableEscapeKey = false,
  className,
}: DismissableLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  // Tracks if pointer events started inside the layer to handle nested layers correctly
  const isPointerInsideReactTreeRef = useRef(false);

  useEffect(() => {
    if (disableEscapeKey) {
      return;
    } 

    // Handle Escape key dismissal
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onDismiss) {
        onDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disableEscapeKey, onDismiss]);

  useEffect(() => {
    if (disableOutsideClick) {
      return;
    }

    // Handle clicks outside the layer using pointer events for better cross-device support
    const handlePointerDown = (event: PointerEvent) => {
      if (!isPointerInsideReactTreeRef.current) {
        const target = event.target as Node;
        if (layerRef.current && !layerRef.current.contains(target)) {
          onDismiss?.();
        }
      }
      isPointerInsideReactTreeRef.current = false;
    };

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [disableOutsideClick, onDismiss]);

  return (
    <div
      ref={layerRef}
      className={className}
      data-testid="dismissable-layer"
      // Track pointer events in capture phase for reliable nested layer handling
      onPointerDownCapture={() => {
        isPointerInsideReactTreeRef.current = true;
      }}
    >
      {children}
    </div>
  );
}
