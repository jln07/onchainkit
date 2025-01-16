import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { FocusTrap } from './FocusTrap';
import { DismissableLayer } from './DismissableLayer';

type DialogProps = {
  children: React.ReactNode;
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback when dialog should close (via escape/click-outside)
  modal?: boolean; // When true, prevents interaction with content behind the dialog
  initialFocus?: React.RefObject<HTMLElement>; // Element to focus when dialog opens
  // ARIA attributes for accessibility
  'aria-label'?: string; // Provides an accessible name when no visible title exists
  'aria-labelledby'?: string; // References the ID of the visible dialog title
  'aria-describedby'?: string; // References the ID of the dialog's description text
};

/**
 * Dialog component that handles:
 * - Portaling to document.body
 * - Focus management (trapping focus within dialog)
 * - Click outside and escape key dismissal
 * - Proper ARIA attributes for accessibility
 */
export function Dialog({
  children,
  isOpen,
  onClose,
  modal = true,
  initialFocus,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  if (!isOpen) {
    return null;
  }

  const dialog = (
    <FocusTrap active={isOpen} initialFocus={initialFocus}>
      <DismissableLayer onDismiss={onClose}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal={modal}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          {children}
        </div>
      </DismissableLayer>
    </FocusTrap>
  );

  // Portal the dialog to document.body to ensure proper stacking context
  return createPortal(dialog, document.body);
}
