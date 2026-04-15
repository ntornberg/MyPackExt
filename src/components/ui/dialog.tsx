import * as React from "react"
import { useComposedRefs } from "@radix-ui/react-compose-refs"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { getExtensionOverlayPortalContainer } from "@/utils/dom"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

type DialogContentExtendedProps = React.ComponentProps<
  typeof DialogPrimitive.Content
> & {
  showCloseButton?: boolean
  container?: HTMLElement | null
  side?: "center" | "right"
  /** Merged into the overlay (e.g. higher z-index for a dialog opened inside another dialog). */
  overlayClassName?: string
  /**
   * Invoked when the dimmed overlay receives a direct pointer hit (target === overlay).
   * Use with controlled `open` to close; helps when `modal={false}` disables Radix outside dismiss.
   */
  onOverlayPointerDown?: React.PointerEventHandler<HTMLDivElement>
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentExtendedProps
>(function DialogContent(
  {
    className,
    children,
    showCloseButton = true,
    container,
    side = "center",
    overlayClassName,
    onOverlayPointerDown,
    onPointerDownOutside,
    ...props
  },
  forwardedRef,
) {
  const portalContainer =
    container ?? getExtensionOverlayPortalContainer()

  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const composedRef = useComposedRefs(forwardedRef, contentRef)

  const handlePointerDownOutside = React.useCallback<
    NonNullable<DialogContentExtendedProps["onPointerDownOutside"]>
  >(
    (event) => {
      onPointerDownOutside?.(event)
      if (event.defaultPrevented) {
        return
      }
      // Native scrollbars often skip React's pointer capture on the content node, so Radix
      // treats the press as "outside" even when the scrollbar belongs to this dialog.
      const { clientX, clientY } = event.detail.originalEvent
      const root = contentRef.current
      if (!root) {
        return
      }
      const top = document.elementFromPoint(clientX, clientY)
      if (top && root.contains(top)) {
        event.preventDefault()
      }
    },
    [onPointerDownOutside],
  )

  return (
    <DialogPortal container={portalContainer}>
      <DialogOverlay
        className={overlayClassName}
        onPointerDown={onOverlayPointerDown}
      />
      <DialogPrimitive.Content
        ref={composedRef}
        data-slot="dialog-content"
        className={cn(
          "pointer-events-auto fixed z-50 bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          side === "center" &&
            "top-1/2 left-1/2 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 sm:max-w-sm data-open:zoom-in-95 data-closed:zoom-out-95",
          side === "right" &&
            "top-0 right-0 bottom-0 left-auto flex h-full max-h-[100dvh] w-[min(100vw,380px)] max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none rounded-l-2xl border-l border-border p-0 shadow-lg data-open:slide-in-from-right data-closed:slide-out-to-right",
          className
        )}
        onPointerDownOutside={handlePointerDownOutside}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
