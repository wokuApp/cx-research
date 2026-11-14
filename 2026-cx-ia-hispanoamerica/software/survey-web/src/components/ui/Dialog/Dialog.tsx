import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import {
  forwardRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Dialog - Full-screen modal dialog component
 *
 * Uses Base UI Dialog with custom styling.
 * Provides a backdrop overlay and centered panel.
 *
 * @example
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <Dialog.Trigger>
 *     <Button>Open Dialog</Button>
 *   </Dialog.Trigger>
 *   <Dialog.Content>
 *     <Dialog.Header>
 *       <Dialog.Title>Dialog Title</Dialog.Title>
 *       <Dialog.Close />
 *     </Dialog.Header>
 *     <Dialog.Description>Description text</Dialog.Description>
 *     <Dialog.Body>Content here</Dialog.Body>
 *     <Dialog.Footer>Footer actions</Dialog.Footer>
 *   </Dialog.Content>
 * </Dialog>
 */

// Root component - manages open state
type DialogRootProps = ComponentPropsWithoutRef<typeof BaseDialog.Root>;

const DialogRoot = ({ children, ...props }: DialogRootProps): ReactNode => {
  return <BaseDialog.Root {...props}>{children}</BaseDialog.Root>;
};

// Trigger component
type DialogTriggerProps = ComponentPropsWithoutRef<typeof BaseDialog.Trigger>;

const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, className, ...props }, ref): ReactNode => {
    return (
      <BaseDialog.Trigger ref={ref} className={className} {...props}>
        {children}
      </BaseDialog.Trigger>
    );
  }
);
DialogTrigger.displayName = 'Dialog.Trigger';

// Backdrop component
interface DialogBackdropProps {
  className?: string;
}

const DialogBackdrop = ({ className }: DialogBackdropProps): ReactNode => {
  return (
    <BaseDialog.Backdrop
      className={cn(
        'fixed inset-0 z-50',
        'bg-neutral-900/40',
        'transition-opacity duration-150',
        'data-starting-style:opacity-0',
        'data-ending-style:opacity-0',
        className
      )}
    />
  );
};

// Content component (Portal + Backdrop + Popup)
interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

const DialogContent = ({
  children,
  className,
}: DialogContentProps): ReactNode => {
  return (
    <BaseDialog.Portal>
      <DialogBackdrop />
      <BaseDialog.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'flex flex-col overflow-hidden rounded-lg bg-white shadow-lg',
          'w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-4rem)] sm:max-h-[calc(100dvh-4rem)]',
          'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
          className
        )}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
};

// Header component
interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

const DialogHeader = ({
  children,
  className,
}: DialogHeaderProps): ReactNode => {
  return (
    <div className={cn('flex flex-col gap-2 p-6 pb-0 shrink-0', className)}>
      {children}
    </div>
  );
};

// Title row with title and close button
interface DialogTitleRowProps {
  children: ReactNode;
  className?: string;
}

const DialogTitleRow = ({
  children,
  className,
}: DialogTitleRowProps): ReactNode => {
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {children}
    </div>
  );
};

// Title component
type DialogTitleProps = ComponentPropsWithoutRef<typeof BaseDialog.Title>;

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className, ...props }, ref): ReactNode => {
    return (
      <BaseDialog.Title
        ref={ref}
        className={cn(
          'text-lg font-bold text-neutral-900 leading-7',
          className
        )}
        {...props}
      >
        {children}
      </BaseDialog.Title>
    );
  }
);
DialogTitle.displayName = 'Dialog.Title';

// Close button component
interface DialogCloseProps {
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

const DialogClose = ({
  ariaLabel = 'Close dialog',
  className,
  disabled = false,
}: DialogCloseProps): ReactNode => {
  return (
    <BaseDialog.Close
      disabled={disabled}
      className={cn(
        'size-10 flex items-center justify-center',
        'text-neutral-600 hover:text-neutral-900',
        'transition-colors duration-150',
        'rounded-lg',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={ariaLabel}
    >
      <X className="size-4" />
    </BaseDialog.Close>
  );
};

// Description component
type DialogDescriptionProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Description
>;

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ children, className, ...props }, ref): ReactNode => {
  return (
    <BaseDialog.Description
      ref={ref}
      className={cn('text-base text-neutral-600 leading-6', className)}
      {...props}
    >
      {children}
    </BaseDialog.Description>
  );
});
DialogDescription.displayName = 'Dialog.Description';

// Body component
interface DialogBodyProps {
  children: ReactNode;
  className?: string;
}

const DialogBody = ({ children, className }: DialogBodyProps): ReactNode => {
  return (
    <div className={cn('flex-1 min-h-0 overflow-auto p-6', className)}>
      {children}
    </div>
  );
};

// Footer component
interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

const DialogFooter = ({
  children,
  className,
}: DialogFooterProps): ReactNode => {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 p-6 pt-0 shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
};

// Compose Dialog with sub-components
export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  TitleRow: DialogTitleRow,
  Title: DialogTitle,
  Close: DialogClose,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter,
});

export type { DialogRootProps, DialogContentProps, DialogTitleProps };
